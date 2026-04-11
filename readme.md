# HireSenseAI 🤖

> An end-to-end AI-powered hiring platform that lets companies build custom job application forms, collect applicant responses, and automatically rank the top candidates using Gemini AI — once the application window closes.

---

## 🌐 Live Demo

🔗 [HireSenseAI Live](https://hiresenseai-skdp.onrender.com)

---

## 💡 What is HireSenseAI?

HireSenseAI is a full-stack hiring automation platform built for companies that want a smarter, faster way to shortlist candidates.

Instead of manually reading through dozens of applications, companies simply:
1. Build a custom job form (like Google Forms, but for hiring)
2. Share the public link with applicants
3. Wait for the form to expire
4. Let the AI automatically rank the top 3 candidates based on their answers vs the job description

No manual screening. No spreadsheets. Just results.

---

## 🔥 Features

### For Companies
- 🔐 Firebase Authentication (Email + Google Sign-In)
- 🏢 Company profile setup on first login
- 📋 Custom form builder — 11 field types (short text, paragraph, dropdown, multiple choice, checkboxes, file upload, date, number, email, phone, yes/no)
- 📅 Form scheduling with start & end dates
- 📄 Job description document upload via Cloudinary
- 📊 Dashboard showing all forms with live status (Active / Upcoming / Expired / Inactive)
- 👁️ View all applicants per form with their full responses
- ✏️ Edit and delete forms

### For Applicants
- 🌐 Public apply page — no account needed
- 🔄 Dynamic form rendering based on company's custom fields
- ✅ Required field validation before submission
- 🚫 Duplicate email detection — one application per email per form
- 📧 Confirmation email sent automatically on submission

### AI Matching (Backend)
- ⏰ APScheduler checks every hour for expired forms
- 🤖 Gemini 1.5 Flash reads the job description + all applicant answers
- 🏆 Returns top 3 ranked candidates with match score (out of 10) and reason
- 💾 Results saved back to Firestore under the form document
- 📬 HR gets notified via email when AI matching completes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Authentication | Firebase Auth |
| Database | Firestore (Firebase) |
| File Storage | Cloudinary |
| Backend | FastAPI (Python) |
| AI Model | Google Gemini 1.5 Flash |
| Email | Resend |
| Scheduler | APScheduler |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render |

---

## 🗂️ Project Structure

```
HireSenseAI/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateForm.jsx
│   │   │   ├── EditForm.jsx
│   │   │   ├── Apply.jsx
│   │   │   ├── ApplicantList.jsx
│   │   │   ├── ApplicantDetail.jsx
│   │   │   └── CompanyDetails.jsx
│   │   ├── firebase/
│   │   │   └── firebase.js
│   │   └── App.jsx
│   └── package.json
│
└── backend/                   # FastAPI + Python
    ├── main.py                # API routes + APScheduler
    ├── email_service.py       # Resend email functions
    ├── requirements.txt
    └── .env
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Firebase project
- Cloudinary account
- Resend account
- Google AI Studio API key (Gemini)

### Frontend Setup

```bash
git clone https://github.com/yourusername/HireSenseAI.git
cd HireSenseAI/frontend
npm install
```

Create `.env` in `/frontend`:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

```bash
npm run dev
```

### Backend Setup

```bash
cd HireSenseAI/backend
pip install -r requirements.txt
```

Create `.env` in `/backend`:
```
FIREBASE_ADMIN_SDK={"type":"service_account",...}
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

```bash
uvicorn main:app --reload
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/run-matching` | Manually trigger AI matching |
| POST | `/notify-application` | Send confirmation + HR notification emails |
| GET | `/results/{company_id}/{form_id}` | Get AI matching results for a form |

---

## 🧠 How AI Matching Works

```
Form expires (endDate < now)
        ↓
Backend fetches all applicant answers for that form
        ↓
Builds a structured prompt with job description + all answers
        ↓
Sends to Gemini 1.5 Flash
        ↓
Gemini returns top 3 candidates with score + reason (JSON)
        ↓
Results saved to Firestore → displayed on Dashboard
```

---

## 📊 Firestore Data Structure

```
companies/
  {userId}/
    companyName, industry, city, country...
    forms/
      {formId}/
        title, description, fields[], startDate, endDate,
        status, documentURL, aiResults[], hrEmail
        applications/
          {applicationId}/
            applicantData{}, applicantEmail,
            status, submittedAt
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

## 👤 Author

**👋 Connect with Me**
- GitHub: [@Sufiyan3101](https://github.com/Sufiyan3101)
- LinkedIn: [Khan Sufiyan](https://www.linkedin.com/in/khansufiyann/)

---

> Built with ❤️ to make hiring smarter, not harder.