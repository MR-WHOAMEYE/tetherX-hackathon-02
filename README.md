# 🏥 MEDIX 
**AI-Driven Hospital Operational Intelligence & Strategic Decision Platform**

An enterprise-grade, AI-powered hospital operations monitoring and strategic decision-support system. It features a powerful **FastAPI** backend integrated with **MongoDB Atlas**, and a stunning **React/Vite** frontend with a **3D Digital Twin** of the hospital.

![MEDIX Logo](./frontend/public/MEDIX-Photoroom.png)

## 🚀 Live Demo
- **Frontend Vercel Deployment:** [medix.app](https://medix-15sd.vercel.app/)
---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Pydantic, Uvicorn |
| **Database** | MongoDB Atlas (Motor/PyMongo) |
| **AI/ML** | Google Gemini 1.5 Pro |
| **Frontend** | React (Vite), Tailwind CSS v4, Recharts, Framer Motion, Lucide React, Axios |
| **3D Engine** | React Three Fiber (R3F), Drei, Rapier (Physics) |
| **Hosting** | Vercel (Serverless Functions) |

---

## ✨ Key Features

| Module | Description |
|--------|-------------|
| **Executive Dashboard** | Real-time KPIs, hospital health index, and dynamic trend indicators. |
| **Workload Analytics** | Department & staff workload distribution, hourly heatmaps, and weekly trends. |
| **3D Digital Twin** | First-person interactive 3D replica of the hospital with live data overlays. |
| **Interactive Portals** | Dedicated dashboards for **Admins**, **Doctors**, **Nurses**, and **Patients**. |
| **AI Assistant** | Natural language interface powered by Gemini 1.5 Pro to query hospital data. |
| **Predictive Insights** | Burnout prediction, surge detection, and resource forecasting. |
| **Simulation Lab** | Interactive staffing simulation with immediate outcome prediction. |
| **Optimization Engine** | Optimal staffing allocation and automated resource recommendations. |
| **Risk & Alerts** | Real-time SLA breach, staff burnout, and patient surge alerts. |

---

## 💻 Local Development Setup

### 1. Backend Setup

```bash
cd backend
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file in the backend directory
# Example: MONGO_URI=mongodb+srv://... GEMINI_API_KEY=...

# Run the FastAPI server
python main.py
```
> The backend runs locally at: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Run the Vite development server
npm run dev
```
> The frontend runs locally at: **http://localhost:5173**

---

## 👥 Meet the Team

| Name | Role / Contribution | GitHub / LinkedIn |
|------|---------------------|-------------------|
| **Tharankeswaran** | Full Stack Developer & AI Integration | [GitHub Profile](https://github.com/Thanveer265) |
| **Mohan Kumar** | [Role Description] | [Link] |
| **Thanveer T** | [Role Description] | [Link] |
| **aks** | [Role Description] | [Link] |

*(Edit this section to add the rest of your incredible hackathon team!)*

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── mongo.py             # Centralized MongoDB Atlas Connection
│   ├── requirements.txt
│   ├── vercel.json          # Serverless deployment config
│   └── routers/             # API Endpoints (auth, workload, digital_twin, etc.)
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI elements (Charts, 3D Canvas, etc.)
│   │   ├── pages/           # Route views (Dashboard, Simulation, Portals)
│   │   ├── services/        # Axios API clients
│   │   └── App.jsx          # React Router setup
│   ├── vercel.json          # Frontend proxy configuration
│   └── index.html
└── README.md
```

---
*Built with zero intercept team  for improved healthcare operations and patient outcomes.*
