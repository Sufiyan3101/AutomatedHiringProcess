import resend
import os
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

def send_applicant_confirmation(applicant_email: str, applicant_name: str, job_title: str):
    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": applicant_email,
        "subject": f"Application Received — {job_title}",
        "html": f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px;">
          <div style="background: #064e3b; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Application Received ✅</h1>
          </div>
          <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 15px;">Hi <strong>{applicant_name}</strong>,</p>
            <p style="color: #374151; font-size: 15px;">
              Thank you for applying for the <strong>{job_title}</strong> position. 
              Your application has been successfully submitted.
            </p>
            <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="color: #065f46; margin: 0; font-size: 14px;">
                The HR team will review your application and get back to you soon.
              </p>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
              Best of luck! 🚀<br/>
              <strong>Team HireSense</strong>
            </p>
          </div>
        </div>
        """
    })

def send_hr_notification(
    hr_email: str,
    applicant_name: str,
    applicant_email: str,
    job_title: str,
    application_id: str
):
    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": hr_email,
        "subject": f"New Application — {applicant_name} applied for {job_title}",
        "html": f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 32px;">
          <div style="background: #064e3b; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">New Application Received 📥</h1>
          </div>
          <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 15px;">A new application has been submitted for <strong>{job_title}</strong>.</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Applicant Name</td>
                  <td style="padding: 6px 0;"><strong>{applicant_name}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Email</td>
                  <td style="padding: 6px 0;">{applicant_email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Applied For</td>
                  <td style="padding: 6px 0;">{job_title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Application ID</td>
                  <td style="padding: 6px 0; font-family: monospace; font-size: 12px;">{application_id}</td>
                </tr>
              </table>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 8px;">
              Log in to your HireSenseAI dashboard to review this application.
            </p>

            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
              — Team HireSenseAI
            </p>
          </div>
        </div>
        """
    })