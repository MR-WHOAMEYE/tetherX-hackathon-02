"""
Seed mock patient data - diagnoses, prescriptions, bookings with patient_email fields.
Run: python seed_patient_data.py
"""
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mongo import mdb, bookings_col, prescriptions_col, diagnoses_col, vitals_col, users_col

# Patient emails to seed data for
PATIENT_EMAILS = [
    "ravi.kumar@patient.ai",
    "ananya.sharma@patient.ai", 
    "meera.patel@patient.ai",
    "vijay.reddy@patient.ai",
    "priya.singh@patient.ai",
]

DEPARTMENTS = ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Neurology"]

MEDICATIONS = [
    ("Amoxicillin 500mg", "1 tablet", "3 times daily", "7 days"),
    ("Metformin 850mg", "1 tablet", "twice daily", "30 days"),
    ("Lisinopril 10mg", "1 tablet", "once daily", "30 days"),
    ("Atorvastatin 20mg", "1 tablet", "at bedtime", "30 days"),
    ("Omeprazole 20mg", "1 capsule", "before breakfast", "14 days"),
    ("Amlodipine 5mg", "1 tablet", "once daily", "30 days"),
    ("Gabapentin 300mg", "1 capsule", "3 times daily", "14 days"),
    ("Ibuprofen 400mg", "1 tablet", "as needed", "10 days"),
    ("Cetirizine 10mg", "1 tablet", "once daily", "7 days"),
    ("Pantoprazole 40mg", "1 tablet", "before meals", "14 days"),
]

CONDITIONS = [
    ("Hypertension", "Medium", "Blood pressure elevated. Monitor weekly."),
    ("Type 2 Diabetes", "Medium", "HbA1c needs monitoring. Diet control recommended."),
    ("Migraine", "Low", "Recurring headaches. Triggers identified: stress, lack of sleep."),
    ("Asthma", "Medium", "Mild persistent asthma. Inhaler prescribed."),
    ("Gastritis", "Low", "Mild stomach inflammation. Dietary changes advised."),
    ("Osteoarthritis", "Medium", "Joint wear in knee. Physical therapy recommended."),
    ("Arrhythmia", "High", "Irregular heartbeat detected. ECG monitoring required."),
    ("Bronchitis", "Medium", "Acute bronchitis. Rest and fluids recommended."),
    ("Anxiety Disorder", "Low", "Mild anxiety. Counseling suggested."),
    ("Vitamin D Deficiency", "Low", "Supplement prescribed for 3 months."),
]

BOOKING_REASONS = [
    "Routine checkup",
    "Follow-up consultation",
    "Chest pain evaluation",
    "Blood pressure monitoring",
    "Diabetes management",
    "Joint pain assessment",
    "General wellness exam",
    "Headache consultation",
    "Breathing difficulties",
    "Lab results review",
]

