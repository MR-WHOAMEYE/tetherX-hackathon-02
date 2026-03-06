"""
Patient-facing API — bookings, prescriptions, diagnoses, feedback, profile.
Uses MongoDB only — no SQLite.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/patient", tags=["Patient API"])

from mongo import *

# ---- Cases Endpoint ----
@router.get("/cases")
def get_cases(department: str = ""):
    if cases_col is None:
        raise HTTPException(status_code=503, detail="Database not available")
    query = {}
    if department:
        query["department"] = department
    results = list(cases_col.find(query).limit(100))
    return {
        "cases": [
            {
                "id": str(c.get("_id", "")),
                "case_id": c.get("case_id", ""),
                "department": c.get("department", ""),
                "severity": c.get("severity", ""),
                "status": c.get("status", ""),
                "staff_id": c.get("staff_id", ""),
                "sla_deadline": c.get("sla_deadline", ""),
                "created_time": c.get("created_time", ""),
                "resolved_time": c.get("resolved_time", ""),
            }
            for c in results
        ]
    }

# MongoDB
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
    patient_email: Optional[str] = ""
    patient_name: Optional[str] = ""
    department: str
    feedback_text: str
    rating: int

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
             "created_at": r.get("created_at", ""),
             "action_note": r.get("action_note", "")}
            for r in results
        ]
    }

# ---- Staff lookup for appointment booking ----
@router.get("/staff")
def get_department_staff(department: str = ""):
    if users_col is None:
        return {"staff": []}
    
    query = {"role": {"$in": ["doctor", "nurse"]}}
    if department:
        query["department"] = department
    
    results = users_col.find(query, {"password": 0})
    return {
        "staff": [
            {
                "id": str(r.get("_id", "")),
                "name": r.get("name", ""),
                "email": r.get("email", ""),
                "role": r.get("role", ""),
                "department": r.get("department", ""),
                "specialization": r.get("specialization", ""),
            }
            for r in results
        ]
    }

# ---- Patient prescriptions & diagnoses ----
@router.get("/my-prescriptions")
def get_my_prescriptions(patient_email: Optional[str] = None):
    if prescriptions_col is None:
        return {"prescriptions": []}
    
    # Try patient-specific first, fall back to all data for demo
    if patient_email:
        results = list(prescriptions_col.find({"patient_email": patient_email}).sort("created_at", -1).limit(20))
        if not results:
            # No patient-specific data, return sample from all prescriptions
            results = list(prescriptions_col.find().sort("created_at", -1).limit(10))
    else:
        results = list(prescriptions_col.find().sort("created_at", -1).limit(20))
    
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
    
    # Try patient-specific first, fall back to all data for demo
    if patient_email:
        results = list(diagnoses_col.find({"patient_email": patient_email}).sort("created_at", -1).limit(20))
        if not results:
            # No patient-specific data, return sample from all diagnoses
            results = list(diagnoses_col.find().sort("created_at", -1).limit(10))
    else:
        results = list(diagnoses_col.find().sort("created_at", -1).limit(20))
    
    return {
        "diagnoses": [
            {"id": str(r["_id"]), "condition": r.get("condition", ""),
             "severity": r.get("severity", ""), "notes": r.get("notes", ""),
             "doctor_name": r.get("doctor_name", ""), "created_at": r.get("created_at", "")}
            for r in results
        ]
    }

# ---- My Vitals ----
@router.get("/my-vitals")
def get_my_vitals(patient_email: Optional[str] = None):
    if vitals_col is None:
        return {"vitals": []}
    
    # Try patient-specific first, fall back to all data for demo
    if patient_email:
        results = list(vitals_col.find({"patient_email": patient_email}).sort("recorded_at", -1).limit(20))
        if not results:
            # No patient-specific data, return sample from all vitals
            results = list(vitals_col.find().sort("recorded_at", -1).limit(10))
    else:
        results = list(vitals_col.find().sort("recorded_at", -1).limit(20))
    return {
        "vitals": [
            {
                "id": str(v["_id"]),
                "blood_pressure": v.get("blood_pressure") or (f"{v.get('bp_systolic', '')}/{v.get('bp_diastolic', '')}" if v.get("bp_systolic") else None),
                "heart_rate": v.get("heart_rate"),
                "temperature": v.get("temperature"),
                "oxygen_saturation": v.get("oxygen_saturation"),
                "weight": v.get("weight"),
                "notes": v.get("notes", ""),
                "recorded_at": v.get("recorded_at", ""),
            }
            for v in results
        ]
    }

# ---- Feedback (MongoDB) ----
@router.get("/feedback")
def get_feedback(department: Optional[str] = None):
    if patient_feedback_col is None:
        return {"feedback": [], "total": 0, "avg_rating": 0, "avg_sentiment": 0}

    query = {}
    if department:
        query["department"] = department

    docs = list(patient_feedback_col.find(query).sort("created_at", -1))
    ratings = [d.get("rating", 0) for d in docs if d.get("rating")]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return {
        "feedback": [
            {"id": str(d["_id"]), "department": d.get("department", ""),
             "text": d.get("feedback_text", ""), "rating": d.get("rating", 0),
             "sentiment_score": d.get("sentiment_score", 0),
             "patient_name": d.get("patient_name", ""),
             "created_at": d.get("created_at", "")}
            for d in docs
        ],
        "total": len(docs),
        "avg_rating": round(avg_rating, 2),
        "avg_sentiment": 0,
    }

@router.post("/feedback")
def submit_feedback(body: FeedbackSubmit):
    if patient_feedback_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    sentiment = (body.rating - 3) / 2.0
    doc = {
        "patient_email": body.patient_email,
        "patient_name": body.patient_name,
        "department": body.department,
        "feedback_text": body.feedback_text,
        "rating": body.rating,
        "sentiment_score": sentiment,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = patient_feedback_col.insert_one(doc)
    return {"message": "Feedback submitted", "id": str(result.inserted_id)}

# ---- Appointments (MongoDB) ----
@router.get("/appointments")
def get_appointments(department: str = ""):
    if bookings_col is None:
        return {"total": 0, "attended": 0, "missed": 0, "appointments": []}
    
    query = {}
    if department:
        query["department"] = department
    
    all_bookings = list(bookings_col.find(query).sort("created_at", -1).limit(100))
    
    attended = sum(1 for b in all_bookings if b.get("status") in ["completed", "attended"])
    missed = sum(1 for b in all_bookings if b.get("status") == "missed")
    
    return {
        "total": len(all_bookings),
        "attended": attended,
        "missed": missed,
        "appointments": [
            {
                "id": str(b.get("_id", "")),
                "patient_name": b.get("patient_name", ""),
                "department": b.get("department", ""),
                "preferred_date": b.get("preferred_date", ""),
                "preferred_time": b.get("preferred_time", ""),
                "status": b.get("status", "pending"),
            }
            for b in all_bookings[:20]
        ],
    }

# ---- Profile (MongoDB) ----
@router.get("/profile")
def get_profile(email: str):
    if patient_profiles_col is None:
        return {"profile": None}
    profile = patient_profiles_col.find_one({"email": email})
    if not profile:
        return {"profile": None}
    return {
        "profile": {
            "id": str(profile["_id"]),
            "user_id": profile.get("user_id", ""),
            "name": profile.get("name", ""),
            "email": profile.get("email", ""),
            "phone": profile.get("phone", ""),
            "age": profile.get("age", 0),
            "gender": profile.get("gender", ""),
            "date_of_birth": profile.get("date_of_birth", ""),
            "address": profile.get("address", ""),
            "emergency_contact": profile.get("emergency_contact", ""),
            "blood_group": profile.get("blood_group", ""),
            "conditions": profile.get("conditions", []),
            "allergies": profile.get("allergies", []),
            "verified": profile.get("verified", False),
            "status": profile.get("status", "active"),
            "created_at": profile.get("created_at", ""),
        }
    }

@router.put("/profile")
def update_profile(email: str, body: ProfileUpdate):
    if patient_profiles_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    patient_profiles_col.update_one(
        {"email": email},
        {"$set": {
            "phone": body.phone, "address": body.address,
            "emergency_contact": body.emergency_contact,
            "blood_group": body.blood_group, "allergies": body.allergies,
        }},
        upsert=True,
    )
    return {"message": "Profile updated"}
