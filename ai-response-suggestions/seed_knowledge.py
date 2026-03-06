"""
Seed Knowledge Base
Seeds hospital FAQ/knowledge articles into MongoDB for the AI pipeline retrieval stage.
Run: python seed_knowledge.py
"""
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add backend to path for mongo import
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", ".env"))

from mongo import knowledge_base_col


KNOWLEDGE_ARTICLES = [
    # ── Billing ──
    {
        "title": "Understanding Your Hospital Bill",
        "category": "billing",
        "content": "Your hospital bill includes charges for room, medications, procedures, and doctor fees. You can view an itemized bill by requesting it from our billing department. Payment plans are available for bills exceeding ₹10,000. Insurance claims are processed within 7-14 business days.",
        "tags": ["bill", "charges", "payment", "itemized"],
    },
    {
        "title": "Insurance and TPA Claims",
        "category": "billing",
        "content": "We accept all major insurance providers and TPAs. For cashless treatment, please submit your insurance card at admission. Pre-authorization typically takes 2-4 hours. For reimbursement claims, collect the required documents from our billing counter within 7 days of discharge.",
        "tags": ["insurance", "tpa", "cashless", "claim", "reimbursement"],
    },
    {
        "title": "Payment Methods and Refunds",
        "category": "billing",
        "content": "We accept cash, credit/debit cards, UPI, and net banking. Advance deposits are refundable within 5-7 working days after discharge. For billing disputes, please contact our billing helpdesk at extension 2050 or email billing@hospital.com.",
        "tags": ["payment", "refund", "upi", "card", "deposit"],
    },

    # ── Appointments ──
    {
        "title": "Booking an Appointment",
        "category": "appointment",
        "content": "You can book appointments through our patient portal, by calling our reception at extension 1000, or by visiting the front desk. Online appointments can be booked up to 30 days in advance. Walk-in appointments are available but subject to doctor availability.",
        "tags": ["appointment", "book", "schedule", "walk-in"],
    },
    {
        "title": "Rescheduling and Cancellation Policy",
        "category": "appointment",
        "content": "Appointments can be rescheduled up to 4 hours before the scheduled time through the patient portal or by calling our reception. Cancellations made less than 2 hours before the appointment may incur a ₹500 no-show fee. Emergency rescheduling is always free of charge.",
        "tags": ["reschedule", "cancel", "no-show", "policy"],
    },
    {
        "title": "Specialist Referrals",
        "category": "appointment",
        "content": "If you need to see a specialist, your primary care doctor can provide a referral. Referral appointments are typically available within 3-5 business days. For urgent referrals, our coordination team will expedite the process. You can check specialist availability on the patient portal.",
        "tags": ["referral", "specialist", "doctor", "availability"],
    },

    # ── Medication ──
    {
        "title": "Prescription Refills",
        "category": "medication",
        "content": "Prescription refills can be requested through the patient portal or by calling our pharmacy at extension 3000. Please allow 24 hours for refill processing. For controlled substances, a new prescription from your doctor is required. Our pharmacy is open from 8 AM to 10 PM daily.",
        "tags": ["prescription", "refill", "pharmacy", "medication"],
    },
    {
        "title": "Medication Side Effects",
        "category": "medication",
        "content": "If you experience unexpected side effects from your medication, please contact your prescribing doctor immediately. For severe reactions (difficulty breathing, swelling, rash), visit the emergency department. Common mild side effects include nausea, dizziness, or drowsiness — consult your doctor if these persist beyond 48 hours.",
        "tags": ["side effect", "reaction", "allergic", "adverse"],
    },
    {
        "title": "Medication Interactions",
        "category": "medication",
        "content": "Always inform your doctor about all medications, supplements, and herbal remedies you are taking. Some medications can interact with each other or with certain foods. Our pharmacist can review your medication list for potential interactions. Do not start or stop any medication without consulting your doctor.",
        "tags": ["interaction", "drug", "supplement", "safety"],
    },

    # ── Lab Results ──
    {
        "title": "Accessing Lab Results",
        "category": "lab_results",
        "content": "Lab results are typically available within 24-48 hours for standard tests. You can view your results through the patient portal once they are reviewed by your doctor. Some specialized tests (culture, biopsy, genetic) may take 5-10 business days. Your doctor will contact you if results require immediate attention.",
        "tags": ["lab", "results", "report", "test"],
    },
    {
        "title": "Understanding Blood Test Results",
        "category": "lab_results",
        "content": "Your blood test report includes reference ranges for each parameter. Values outside the reference range are flagged automatically. Common tests include CBC (complete blood count), blood glucose, lipid profile, liver function, and kidney function tests. Your doctor will explain any abnormal findings during your follow-up.",
        "tags": ["blood", "cbc", "glucose", "report", "normal range"],
    },
    {
        "title": "Imaging and Scan Reports",
        "category": "lab_results",
        "content": "X-ray results are usually available within 2-4 hours. CT and MRI scans take 24-48 hours for the radiologist's report. You can collect physical copies of your imaging from the radiology department. Digital copies are available through the patient portal. Always bring previous scan reports for comparison.",
        "tags": ["x-ray", "mri", "ct", "scan", "radiology", "imaging"],
    },

    # ── General ──
    {
        "title": "Visiting Hours and Guidelines",
        "category": "general",
        "content": "General visiting hours are 10 AM to 12 PM and 4 PM to 7 PM daily. ICU visiting is limited to 15 minutes twice daily. Each patient is allowed a maximum of 2 visitors at a time. Children under 12 are not permitted in patient wards. Please sanitize your hands before entering patient areas.",
        "tags": ["visiting", "hours", "icu", "visitor", "guidelines"],
    },
    {
        "title": "Patient Rights and Grievances",
        "category": "general",
        "content": "Every patient has the right to informed consent, privacy, and access to their medical records. If you have a complaint or grievance, please contact our Patient Relations Officer or submit a written complaint at the front desk. All grievances are addressed within 48 hours. You can also email feedback@hospital.com.",
        "tags": ["rights", "complaint", "grievance", "feedback", "privacy"],
    },
    {
        "title": "Emergency Services",
        "category": "general",
        "content": "Our emergency department operates 24/7. For life-threatening emergencies, call 108 or come directly to the ER entrance. Triage nurses will assess your condition upon arrival and prioritize treatment. Emergency cases are seen immediately regardless of appointment status.",
        "tags": ["emergency", "er", "ambulance", "urgent", "24/7"],
    },
    {
        "title": "Discharge Process",
        "category": "general",
        "content": "The discharge process typically takes 2-4 hours after your doctor approves discharge. You will receive a discharge summary with diagnosis, treatment details, medications, and follow-up instructions. Please settle all bills at the billing counter before collecting your discharge papers. Our patient coordinator will explain your home care instructions.",
        "tags": ["discharge", "home care", "follow-up", "summary"],
    },
]


def seed_knowledge_base():
    """Insert knowledge articles into MongoDB."""
    if knowledge_base_col is None:
        print("[ERROR] MongoDB not available. Set MONGO_URI in backend/.env")
        return

    # Check if already seeded
    existing = knowledge_base_col.count_documents({})
    if existing > 0:
        print(f"[INFO] Knowledge base already has {existing} articles. Skipping seed.")
        print("[INFO] To re-seed, drop the 'knowledge_base' collection first.")
        return

    now = datetime.utcnow().isoformat()
    for article in KNOWLEDGE_ARTICLES:
        article["created_at"] = now

    result = knowledge_base_col.insert_many(KNOWLEDGE_ARTICLES)
    print(f"[SUCCESS] Seeded {len(result.inserted_ids)} knowledge articles into MongoDB")


if __name__ == "__main__":
    seed_knowledge_base()
