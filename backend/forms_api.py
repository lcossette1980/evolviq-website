"""
Forms API - Handles all form submissions including service intake
CRITICAL: This ensures form data is properly stored and not lost
"""

from fastapi import HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import uuid
from firebase_admin import firestore
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import json

logger = logging.getLogger(__name__)

# Initialize Firestore
db = firestore.client()

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@evolviq.com")
NOTIFICATION_EMAILS = os.getenv("NOTIFICATION_EMAILS", ADMIN_EMAIL).split(",")

# Form Models
class ContactFormData(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    message: str = Field(..., min_length=1, max_length=5000)
    source: Optional[str] = "website"
    
    @validator('phone')
    def validate_phone(cls, v):
        if v:
            # Basic phone validation
            cleaned = ''.join(filter(str.isdigit, v))
            if len(cleaned) < 10 or len(cleaned) > 15:
                raise ValueError('Invalid phone number')
        return v

class ServiceIntakeForm(BaseModel):
    # Contact Information
    company_name: str = Field(..., min_length=1, max_length=200)
    contact_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    website: Optional[str] = Field(None, max_length=500)
    
    # Company Details
    industry: str = Field(..., min_length=1, max_length=100)
    company_size: str = Field(..., pattern="^(1-10|11-50|51-200|201-500|500+)$")
    annual_revenue: Optional[str] = None
    
    # AI Readiness
    current_ai_usage: str = Field(..., min_length=1, max_length=2000)
    ai_goals: str = Field(..., min_length=1, max_length=2000)
    biggest_challenges: str = Field(..., min_length=1, max_length=2000)
    
    # Service Interest
    services_interested: List[str] = Field(..., min_items=1)
    timeline: str = Field(..., pattern="^(immediate|1-3months|3-6months|6months+)$")
    budget_range: Optional[str] = Field(None, pattern="^(under10k|10k-50k|50k-100k|100k+|not_sure)$")
    
    # Additional Information
    additional_info: Optional[str] = Field(None, max_length=5000)
    how_heard_about_us: Optional[str] = Field(None, max_length=200)
    
    # Consent
    consent_to_contact: bool = Field(..., description="Must consent to be contacted")
    subscribe_to_newsletter: bool = Field(default=False)

class FormSubmission(BaseModel):
    """Generic form submission tracking"""
    id: str
    form_type: str
    data: Dict[str, Any]
    submitted_at: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    status: str = "pending"  # pending, processed, contacted, closed
    notes: Optional[List[Dict[str, str]]] = []  # Admin notes

class FormsAPI:
    """Handles all form submissions and storage"""
    
    def __init__(self):
        self.collection = 'form_submissions'
        logger.info("✅ Forms API initialized")
    
    async def _send_notification_email(self, form_type: str, form_data: Dict[str, Any], submission_id: str):
        """Send email notification for new form submission"""
        try:
            if not SMTP_USER or not SMTP_PASSWORD:
                logger.warning("Email credentials not configured")
                return
            
            # Create email message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"New {form_type} Form Submission - {submission_id[:8]}"
            msg['From'] = SMTP_USER
            msg['To'] = ", ".join(NOTIFICATION_EMAILS)
            
            # Create HTML email body
            html_body = f"""
            <html>
                <body>
                    <h2>New {form_type} Form Submission</h2>
                    <p><strong>Submission ID:</strong> {submission_id}</p>
                    <p><strong>Submitted at:</strong> {datetime.now().isoformat()}</p>
                    <hr>
                    <h3>Form Data:</h3>
                    <table border="1" cellpadding="5" cellspacing="0">
            """
            
            for key, value in form_data.items():
                if key not in ['consent_to_contact', 'subscribe_to_newsletter']:
                    html_body += f"""
                        <tr>
                            <td><strong>{key.replace('_', ' ').title()}:</strong></td>
                            <td>{value}</td>
                        </tr>
                    """
            
            html_body += """
                    </table>
                    <hr>
                    <p><a href="https://console.firebase.google.com/project/YOUR_PROJECT/firestore/data/form_submissions">View in Firebase Console</a></p>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Notification email sent for {form_type} submission {submission_id}")
            
        except Exception as e:
            logger.error(f"Failed to send notification email: {e}")
    
    async def submit_contact_form(
        self, 
        form_data: ContactFormData, 
        request: Request,
        background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle contact form submission"""
        submission_id = str(uuid.uuid4())
        
        # Create submission record
        submission = FormSubmission(
            id=submission_id,
            form_type="contact",
            data=form_data.dict(),
            submitted_at=datetime.now(),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            status="pending"
        )
        
        # Store in Firestore
        try:
            db.collection(self.collection).document(submission_id).set(submission.dict())
            logger.info(f"Contact form submission stored: {submission_id}")
        except Exception as e:
            logger.error(f"Failed to store contact form: {e}")
            raise HTTPException(status_code=500, detail="Failed to submit form")
        
        # Send notification email in background
        background_tasks.add_task(
            self._send_notification_email,
            "Contact",
            form_data.dict(),
            submission_id
        )
        
        return {
            "success": True,
            "submission_id": submission_id,
            "message": "Thank you for contacting us. We'll get back to you soon!"
        }
    
    async def submit_service_intake(
        self,
        form_data: ServiceIntakeForm,
        request: Request,
        background_tasks: BackgroundTasks
    ) -> Dict[str, Any]:
        """Handle service intake form submission"""
        submission_id = str(uuid.uuid4())
        
        # Validate consent
        if not form_data.consent_to_contact:
            raise HTTPException(status_code=400, detail="Consent to contact is required")
        
        # Create submission record
        submission = FormSubmission(
            id=submission_id,
            form_type="service_intake",
            data=form_data.dict(),
            submitted_at=datetime.now(),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            status="pending",
            notes=[{
                "timestamp": datetime.now().isoformat(),
                "note": "New submission received",
                "author": "system"
            }]
        )
        
        # Store in Firestore
        try:
            # Store main submission
            db.collection(self.collection).document(submission_id).set(submission.dict())
            
            # Create a separate lead record for easier tracking
            lead_data = {
                "submission_id": submission_id,
                "company_name": form_data.company_name,
                "contact_name": form_data.contact_name,
                "email": form_data.email,
                "phone": form_data.phone,
                "services_interested": form_data.services_interested,
                "timeline": form_data.timeline,
                "budget_range": form_data.budget_range,
                "status": "new",
                "created_at": datetime.now(),
                "last_updated": datetime.now(),
                "score": self._calculate_lead_score(form_data)
            }
            
            db.collection('leads').document(submission_id).set(lead_data)
            
            # Add to newsletter if requested
            if form_data.subscribe_to_newsletter:
                db.collection('newsletter_subscribers').document(form_data.email).set({
                    "email": form_data.email,
                    "name": form_data.contact_name,
                    "company": form_data.company_name,
                    "subscribed_at": datetime.now(),
                    "source": "service_intake",
                    "active": True
                }, merge=True)
            
            logger.info(f"Service intake form submission stored: {submission_id}")
            
        except Exception as e:
            logger.error(f"Failed to store service intake form: {e}")
            raise HTTPException(status_code=500, detail="Failed to submit form")
        
        # Send notification email in background
        background_tasks.add_task(
            self._send_notification_email,
            "Service Intake",
            form_data.dict(),
            submission_id
        )
        
        return {
            "success": True,
            "submission_id": submission_id,
            "message": "Thank you for your interest! Our team will contact you within 24 hours.",
            "lead_score": lead_data["score"]
        }
    
    def _calculate_lead_score(self, form_data: ServiceIntakeForm) -> int:
        """Calculate lead score based on form data"""
        score = 0
        
        # Company size scoring
        size_scores = {
            "1-10": 10,
            "11-50": 20,
            "51-200": 30,
            "201-500": 40,
            "500+": 50
        }
        score += size_scores.get(form_data.company_size, 0)
        
        # Timeline scoring
        timeline_scores = {
            "immediate": 30,
            "1-3months": 20,
            "3-6months": 10,
            "6months+": 5
        }
        score += timeline_scores.get(form_data.timeline, 0)
        
        # Budget scoring
        budget_scores = {
            "under10k": 5,
            "10k-50k": 15,
            "50k-100k": 25,
            "100k+": 40,
            "not_sure": 10
        }
        score += budget_scores.get(form_data.budget_range, 0)
        
        # Services interested scoring
        score += len(form_data.services_interested) * 5
        
        # Has website
        if form_data.website:
            score += 5
        
        return min(score, 100)  # Cap at 100
    
    async def get_submissions(
        self,
        form_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get form submissions with filtering"""
        query = db.collection(self.collection)
        
        if form_type:
            query = query.where('form_type', '==', form_type)
        
        if status:
            query = query.where('status', '==', status)
        
        query = query.order_by('submitted_at', direction=firestore.Query.DESCENDING)
        query = query.limit(limit).offset(offset)
        
        try:
            docs = query.stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Failed to fetch submissions: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch submissions")
    
    async def update_submission_status(
        self,
        submission_id: str,
        status: str,
        note: Optional[str] = None,
        author: str = "admin"
    ) -> Dict[str, Any]:
        """Update form submission status"""
        try:
            doc_ref = db.collection(self.collection).document(submission_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                raise HTTPException(status_code=404, detail="Submission not found")
            
            updates = {
                "status": status,
                "last_updated": datetime.now()
            }
            
            if note:
                current_data = doc.to_dict()
                notes = current_data.get("notes", [])
                notes.append({
                    "timestamp": datetime.now().isoformat(),
                    "note": note,
                    "author": author
                })
                updates["notes"] = notes
            
            doc_ref.update(updates)
            
            # Also update lead status if it's a service intake
            if doc.to_dict().get("form_type") == "service_intake":
                lead_ref = db.collection('leads').document(submission_id)
                if lead_ref.get().exists:
                    lead_ref.update({
                        "status": status,
                        "last_updated": datetime.now()
                    })
            
            return {"success": True, "message": "Status updated"}
            
        except Exception as e:
            logger.error(f"Failed to update submission: {e}")
            raise HTTPException(status_code=500, detail="Failed to update submission")

# Create singleton instance
forms_api = FormsAPI()

# FastAPI dependencies
async def submit_contact_form(
    form_data: ContactFormData,
    request: Request,
    background_tasks: BackgroundTasks
):
    return await forms_api.submit_contact_form(form_data, request, background_tasks)

async def submit_service_intake(
    form_data: ServiceIntakeForm,
    request: Request,
    background_tasks: BackgroundTasks
):
    return await forms_api.submit_service_intake(form_data, request, background_tasks)