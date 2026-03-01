"""
Patient-facing API — appointments, cases, feedback, booking, profile.
Uses MongoDB only — no SQLite mock data.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/patient", tags=["Patient API"])

# MongoDB
MONGO_URI = os.getenv("mongo_db", "")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000) if MONGO_URI else None
mdb = client["zero_intercept"] if client is not None else None
bookings_col = mdb["appointment_bookings"] if mdb is not None else None
profiles_col = mdb["patient_profiles"] if mdb is not None else None
prescriptions_col = mdb["prescriptions"] if mdb is not None else None
diagnoses_col = mdb["diagnoses"] if mdb is not None else None
admissions_col = mdb["ward_admissions"] if mdb is not None else None
feedback_col = mdb["patient_feedback"] if mdb is not None else None
users_col = mdb["users"] if mdb is not None else None


# ---- Models ----
class BookingCreate(BaseModel):
    patient_email: str
    patient_name: str
    department: str
    doctor_name: Optional[str] = ""
    preferred_date: str
    preferred_time: str
    reason: Optional[str] = ""

class ProfileUpdate(BaseModel):
    phone: Optional[str] = ""
    address: Optional[str] = ""
    emergency_contact: Optional[str] = ""
    blood_group: Optional[str] = ""
    allergies: Optional[str] = ""

class FeedbackSubmit(BaseModel):
    department: str
    feedback_text: str
    rating: int


# ---- Appointments (from bookings) ----
@router.get("/appointments")
def get_appointments(department: Optional[str] = None):
    if bookings_col is None:
        return {"appointments": [], "total": 0, "attended": 0, "missed": 0}

    query = {}
    if department:
        query["department"] = department
    results = list(bookings_col.find(query).sort("created_at", -1))

    attended = sum(1 for r in results if r.get("status") in ("approve", "approved", "completed"))
    missed = sum(1 for r in results if r.get("status") in ("cancel", "cancelled", "no_show"))

    return {
        "appointments": [
            {
                "id": str(r["_id"]),
                "department": r.get("department", ""),
                "slot_time": r.get("preferred_date", "") + " " + r.get("preferred_time", ""),
                "attended": r.get("status") in ("approve", "approved", "completed"),
            }
            for r in results
        ],
        "total": len(results),
        "attended": attended,
        "missed": missed,
    }


# ---- Cases (from admissions) ----
@router.get("/cases")
def get_cases(department: Optional[str] = None, staff_id: Optional[int] = None):
    if admissions_col is None:
        return {"cases": [], "total": 0, "open": 0, "in_progress": 0, "resolved": 0, "escalated": 0}

    query = {}
    if department:
        query["department"] = department

    results = list(admissions_col.find(query).sort("created_at", -1))
    return {
        "cases": [
            {
                "id": str(c["_id"]),
                "department": c.get("department", ""),
                "severity": c.get("ward_type", "General"),
                "status": c.get("status", ""),
                "patient_name": c.get("patient_name", ""),
                "created_time": c.get("created_at", ""),
            }
            for c in results
        ],
        "total": len(results),
        "open": sum(1 for c in results if c.get("status") == "pending"),
        "in_progress": sum(1 for c in results if c.get("status") == "admitted"),
        "resolved": sum(1 for c in results if c.get("status") == "discharged"),
        "escalated": sum(1 for c in results if c.get("status") == "escalated"),
    }


# ---- Feedback ----
@router.get("/feedback")
def get_feedback(department: Optional[str] = None):
    if feedback_col is None:
        return {"feedback": [], "total": 0, "avg_rating": 0, "avg_sentiment": 0}

    query = {}
    if department:
        query["department"] = department
    feedbacks = list(feedback_col.find(query))

    avg_rating = sum(f.get("rating", 0) for f in feedbacks) / len(feedbacks) if feedbacks else 0
    avg_sentiment = sum(f.get("sentiment_score", 0) for f in feedbacks) / len(feedbacks) if feedbacks else 0

    return {
        "feedback": [
            {
                "id": str(f["_id"]),
                "department": f.get("department", ""),
                "text": f.get("feedback_text", ""),
                "rating": f.get("rating", 0),
                "sentiment_score": f.get("sentiment_score", 0),
            }
            for f in feedbacks
        ],
        "total": len(feedbacks),
        "avg_rating": round(avg_rating, 2),
        "avg_sentiment": round(avg_sentiment, 3),
    }


@router.post("/feedback")
def submit_feedback(body: FeedbackSubmit):
    if feedback_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    sentiment = (body.rating - 3) / 2.0
    doc = {
        "department": body.department,
        "feedback_text": body.feedback_text,
        "rating": body.rating,
        "sentiment_score": sentiment,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = feedback_col.insert_one(doc)
    return {"message": "Feedback submitted", "id": str(result.inserted_id)}


# ---- Staff (from users) ----
@router.get("/staff")
def get_staff(department: Optional[str] = None):
    if users_col is None:
        return {"staff": [], "total": 0}

    query = {"role": {"$in": ["doctor", "nurse"]}}
    if department:
        query["department"] = department
    staff = list(users_col.find(query))

    return {
        "staff": [
            {
                "id": str(s["_id"]),
                "name": s.get("name", ""),
                "department": s.get("department", ""),
                "role": s.get("role", ""),
                "email": s.get("email", ""),
            }
            for s in staff
        ],
        "total": len(staff),
    }


# ---- Appointment Booking (MongoDB) ----
@router.post("/bookings")
def create_booking(body: BookingCreate):
    if bookings_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    now = datetime.utcnow()
    doc = {
        "patient_email": body.patient_email,
        "patient_name": body.patient_name,
        "department": body.department,
        "doctor_name": body.doctor_name,
        "preferred_date": body.preferred_date,
        "preferred_time": body.preferred_time,
        "reason": body.reason,
        "status": "pending",
        "created_at": now.isoformat(),
        "sla_deadline": (now + timedelta(hours=24)).isoformat(),
        "responded_at": None,
    }
    result = bookings_col.insert_one(doc)
    return {"message": "Appointment request submitted", "id": str(result.inserted_id)}


@router.get("/bookings")
def get_my_bookings(patient_email: Optional[str] = None):
    if bookings_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    query = {}
    if patient_email:
        query["patient_email"] = patient_email
    results = bookings_col.find(query).sort("created_at", -1)
    return {
        "bookings": [
            {"id": str(r["_id"]), "department": r.get("department", ""),
             "doctor_name": r.get("doctor_name", ""),
             "preferred_date": r.get("preferred_date", ""),
             "preferred_time": r.get("preferred_time", ""),
             "reason": r.get("reason", ""),
             "status": r.get("status", "pending"),
             "created_at": r.get("created_at", "")}
            for r in results
        ]
    }


# ---- Patient prescriptions & diagnoses ----
@router.get("/my-prescriptions")
def get_my_prescriptions(patient_email: Optional[str] = None):
    if prescriptions_col is None:
        return {"prescriptions": []}
    query = {}
    if patient_email:
        query["patient_email"] = patient_email
    results = prescriptions_col.find(query).sort("created_at", -1)
    return {
        "prescriptions": [
            {"id": str(r["_id"]), "medication": r.get("medication", ""),
             "dosage": r.get("dosage", ""), "frequency": r.get("frequency", ""),
             "duration": r.get("duration", ""), "notes": r.get("notes", ""),
             "doctor_name": r.get("doctor_name", ""), "created_at": r.get("created_at", ""),
             "status": r.get("status", "active")}
            for r in results
        ]
    }


@router.get("/my-diagnoses")
def get_my_diagnoses(patient_email: Optional[str] = None):
    if diagnoses_col is None:
        return {"diagnoses": []}
    query = {}
    if patient_email:
        query["patient_email"] = patient_email
    results = diagnoses_col.find(query).sort("created_at", -1)
    return {
        "diagnoses": [
            {"id": str(r["_id"]), "condition": r.get("condition", ""),
             "severity": r.get("severity", ""), "notes": r.get("notes", ""),
             "doctor_name": r.get("doctor_name", ""), "created_at": r.get("created_at", "")}
            for r in results
        ]
    }


# ---- Profile (MongoDB) ----
@router.get("/profile")
def get_profile(email: str):
    if profiles_col is None:
        return {"profile": None}
    profile = profiles_col.find_one({"email": email})
    if not profile:
        return {"profile": None}
    return {
        "profile": {
            "email": profile.get("email", ""),
            "phone": profile.get("phone", ""),
            "address": profile.get("address", ""),
            "emergency_contact": profile.get("emergency_contact", ""),
            "blood_group": profile.get("blood_group", ""),
            "allergies": profile.get("allergies", ""),
        }
    }


@router.put("/profile")
def update_profile(email: str, body: ProfileUpdate):
    if profiles_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    profiles_col.update_one(
        {"email": email},
        {"$set": {
            "phone": body.phone, "address": body.address,
            "emergency_contact": body.emergency_contact,
            "blood_group": body.blood_group, "allergies": body.allergies,
        }},
        upsert=True,
    )
    return {"message": "Profile updated"}
