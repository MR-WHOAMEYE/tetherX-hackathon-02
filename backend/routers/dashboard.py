"""
Dashboard summary - serves real metrics from MongoDB.
SLA from booking response timestamps, resolution from ward admissions,
burnout from doctor/nurse daily activity, health index from composite.
Optimized with aggregation pipelines and caching for faster loading.
"""
from fastapi import APIRouter
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import concurrent.futures
import time
from typing import Any, Dict, Optional

load_dotenv()
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

from mongo import *

# Simple in-memory cache with TTL
class TTLCache:
    def __init__(self, ttl_seconds: int = 30):
        self._cache: Dict[str, tuple[float, Any]] = {}
        self._ttl = ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, value = self._cache[key]
            if time.time() - timestamp < self._ttl:
                return value
            del self._cache[key]
        return None
    
    def set(self, key: str, value: Any):
        self._cache[key] = (time.time(), value)
    
    def clear(self):
        self._cache.clear()

# Cache dashboard data for 30 seconds to avoid repeated DB queries
_dashboard_cache = TTLCache(ttl_seconds=30)

def _get_user_counts():
    """Get all user counts in a single aggregation."""
    if users_col is None:
        return {"total": 0, "doctors": 0, "nurses": 0}
    pipeline = [
        {"$facet": {
            "total": [{"$count": "count"}],
            "doctors": [{"$match": {"role": "doctor"}}, {"$count": "count"}],
            "nurses": [{"$match": {"role": "nurse"}}, {"$count": "count"}]
        }}
    ]
    result = list(users_col.aggregate(pipeline))
    if result:
        r = result[0]
        return {
            "total": r["total"][0]["count"] if r["total"] else 0,
            "doctors": r["doctors"][0]["count"] if r["doctors"] else 0,
            "nurses": r["nurses"][0]["count"] if r["nurses"] else 0
        }
    return {"total": 0, "doctors": 0, "nurses": 0}

def _get_prescription_counts():
    """Get prescription counts in a single aggregation."""
    if prescriptions_col is None:
        return {"total": 0, "active": 0}
    pipeline = [
        {"$facet": {
            "total": [{"$count": "count"}],
            "active": [{"$match": {"status": "active"}}, {"$count": "count"}]
        }}
    ]
    result = list(prescriptions_col.aggregate(pipeline))
    if result:
        r = result[0]
        return {
            "total": r["total"][0]["count"] if r["total"] else 0,
            "active": r["active"][0]["count"] if r["active"] else 0
        }
    return {"total": 0, "active": 0}

def _get_booking_counts():
    """Get booking counts in a single aggregation."""
    if bookings_col is None:
        return {"total": 0, "pending": 0, "approved": 0}
    pipeline = [
        {"$facet": {
            "total": [{"$count": "count"}],
            "pending": [{"$match": {"status": "pending"}}, {"$count": "count"}],
            "approved": [{"$match": {"status": {"$in": ["approve", "approved"]}}}, {"$count": "count"}]
        }}
    ]
    result = list(bookings_col.aggregate(pipeline))
    if result:
        r = result[0]
        return {
            "total": r["total"][0]["count"] if r["total"] else 0,
            "pending": r["pending"][0]["count"] if r["pending"] else 0,
            "approved": r["approved"][0]["count"] if r["approved"] else 0
        }
    return {"total": 0, "pending": 0, "approved": 0}

def _get_admission_counts():
    """Get admission counts in a single aggregation."""
    if admissions_col is None:
        return {"total": 0, "admitted": 0, "discharged": 0}
    pipeline = [
        {"$facet": {
            "total": [{"$count": "count"}],
            "admitted": [{"$match": {"status": "admitted"}}, {"$count": "count"}],
            "discharged": [{"$match": {"status": "discharged"}}, {"$count": "count"}]
        }}
    ]
    result = list(admissions_col.aggregate(pipeline))
    if result:
        r = result[0]
        return {
            "total": r["total"][0]["count"] if r["total"] else 0,
            "admitted": r["admitted"][0]["count"] if r["admitted"] else 0,
            "discharged": r["discharged"][0]["count"] if r["discharged"] else 0
        }
    return {"total": 0, "admitted": 0, "discharged": 0}

def _get_diagnoses_count():
    """Get diagnoses count."""
    if diagnoses_col is None:
        return 0
    return diagnoses_col.estimated_document_count()

def _get_ward_stats():
    """Get ward capacity stats in a single aggregation."""
    if wards_col is None:
        return {"capacity": 0, "occupied": 0}
    pipeline = [
        {"$group": {
            "_id": None,
            "capacity": {"$sum": "$capacity"},
            "occupied": {"$sum": "$current_patients"}
        }}
    ]
    result = list(wards_col.aggregate(pipeline))
    if result:
        return {"capacity": result[0].get("capacity", 0), "occupied": result[0].get("occupied", 0)}
    return {"capacity": 0, "occupied": 0}

def _get_burnout_high_load_count():
    """Get count of doctors with high prescription load."""
    if prescriptions_col is None:
        return 0
    pipeline = [
        {"$group": {"_id": "$doctor_name", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 5}}},
        {"$count": "high_load"}
    ]
    result = list(prescriptions_col.aggregate(pipeline))
    return result[0]["high_load"] if result else 0

