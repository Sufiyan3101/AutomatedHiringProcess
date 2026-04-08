from fastapi import FastAPI
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
import google.generativeai as genai

load_dotenv()

app = FastAPI()

# ── Firebase setup ──────────────────────────────────────────────────────────
FIREBASE_ADMIN = json.loads(os.getenv("FIREBASE_ADMIN_SDK"))

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_ADMIN)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ── Gemini setup ─────────────────────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3-flash-preview ")

# ── Core matching function ───────────────────────────────────────────────────
def run_ai_matching():
    print(f"[{datetime.now()}] Running AI matching check...")

    companies_ref = db.collection("companies").stream()

    for company in companies_ref:
        company_id = company.id
        forms_ref = db.collection("companies").document(company_id).collection("forms").stream()

        for form in forms_ref:
            form_id = form.id
            form_data = form.to_dict()

            # ── Check if form is expired and not yet processed ──
            end_date = form_data.get("endDate")
            status = form_data.get("status")

            if not end_date or status == "processed":
                continue

            # Convert Firestore Timestamp to datetime
            if hasattr(end_date, "tzinfo"):
                end_dt = end_date
            else:
                end_dt = end_date.replace(tzinfo=timezone.utc)

            now = datetime.now(timezone.utc)

            if now <= end_dt:
                continue  # form not expired yet

            print(f"Processing expired form: {form_id} - {form_data.get('title')}")

            # ── Fetch all applications for this form ──
            apps_ref = (
                db.collection("companies")
                .document(company_id)
                .collection("forms")
                .document(form_id)
                .collection("applications")
                .stream()
            )

            applicants = []
            for app_doc in apps_ref:
                app_data = app_doc.to_dict()
                applicant_data = app_data.get("applicantData", {})

                # Build readable answer string
                answers = []
                for field_id, field_info in applicant_data.items():
                    if isinstance(field_info, dict):
                        label = field_info.get("label", field_id)
                        value = field_info.get("value", "")
                        if value:
                            answers.append(f"{label}: {value}")

                applicants.append({
                    "id": app_doc.id,
                    "email": app_data.get("applicantEmail", ""),
                    "answers": "\n".join(answers),
                })

            if not applicants:
                print(f"No applicants for form {form_id}, skipping.")
                # Mark as processed so we don't check again
                db.collection("companies").document(company_id)\
                  .collection("forms").document(form_id)\
                  .update({"status": "processed"})
                continue

            # ── Build prompt ──
            job_title = form_data.get("title", "")
            job_description = form_data.get("description", "")
            fields = form_data.get("fields", [])
            field_labels = [f.get("label") for f in fields if f.get("label")]

            applicants_text = ""
            for i, applicant in enumerate(applicants):
                applicants_text += f"""
                    Applicant {i + 1}:
                    ID: {applicant['id']}
                    Email: {applicant['email']}
                    Answers:
                    {applicant['answers']}
                    ---"""

            prompt = f"""
                You are an expert HR recruiter. Your job is to rank applicants for a job role.

                Job Title: {job_title}
                Job Description: {job_description}
                Form Questions Asked: {', '.join(field_labels)}

                Here are all the applicants:
                {applicants_text}

                Based on their answers, select the TOP 3 best matching applicants for this role.
                For each, provide:
                1. Their Applicant ID (exact)
                2. Their Email
                3. A match score out of 10
                4. 2-3 sentence reason why they are a good fit

                Respond in this exact JSON format:
                {{
                  "top3": [
                    {{
                      "applicantId": "...",
                      "email": "...",
                      "score": 8,
                      "reason": "..."
                    }},
                    {{
                      "applicantId": "...",
                      "email": "...",
                      "score": 7,
                      "reason": "..."
                    }},
                    {{
                      "applicantId": "...",
                      "email": "...",
                      "score": 6,
                      "reason": "..."
                    }}
                  ]
                }}
                Only return valid JSON, no extra text.
                """

            # ── Call Gemini ──
            try:
                response = model.generate_content(prompt)
                raw = response.text.strip()

                # Strip markdown code block if present
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]

                result = json.loads(raw.strip())
                top3 = result.get("top3", [])

                print(f"Top 3 for form {form_id}: {top3}")

                # ── Save results to Firestore ──
                db.collection("companies").document(company_id)\
                  .collection("forms").document(form_id)\
                  .update({
                      "status": "processed",
                      "aiResults": top3,
                      "processedAt": firestore.SERVER_TIMESTAMP,
                  })

                print(f"Saved AI results for form {form_id}")

            except Exception as e:
                print(f"Gemini error for form {form_id}: {e}")

# ── Scheduler — runs every hour ──────────────────────────────────────────────
scheduler = BackgroundScheduler()
scheduler.add_job(run_ai_matching, "interval", hours=1)
scheduler.start()

# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "HireSenseAI backend running"}

@app.get("/run-matching")
def trigger_matching():
    # Manual trigger for testing — hit this endpoint to run immediately
    run_ai_matching()
    return {"status": "Matching complete"}

@app.get("/results/{company_id}/{form_id}")
def get_results(company_id: str, form_id: str):
    form_ref = db.collection("companies").document(company_id).collection("forms").document(form_id).get()
    if form_ref.exists:
        data = form_ref.to_dict()
        return {
            "title": data.get("title"),
            "status": data.get("status"),
            "aiResults": data.get("aiResults", []),
        }
    return {"error": "Form not found"}