def seed_patient_data():
    if mdb is None:
        print("Error: MongoDB not connected")
        return
    
    # Get doctors from DB
    doctors = list(users_col.find({"role": "doctor"})) if users_col else []
    if not doctors:
        doctors = [{"name": f"Dr. {dept} Specialist", "department": dept} for dept in DEPARTMENTS]
    
    now = datetime.utcnow()
    
    new_prescriptions = []
    new_diagnoses = []
    new_bookings = []
    new_vitals = []
    
    print(f"Seeding data for {len(PATIENT_EMAILS)} patients...")
    
    for patient_email in PATIENT_EMAILS:
        patient_name = patient_email.split("@")[0].replace(".", " ").title()
        
        # Generate 3-6 prescriptions per patient
        for _ in range(random.randint(3, 6)):
            med = random.choice(MEDICATIONS)
            dept = random.choice(DEPARTMENTS)
            dept_docs = [d for d in doctors if d.get("department") == dept] or doctors
            doc = random.choice(dept_docs)
            
            created = now - timedelta(days=random.randint(1, 90), hours=random.randint(0, 23))
            
            new_prescriptions.append({
                "patient_email": patient_email,
                "patient_name": patient_name,
                "doctor_name": doc.get("name", "Dr. Unknown"),
                "doctor_department": dept,
                "medication": med[0],
                "dosage": med[1],
                "frequency": med[2],
                "duration": med[3],
                "notes": f"Take as directed. Follow up in {random.choice(['1 week', '2 weeks', '1 month'])}.",
                "status": random.choice(["active", "active", "active", "completed"]),
                "created_at": created.isoformat(),
            })
        
        # Generate 2-4 diagnoses per patient
        for _ in range(random.randint(2, 4)):
            cond = random.choice(CONDITIONS)
            dept = random.choice(DEPARTMENTS)
            dept_docs = [d for d in doctors if d.get("department") == dept] or doctors
            doc = random.choice(dept_docs)
            
            created = now - timedelta(days=random.randint(1, 180), hours=random.randint(0, 23))
            
            new_diagnoses.append({
                "patient_email": patient_email,
                "patient_name": patient_name,
                "doctor_name": doc.get("name", "Dr. Unknown"),
                "doctor_department": dept,
                "condition": cond[0],
                "severity": cond[1],
                "notes": cond[2],
                "created_at": created.isoformat(),
            })
        
        # Generate 4-8 bookings per patient (mix of past and future)
        for _ in range(random.randint(4, 8)):
            dept = random.choice(DEPARTMENTS)
            dept_docs = [d for d in doctors if d.get("department") == dept] or doctors
            doc = random.choice(dept_docs)
            
            # 70% past appointments, 30% future
            if random.random() < 0.7:
                days_offset = -random.randint(1, 60)
                status = random.choice(["completed", "completed", "attended", "missed", "cancelled"])
            else:
                days_offset = random.randint(1, 30)
                status = random.choice(["pending", "pending", "approved"])
            
            pref_date = (now + timedelta(days=days_offset)).strftime("%Y-%m-%d")
            pref_time = random.choice(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"])
            created = now - timedelta(days=abs(days_offset) + random.randint(1, 7))
            
            new_bookings.append({
                "patient_email": patient_email,
                "patient_name": patient_name,
                "department": dept,
                "doctor_name": doc.get("name", "Dr. Unknown"),
                "preferred_date": pref_date,
                "preferred_time": pref_time,
                "reason": random.choice(BOOKING_REASONS),
                "status": status,
                "created_at": created.isoformat(),
                "sla_deadline": (created + timedelta(hours=24)).isoformat(),
                "responded_at": (created + timedelta(hours=random.randint(1, 12))).isoformat() if status not in ["pending"] else None,
                "action_note": "" if status == "pending" else "Processed by system",
            })
        
        # Generate 3-5 vitals records per patient
        for _ in range(random.randint(3, 5)):
            recorded = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            # Simulate some abnormal readings occasionally
            bp_sys = random.randint(110, 140) + (20 if random.random() > 0.85 else 0)
            bp_dia = random.randint(70, 90) + (10 if random.random() > 0.85 else 0)
            
            new_vitals.append({
                "patient_email": patient_email,
                "patient_name": patient_name,
                "heart_rate": random.randint(65, 95) + (15 if random.random() > 0.9 else 0),
                "blood_pressure": f"{bp_sys}/{bp_dia}",
                "temperature": round(random.uniform(97.5, 99.5), 1),
                "oxygen_saturation": random.randint(95, 100) - (5 if random.random() > 0.95 else 0),
                "weight": round(random.uniform(55, 85), 1),
                "recorded_at": recorded.isoformat(),
                "recorded_by": "Nurse Station",
            })
    
    # Insert all data
    print(f"Inserting {len(new_prescriptions)} prescriptions...")
    if new_prescriptions and prescriptions_col:
        prescriptions_col.insert_many(new_prescriptions)
    
    print(f"Inserting {len(new_diagnoses)} diagnoses...")
    if new_diagnoses and diagnoses_col:
        diagnoses_col.insert_many(new_diagnoses)
    
    print(f"Inserting {len(new_bookings)} bookings...")
    if new_bookings and bookings_col:
        bookings_col.insert_many(new_bookings)
    
    print(f"Inserting {len(new_vitals)} vitals records...")
    if new_vitals and vitals_col:
        vitals_col.insert_many(new_vitals)
    
    print("\n✅ Successfully seeded patient data!")
    print(f"   - Prescriptions: {len(new_prescriptions)}")
    print(f"   - Diagnoses: {len(new_diagnoses)}")
    print(f"   - Bookings: {len(new_bookings)}")
    print(f"   - Vitals: {len(new_vitals)}")

if __name__ == "__main__":
    seed_patient_data()
