from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import (
    dashboard, workload, sla, predictive, root_cause,
    digital_twin, simulation, optimization, sentiment,
    alerts, strategic, financial, assistant, reports, settings,
    auth, patient_api, doctor_api, nurse_api, admin_api, ward_api
)

app = FastAPI(
    title="Hospital Operational Intelligence Platform",
    description="AI-Driven Hospital Operational Intelligence & Strategic Decision Platform",
    version="1.0.0",
)

# CORS — allow Vercel frontend + localhost dev
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
origins = ALLOWED_ORIGINS.split(",") if ALLOWED_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(workload.router)
app.include_router(sla.router)
app.include_router(predictive.router)
app.include_router(root_cause.router)
app.include_router(digital_twin.router)
app.include_router(simulation.router)
app.include_router(optimization.router)
app.include_router(sentiment.router)
app.include_router(alerts.router)
app.include_router(strategic.router)
app.include_router(financial.router)
app.include_router(assistant.router)
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(auth.router)
app.include_router(patient_api.router)
app.include_router(doctor_api.router)
app.include_router(nurse_api.router)
app.include_router(admin_api.router)
app.include_router(ward_api.router)


@app.get("/")
def root():
    return {"message": "Hospital Intelligence Platform API", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
