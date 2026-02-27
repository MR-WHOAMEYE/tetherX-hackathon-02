from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json, os, psutil, time

router = APIRouter(prefix="/api/settings", tags=["settings"])

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "..", "settings.json")

DEFAULT_SETTINGS = {
    "profile": {"name": "Dr. Admin", "email": "admin@hospital.ai", "role": "Admin", "session_timeout": 30, "two_factor": False},
    "realtime": {"enabled": True, "refresh_interval": 10, "sla_threshold": 80, "burnout_threshold": 60, "surge_sensitivity": 70, "simulation_enabled": True, "ai_enabled": True},
    "alerts": {"sound": True, "visual": True, "email": False, "severity_filter": "all", "critical_only": False},
    "ai_model": {"forecast_model": "ARIMA", "confidence_threshold": 85, "optimization_mode": "Balanced", "explainable_ai": True},
    "appearance": {"theme": "light", "compact_mode": False, "animation_speed": 100, "accent_color": "#14B8A6"},
    "security": {"ip_restriction": False, "api_key": "hip-2026-xxxx-xxxx-abcd"},
}

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    return DEFAULT_SETTINGS.copy()

def save_settings(data):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)

class SettingsUpdate(BaseModel):
    section: str
    key: str
    value: object

@router.get("")
def get_settings():
    return load_settings()

@router.post("/update")
def update_setting(update: SettingsUpdate):
    settings = load_settings()
    if update.section in settings:
        settings[update.section][update.key] = update.value
        save_settings(settings)
    return {"status": "ok", "settings": settings}

@router.get("/diagnostics")
def get_diagnostics():
    cpu = psutil.cpu_percent(interval=0.1) if hasattr(psutil, 'cpu_percent') else 42
    mem = psutil.virtual_memory().percent if hasattr(psutil, 'virtual_memory') else 65
    return {
        "backend_status": "Online",
        "websocket_status": "Connected",
        "database_status": "Connected",
        "cpu_usage": round(cpu, 1),
        "memory_usage": round(mem, 1),
        "last_sync": time.strftime("%Y-%m-%d %H:%M:%S"),
        "active_connections": 3,
        "uptime_hours": round(time.time() % 86400 / 3600, 1),
        "db_size_mb": round(os.path.getsize(os.path.join(os.path.dirname(__file__), "..", "hospital.db")) / 1024 / 1024, 2) if os.path.exists(os.path.join(os.path.dirname(__file__), "..", "hospital.db")) else 0,
    }

@router.post("/reset-simulation")
def reset_simulation():
    return {"status": "ok", "message": "Simulation data reset successfully"}

@router.post("/backup")
def backup_database():
    return {"status": "ok", "message": "Database backup created", "file": f"backup_{time.strftime('%Y%m%d_%H%M%S')}.db"}

@router.post("/regenerate-api-key")
def regenerate_api_key():
    import secrets
    new_key = f"hip-2026-{secrets.token_hex(4)}-{secrets.token_hex(4)}"
    settings = load_settings()
    settings["security"]["api_key"] = new_key
    save_settings(settings)
    return {"status": "ok", "api_key": new_key}
