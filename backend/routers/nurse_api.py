"""
Nurse API — patient vitals (BP, sugar, notes), ward management, profiles, shifts.
Uses MongoDB only — no SQLite mock data.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
import os
import time
import bcrypt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/nurse", tags=["Nurse API"])

from mongo import *

# ═══════════════════════════════════════════
# TTL CACHE FOR PERFORMANCE
# ═══════════════════════════════════════════
class TTLCache:
    def __init__(self, ttl_seconds=30):
        self._cache = {}
        self._ttl = ttl_seconds

    def get(self, key):
        if key in self._cache:
            value, ts = self._cache[key]
            if time.time() - ts < self._ttl:
                return value
            del self._cache[key]
        return None

    def set(self, key, value):
        self._cache[key] = (value, time.time())

_nurse_cache = TTLCache(ttl_seconds=30)

# MongoDB
class VitalRecord(BaseModel):
    patient_email: str
    patient_name: str
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    sugar_level: Optional[float] = None
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_sugar_fasting: Optional[float] = None
    blood_sugar_pp: Optional[float] = None
    notes: Optional[str] = ""

class NurseProfileUpdate(BaseModel):
    department: Optional[str] = None
    ward_id: Optional[str] = None
    shift: Optional[str] = None  # Morning, Evening, Night

class ShiftSchedule(BaseModel):
    nurse_email: str
    date: str
    shift: str  # Morning, Evening, Night
    ward_id: str

# ═══════════════════════════════════════════
# NURSE DASHBOARD
# ═══════════════════════════════════════════
@router.get("/dashboard")
def nurse_dashboard(department: Optional[str] = None, nurse_email: Optional[str] = None):
    # Check cache first
    cache_key = f"dashboard_{department}_{nurse_email}"
    cached = _nurse_cache.get(cache_key)
    if cached:
        return cached

    # Get nurse profile if available
    profile = None
    if nurse_profiles_col is not None and nurse_email:
        profile = nurse_profiles_col.find_one({"nurse_email": nurse_email})

    assigned_ward = profile.get("ward_id", "") if profile else ""
    assigned_shift = profile.get("shift", "") if profile else ""
    assigned_dept = profile.get("department", department or "") if profile else (department or "")

    # Ward occupancy - show specific ward or aggregate department wards
    ward_info = None
    if wards_col is not None:
        if assigned_ward:
            ward_info = wards_col.find_one({"ward_id": assigned_ward})
        elif assigned_dept:
            # Aggregate all wards in department
            dept_wards = list(wards_col.find({"department": assigned_dept}))
            if dept_wards:
                total_capacity = sum(w.get("capacity", 0) for w in dept_wards)
                total_patients = sum(w.get("current_patients", 0) for w in dept_wards)
                ward_info = {
                    "ward_id": f"{assigned_dept} (All Wards)",
                    "type": "Mixed",
                    "capacity": total_capacity,
                    "current_patients": total_patients,
                }

    # Patient counts from admissions (MongoDB)
    total_patients = 0
    active_cases = []
    if admissions_col is not None:
        adm_query = {"status": {"$in": ["admitted", "pending"]}}
        if assigned_dept:
            adm_query["department"] = assigned_dept
        if assigned_ward:
            adm_query["ward_id"] = assigned_ward
        total_patients = admissions_col.count_documents(adm_query)
        active_docs = admissions_col.find(adm_query).sort("created_at", -1).limit(10)
        active_cases = [
            {
                "id": str(a["_id"]),
                "patient_name": a.get("patient_name", ""),
                "status": a.get("status", ""),
                "ward_id": a.get("ward_id", ""),
                "department": a.get("department", ""),
                "ward_type": a.get("ward_type", ""),
                "created_at": a.get("created_at", ""),
            }
            for a in active_docs
        ]

    # Staff count from users collection (nurses/doctors in department)
    ward_staff_count = 0
    if users_col is not None:
        staff_query = {"role": {"$in": ["nurse", "doctor"]}}
        if assigned_dept:
            staff_query["department"] = assigned_dept
        ward_staff_count = users_col.count_documents(staff_query)

    # Today's appointments from bookings (MongoDB)
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_appointments = 0
    if bookings_col is not None:
        appt_query = {"preferred_date": today_str}
        if assigned_dept:
            appt_query["department"] = assigned_dept
        today_appointments = bookings_col.count_documents(appt_query)

    # Recent vitals count
    vitals_count = 0
    if vitals_col is not None:
        query = {}
        if assigned_dept:
            query["department"] = assigned_dept
        vitals_count = vitals_col.count_documents(query)

    # Medication schedule (from prescriptions)
    med_schedule = []
    if prescriptions_col is not None:
        query = {"status": "active"}
        if assigned_dept:
            query["doctor_department"] = assigned_dept
        meds = prescriptions_col.find(query).sort("created_at", -1).limit(10)
        med_schedule = [
            {
                "id": str(m["_id"]),
                "patient_name": m.get("patient_name", ""),
                "medication": m.get("medication", ""),
                "dosage": m.get("dosage", ""),
                "frequency": m.get("frequency", ""),
            }
            for m in meds
        ]

    # Pending admissions - show ward-level or department-level
    pending_admissions = []
    if admissions_col is not None:
        pending_query = {"status": "pending"}
        if assigned_ward:
            pending_query["ward_id"] = assigned_ward
        elif assigned_dept:
            pending_query["department"] = assigned_dept
        pending = admissions_col.find(pending_query).sort("created_at", -1).limit(20)
        pending_admissions = [
            {
                "id": str(a["_id"]),
                "patient_name": a.get("patient_name", ""),
                "assigned_by_doctor": a.get("assigned_by_doctor", ""),
                "ward_type": a.get("ward_type", ""),
                "ward_id": a.get("ward_id", ""),
                "created_at": a.get("created_at", ""),
            }
            for a in pending
        ]

    # Admitted patients - show ward-level or department-level
    admitted_patients = []
    if admissions_col is not None:
        admitted_query = {"status": "admitted"}
        if assigned_ward:
            admitted_query["ward_id"] = assigned_ward
        elif assigned_dept:
            admitted_query["department"] = assigned_dept
        admitted = admissions_col.find(admitted_query).sort("admitted_at", -1).limit(20)
        admitted_patients = [
            {
                "id": str(a["_id"]),
                "patient_name": a.get("patient_name", ""),
                "admitted_at": a.get("admitted_at", ""),
                "ward_id": a.get("ward_id", ""),
                "notes": a.get("notes", ""),
            }
            for a in admitted
        ]

    result = {
        "ward": assigned_dept or "All",
        "assigned_ward": assigned_ward,
        "assigned_shift": assigned_shift,
        "ward_info": {
            "ward_id": ward_info["ward_id"] if ward_info else "",
            "type": ward_info["type"] if ward_info else "",
            "capacity": ward_info["capacity"] if ward_info else 0,
            "current_patients": ward_info.get("current_patients", 0) if ward_info else 0,
        } if ward_info else None,
        "total_patients": total_patients,
        "ward_staff": ward_staff_count,
        "today_appointments": today_appointments,
        "vitals_recorded": vitals_count,
        "active_cases": active_cases,
        "medication_schedule": med_schedule,
        "pending_admissions": pending_admissions,
        "admitted_patients": admitted_patients,
    }
    _nurse_cache.set(cache_key, result)
    return result

# ═══════════════════════════════════════════
# REGISTER PATIENT (Nurse creates patient + user account)
# ═══════════════════════════════════════════
class PatientRegister(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    gender: Optional[str] = "Male"
    date_of_birth: Optional[str] = ""
    blood_group: Optional[str] = "O+"
    address: Optional[str] = ""
    emergency_contact: Optional[str] = ""
    conditions: Optional[str] = ""   # comma-separated
    allergies: Optional[str] = ""    # comma-separated
    nurse_email: Optional[str] = ""
    nurse_name: Optional[str] = ""

@router.post("/register-patient")
def register_patient(body: PatientRegister):
    if users_col is None or patient_profiles_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    # Check if email already exists in users
    if users_col.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    now = datetime.utcnow().isoformat()

    # 1) Create user account — phone number as password
    raw_password = body.phone
    hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_doc = {
        "name": body.name,
        "email": body.email,
        "password": hashed,
        "role": "patient",
        "department": "",
        "phone": body.phone,
        "created_at": now,
        "created_by": body.nurse_email or "nurse",
    }
    user_result = users_col.insert_one(user_doc)

    # 2) Store full patient profile
    conditions_list = [c.strip() for c in body.conditions.split(",") if c.strip()] if body.conditions else []
    allergies_list = [a.strip() for a in body.allergies.split(",") if a.strip()] if body.allergies else []

    patient_doc = {
        "user_id": str(user_result.inserted_id),
        "name": body.name,
        "email": body.email,
        "phone": body.phone,
        "age": body.age,
        "gender": body.gender or "Male",
        "date_of_birth": body.date_of_birth or "",
        "blood_group": body.blood_group or "O+",
        "address": body.address or "",
        "emergency_contact": body.emergency_contact or "",
        "conditions": conditions_list,
        "allergies": allergies_list,
        "registered_by": body.nurse_email or "",
        "registered_by_name": body.nurse_name or "",
        "verified": False,
        "status": "active",
        "created_at": now,
    }
    profile_result = patient_profiles_col.insert_one(patient_doc)

    return {
        "message": "Patient registered successfully",
        "patient": {
            "id": str(profile_result.inserted_id),
            "user_id": str(user_result.inserted_id),
            "name": body.name,
            "email": body.email,
            "phone": body.phone,
        },
    }

@router.put("/verify-patient/{patient_id}")
def verify_patient(patient_id: str):
    if patient_profiles_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    result = patient_profiles_col.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"verified": True, "verified_at": datetime.utcnow().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient verified"}

@router.get("/patients")
def list_patients(nurse_email: Optional[str] = None):
    if patient_profiles_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    query = {}
    if nurse_email:
        query["registered_by"] = nurse_email

    patients = list(patient_profiles_col.find(query).sort("created_at", -1))
    return [
        {
            "id": str(p["_id"]),
            "user_id": p.get("user_id", ""),
            "name": p.get("name", ""),
            "email": p.get("email", ""),
            "phone": p.get("phone", ""),
            "age": p.get("age", 0),
            "gender": p.get("gender", ""),
            "blood_group": p.get("blood_group", ""),
            "address": p.get("address", ""),
            "emergency_contact": p.get("emergency_contact", ""),
            "date_of_birth": p.get("date_of_birth", ""),
            "conditions": p.get("conditions", []),
            "allergies": p.get("allergies", []),
            "verified": p.get("verified", False),
            "status": p.get("status", "active"),
            "created_at": p.get("created_at", ""),
        }
        for p in patients
    ]

# ═══════════════════════════════════════════
# PATIENT VITALS
# ═══════════════════════════════════════════
@router.post("/vitals")
def record_vitals(body: VitalRecord):
    if vitals_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    doc = {
        "patient_email": body.patient_email,
        "patient_name": body.patient_name,
        "bp_systolic": body.bp_systolic,
        "bp_diastolic": body.bp_diastolic,
        "sugar_level": body.sugar_level,
        "temperature": body.temperature,
        "heart_rate": body.heart_rate,
        "respiratory_rate": body.respiratory_rate,
        "oxygen_saturation": body.oxygen_saturation,
        "weight": body.weight,
        "height": body.height,
        "blood_sugar_fasting": body.blood_sugar_fasting,
        "blood_sugar_pp": body.blood_sugar_pp,
        "notes": body.notes,
        "recorded_at": datetime.utcnow().isoformat(),
        "department": "",
    }
    result = vitals_col.insert_one(doc)
    return {"message": "Vitals recorded", "id": str(result.inserted_id)}

@router.get("/vitals")
def get_vitals(patient_email: Optional[str] = None, department: Optional[str] = None):
    if vitals_col is None:
        raise HTTPException(status_code=503, detail="Database not available")

    query = {}
    if patient_email:
        query["patient_email"] = patient_email
    if department:
        query["department"] = department

    results = vitals_col.find(query).sort("recorded_at", -1).limit(50)
    return {
        "vitals": [
            {
                "id": str(v["_id"]),
                "patient_name": v.get("patient_name", ""),
                "patient_email": v.get("patient_email", ""),
                "bp_systolic": v.get("bp_systolic"),
                "bp_diastolic": v.get("bp_diastolic"),
                "sugar_level": v.get("sugar_level"),
                "temperature": v.get("temperature"),
                "heart_rate": v.get("heart_rate"),
                "respiratory_rate": v.get("respiratory_rate"),
                "oxygen_saturation": v.get("oxygen_saturation"),
                "weight": v.get("weight"),
                "height": v.get("height"),
                "blood_sugar_fasting": v.get("blood_sugar_fasting"),
                "blood_sugar_pp": v.get("blood_sugar_pp"),
                "notes": v.get("notes", ""),
                "recorded_at": v.get("recorded_at", ""),
            }
            for v in results
        ]
    }

# ═══════════════════════════════════════════
# NURSE PROFILE
# ═══════════════════════════════════════════
@router.get("/profile/{nurse_email}")
def get_nurse_profile(nurse_email: str):
    """Get nurse's ward and shift assignment."""
    if nurse_profiles_col is None:
        return {"profile": None}
    profile = nurse_profiles_col.find_one({"nurse_email": nurse_email})
    if not profile:
        return {"profile": None}
    return {
        "profile": {
            "nurse_email": profile["nurse_email"],
            "department": profile.get("department", ""),
            "ward_id": profile.get("ward_id", ""),
            "shift": profile.get("shift", ""),
        }
    }

