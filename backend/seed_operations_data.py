"""
Seed operations mock data for workload, SLA, and risk management.
"""
import random
from datetime import datetime, timedelta
from mongo import mdb, bookings_col, wards_col, prescriptions_col, diagnoses_col, vitals_col
import uuid

def seed_operations_data():
    if mdb is None:
        print("MongoDB not connected")
        return

    now = datetime.utcnow()
    departments = ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "ICU"]
    doctor_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Miller", "Wilson"]

    # ======== 1. ADD SLA FIELDS TO EXISTING BOOKINGS ========
    print("Updating bookings with SLA data...")
    all_bookings = list(bookings_col.find({}))
    updates = 0
    for b in all_bookings:
        created = b.get("created_at")
        status = b.get("status", "pending")
        
        if created:
            try:
                created_dt = datetime.fromisoformat(created) if isinstance(created, str) else created
                sla_hours = random.choice([24, 36, 48])
                sla_deadline = created_dt + timedelta(hours=sla_hours)
                
                update_fields = {"sla_deadline": sla_deadline.isoformat()}
                
                if status in ["completed", "approved", "cancelled", "no-show"]:
                    if random.random() > 0.15:
                        responded_hrs = random.uniform(1, sla_hours - 2)
                    else:
                        responded_hrs = sla_hours + random.uniform(2, 12)
                    responded_at = created_dt + timedelta(hours=responded_hrs)
                    update_fields["responded_at"] = responded_at.isoformat()
                
                bookings_col.update_one({"_id": b["_id"]}, {"$set": update_fields})
                updates += 1
            except:
                pass
    print(f"  Updated {updates} bookings with SLA fields")

    # ======== 2. SEED WARDS COLLECTION ========
    print("Seeding wards collection...")
    wards_col.delete_many({})

    ward_data = []
    for dept in departments:
        num_wards = random.randint(2, 4)
        for i in range(num_wards):
            capacity = random.choice([10, 12, 15, 20, 25])
            if dept == "Emergency":
                occupancy_rate = random.uniform(0.75, 0.98)
            elif dept == "ICU":
                occupancy_rate = random.uniform(0.70, 0.95)
            else:
                occupancy_rate = random.uniform(0.40, 0.85)
            
            ward_data.append({
                "ward_id": f"{dept[:3].upper()}-W{i+1}",
                "name": f"{dept} Ward {i+1}",
                "department": dept,
                "capacity": capacity,
                "current_patients": int(capacity * occupancy_rate),
                "available_beds": int(capacity * (1 - occupancy_rate)),
                "status": "operational",
                "updated_at": now.isoformat()
            })

    wards_col.insert_many(ward_data)
    print(f"  Created {len(ward_data)} wards")

    # ======== 3. ADD PENDING BOOKINGS FOR SLA ALERTS ========
    print("Creating pending bookings with near-SLA deadlines...")
    pending_bookings = []
    for i in range(25):
        dept = random.choice(departments)
        hours_until_deadline = random.choice([-5, -2, -1, 1, 2, 3, 6, 8, 12])
        created_at = now - timedelta(hours=random.randint(20, 40))
        sla_deadline = now + timedelta(hours=hours_until_deadline)
        
        pending_bookings.append({
            "booking_id": str(uuid.uuid4()),
            "patient_name": f"Patient {random.randint(5000, 9999)}",
            "patient_email": f"patient{random.randint(1000,9999)}@hospital.com",
            "department": dept,
            "doctor_name": f"Dr. {random.choice(doctor_names)}",
            "status": "pending",
            "preferred_date": (now + timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d"),
            "preferred_time": f"{random.randint(9, 17)}:00",
            "created_at": created_at.isoformat(),
            "sla_deadline": sla_deadline.isoformat(),
            "reason": "Regular checkup"
        })

    bookings_col.insert_many(pending_bookings)
    print(f"  Added {len(pending_bookings)} pending bookings for SLA monitoring")

    # ======== 4. ADD PRESCRIPTIONS FOR BURNOUT ALERTS ========
    print("Creating high-load prescriptions...")
    heavy_load_doctors = [
        {"name": "Dr. Sarah Chen", "dept": "Emergency"},
        {"name": "Dr. Michael Patel", "dept": "Cardiology"},
        {"name": "Dr. Jennifer Lopez", "dept": "ICU"},
    ]
    medications = ["Amoxicillin", "Lisinopril", "Metformin", "Atorvastatin", "Omeprazole"]
    frequencies = ["Once daily", "Twice daily", "Every 8 hours"]
    dosages = ["daily", "twice daily"]
    
    new_rx = []
    for doc in heavy_load_doctors:
        for j in range(random.randint(7, 12)):
            new_rx.append({
                "prescription_id": f"RX-{random.randint(50000, 99999)}",
                "patient_name": f"Patient {random.randint(1000, 9999)}",
                "patient_email": f"patient{random.randint(1000,9999)}@hospital.com",
                "doctor_name": doc["name"],
                "doctor_department": doc["dept"],
                "medication": random.choice(medications),
                "dosage": f"{random.randint(1,2)} tablet(s) {random.choice(dosages)}",
                "frequency": random.choice(frequencies),
                "duration": f"{random.randint(7, 30)} days",
                "status": "active",
                "created_at": (now - timedelta(days=random.randint(1, 5))).isoformat()
            })

    prescriptions_col.insert_many(new_rx)
    print(f"  Added {len(new_rx)} active prescriptions for burnout monitoring")

    # ======== 5. ADD DIAGNOSES ========
    print("Creating diagnoses data...")
    conditions = ["Hypertension", "Type 2 Diabetes", "Asthma", "Osteoarthritis", "Migraine", "Arrhythmia", "Bronchitis", "Pneumonia"]
    severities = ["Low", "Medium", "High", "Critical"]
    
    new_diagnoses = []
    for i in range(50):
        dept = random.choice(departments)
        new_diagnoses.append({
            "diagnosis_id": f"DX-{random.randint(10000, 99999)}",
            "patient_name": f"Patient {random.randint(1000, 9999)}",
            "patient_email": f"patient{random.randint(1000,9999)}@hospital.com",
            "doctor_name": f"Dr. {random.choice(doctor_names)}",
            "doctor_department": dept,
            "condition": random.choice(conditions),
            "severity": random.choice(severities),
            "notes": "Generated for dashboard testing",
            "created_at": (now - timedelta(days=random.randint(1, 14))).isoformat()
        })
    
    diagnoses_col.insert_many(new_diagnoses)
    print(f"  Added {len(new_diagnoses)} diagnoses")

    # ======== 6. ADD VITALS ========
    print("Creating vitals data...")
    new_vitals = []
    for i in range(100):
        recorded = now - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
        new_vitals.append({
            "patient_name": f"Patient {random.randint(1000, 9999)}",
            "patient_email": f"patient{random.randint(1000,9999)}@hospital.com",
            "heart_rate": random.randint(60, 100) + (20 if random.random() > 0.9 else 0),
            "blood_pressure": f"{random.randint(110, 150)}/{random.randint(70, 95)}",
            "bp_systolic": random.randint(110, 150),
            "bp_diastolic": random.randint(70, 95),
            "temperature": round(random.uniform(97.0, 100.5), 1),
            "oxygen_saturation": random.randint(92, 100),
            "weight": random.randint(120, 220),
            "recorded_at": recorded.isoformat()
        })
    
    vitals_col.insert_many(new_vitals)
    print(f"  Added {len(new_vitals)} vitals records")

    print("")
    print("Operations mock data seeded successfully!")
    print("   - SLA fields added to bookings")
    print("   - Wards with capacity/occupancy created")
    print("   - Pending bookings with near-SLA deadlines added")
    print("   - High-load staff prescriptions added")
    print("   - Diagnoses and vitals records added")

if __name__ == "__main__":
    seed_operations_data()