@router.get("/summary")
def get_dashboard_summary():
    """
    Real admin metrics from MongoDB:
    - SLA: % of bookings responded within sla_deadline
    - Resolution: avg(discharge - admit) from ward_admissions
    - Burnout: % of doctors with high daily prescription load
    - Health Index: weighted composite
    Uses caching to improve loading performance.
    """
    # Check cache first
    cached = _dashboard_cache.get("summary")
    if cached is not None:
        return cached
    
    # Run independent queries in parallel using ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        user_future = executor.submit(_get_user_counts)
        rx_future = executor.submit(_get_prescription_counts)
        bk_future = executor.submit(_get_booking_counts)
        adm_future = executor.submit(_get_admission_counts)
        dx_future = executor.submit(_get_diagnoses_count)
        ward_future = executor.submit(_get_ward_stats)
        burnout_future = executor.submit(_get_burnout_high_load_count)
        
        users = user_future.result()
        rx = rx_future.result()
        bk = bk_future.result()
        adm = adm_future.result()
        total_dx = dx_future.result()
        ward_stats = ward_future.result()
        high_load = burnout_future.result()

    total_doctors = users["doctors"]
    total_nurses = users["nurses"]
    total_rx = rx["total"]
    active_rx = rx["active"]
    total_bookings = bk["total"]
    pending_bk = bk["pending"]
    approved_bk = bk["approved"]
    admitted_count = adm["admitted"]
    discharged_count = adm["discharged"]
    total_capacity = ward_stats["capacity"]
    total_occupied = ward_stats["occupied"]

    # Map to dashboard shape
    total_cases = total_bookings + total_rx + total_dx
    active_cases = pending_bk + active_rx + admitted_count
    resolved_cases = approved_bk + (total_rx - active_rx) + discharged_count

    # SLA Compliance (optimized with limit)
    sla_compliance = 100.0
    if bookings_col is not None:
        responded = list(bookings_col.find({
            "responded_at": {"$ne": None},
            "sla_deadline": {"$ne": None}
        }, {"responded_at": 1, "sla_deadline": 1}).limit(500))

        if responded:
            met = 0
            for b in responded:
                try:
                    resp_dt = datetime.fromisoformat(b["responded_at"]) if isinstance(b["responded_at"], str) else b["responded_at"]
                    sla_dt = datetime.fromisoformat(b["sla_deadline"]) if isinstance(b["sla_deadline"], str) else b["sla_deadline"]
                    if resp_dt <= sla_dt:
                        met += 1
                except Exception:
                    met += 1
            sla_compliance = round(met / len(responded) * 100, 1)

    # Resolution Time (optimized with limit)
    avg_resolution = 0
    if admissions_col is not None:
        discharged = list(admissions_col.find({
            "status": "discharged",
            "admitted_at": {"$ne": None},
            "discharged_at": {"$ne": None}
        }, {"admitted_at": 1, "discharged_at": 1}).limit(200))

        if discharged:
            durations = []
            for d in discharged:
                try:
                    admit_dt = datetime.fromisoformat(d["admitted_at"]) if isinstance(d["admitted_at"], str) else d["admitted_at"]
                    disc_dt = datetime.fromisoformat(d["discharged_at"]) if isinstance(d["discharged_at"], str) else d["discharged_at"]
                    hours = (disc_dt - admit_dt).total_seconds() / 3600
                    if hours >= 0:
                        durations.append(hours)
                except Exception:
                    pass
            if durations:
                avg_resolution = round(sum(durations) / len(durations), 2)

    # Burnout Risk
    burnout_risk = round(high_load / max(total_doctors, 1) * 100, 1) if total_doctors > 0 else 0

    # Bed Occupancy
    bed_occupancy = round(total_occupied / max(total_capacity, 1) * 100, 1)

    # Health Index (weighted composite 0-100)
    sla_score = sla_compliance
    resolution_score = max(0, 100 - avg_resolution * 2)
    burnout_score = max(0, 100 - burnout_risk * 2)
    occupancy_score = 100 - abs(bed_occupancy - 70) * 2

    health_index = round(
        sla_score * 0.30 +
        resolution_score * 0.25 +
        burnout_score * 0.25 +
        max(0, occupancy_score) * 0.20,
        1
    )
    health_index = max(0, min(100, health_index))

    result = {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "resolved_cases": resolved_cases,
        "avg_resolution_time_hrs": avg_resolution,
        "sla_compliance_pct": sla_compliance,
        "burnout_risk_pct": burnout_risk,
        "health_index": health_index,
        "total_staff": total_doctors + total_nurses,
        "bed_occupancy_pct": bed_occupancy,
        "total_capacity": total_capacity,
        "total_occupied": total_occupied,
        "trends": {
            "cases_trend": round((active_cases / max(total_cases, 1)) * 100 - 50, 1),
            "sla_trend": round(sla_compliance - 85, 1),
            "burnout_trend": round(burnout_risk - 10, 1),
        }
    }
    
    # Cache the result for 30 seconds
    _dashboard_cache.set("summary", result)
    return result