@router.post("/profile/{nurse_email}")
def set_nurse_profile(nurse_email: str, body: NurseProfileUpdate):
    """Admin assigns nurse to department, ward, and shift."""
    if nurse_profiles_col is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")

    update = {}
    if body.department:
        update["department"] = body.department
    if body.ward_id:
        update["ward_id"] = body.ward_id
    if body.shift:
        update["shift"] = body.shift

    nurse_profiles_col.update_one(
        {"nurse_email": nurse_email},
        {"$set": update, "$setOnInsert": {"nurse_email": nurse_email}},
        upsert=True
    )
    return {"message": f"Nurse profile updated for {nurse_email}"}

# ═══════════════════════════════════════════
# SHIFT SCHEDULES
# ═══════════════════════════════════════════
@router.get("/shifts")
def get_shifts(nurse_email: Optional[str] = None, date: Optional[str] = None):
    """Get shift schedule for a nurse or date."""
    if shift_schedules_col is None:
        return {"shifts": []}
    query = {}
    if nurse_email:
        query["nurse_email"] = nurse_email
    if date:
        query["date"] = date
    results = shift_schedules_col.find(query).sort("date", -1).limit(30)
    return {
        "shifts": [
            {
                "id": str(s["_id"]),
                "nurse_email": s.get("nurse_email", ""),
                "date": s.get("date", ""),
                "shift": s.get("shift", ""),
                "ward_id": s.get("ward_id", ""),
                "check_in": s.get("check_in"),
                "check_out": s.get("check_out"),
            }
            for s in results
        ]
    }

@router.post("/shifts")
def create_shift(body: ShiftSchedule):
    """Admin creates a shift schedule for a nurse."""
    if shift_schedules_col is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    shift_schedules_col.insert_one({
        "nurse_email": body.nurse_email,
        "date": body.date,
        "shift": body.shift,
        "ward_id": body.ward_id,
        "check_in": None,
        "check_out": None,
    })
    return {"message": f"Shift scheduled for {body.nurse_email} on {body.date}"}

@router.put("/shifts/check-in/{shift_id}")
def check_in(shift_id: str):
    """Nurse checks in for their shift."""
    if shift_schedules_col is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    shift_schedules_col.update_one(
        {"_id": ObjectId(shift_id)},
        {"$set": {"check_in": datetime.utcnow().isoformat()}}
    )
    return {"message": "Checked in"}

@router.put("/shifts/check-out/{shift_id}")
def check_out(shift_id: str):
    """Nurse checks out from their shift."""
    if shift_schedules_col is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    shift_schedules_col.update_one(
        {"_id": ObjectId(shift_id)},
        {"$set": {"check_out": datetime.utcnow().isoformat()}}
    )
    return {"message": "Checked out"}

