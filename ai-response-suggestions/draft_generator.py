"""
Stage 3: Draft Response Generation
Generates a professional draft response using Gemini with context from previous stages.
Falls back to template-based responses if Gemini is unavailable.
"""
import json


DRAFT_PROMPT = """You are a professional hospital staff member writing a response to a patient query.

GUIDELINES:
- Be empathetic, professional, and concise
- Use the patient's name when addressing them
- Reference specific knowledge articles or patient data if available
- Do NOT disclose sensitive medical details — keep it HIPAA-aware
- Suggest next steps where appropriate (e.g., "please call our billing department at...")
- Keep the response to 3-6 sentences
- Do NOT use markdown formatting — write plain text suitable for email/messaging

PATIENT QUERY:
Name: {patient_name}
Subject: {subject}
Category: {category}
Urgency: {urgency}
Message: {message}

RELEVANT KNOWLEDGE:
{knowledge_context}

PATIENT CONTEXT:
{patient_context}

Write the draft response:"""


# Template-based fallback responses
TEMPLATES = {
    "billing": "Dear {patient_name},\n\nThank you for reaching out about your billing inquiry. We understand that billing matters are important to you. Our billing department will review your query and provide you with detailed information. You can also contact our billing helpdesk directly at extension 2050 for immediate assistance.\n\nPlease allow 1-2 business days for a detailed response. We appreciate your patience.",

    "appointment": "Dear {patient_name},\n\nThank you for your appointment-related query. We will check the availability and get back to you shortly with the best options. If this is urgent, please call our scheduling desk directly to arrange an immediate consultation.\n\nWe look forward to assisting you.",

    "medication": "Dear {patient_name},\n\nThank you for your medication-related question. Your health and safety are our top priority. A qualified staff member will review your query and respond with accurate guidance. For any urgent medication concerns, please contact your prescribing doctor or visit our pharmacy counter immediately.\n\nWe will respond within 24 hours.",

    "lab_results": "Dear {patient_name},\n\nThank you for inquiring about your lab results. Our team will review your query and coordinate with the relevant department to provide you with an update. Please note that some test results may take additional processing time. You can also check your patient portal for any available results.\n\nWe will follow up shortly.",

    "general": "Dear {patient_name},\n\nThank you for contacting us. We have received your query and a staff member will review it shortly. If your matter is urgent, please do not hesitate to call our front desk for immediate assistance.\n\nWe appreciate you reaching out and will respond as soon as possible.",
}


def _format_knowledge_context(articles: list[dict]) -> str:
    """Format knowledge articles into a readable context string."""
    if not articles:
        return "No specific knowledge articles found."

    parts = []
    for i, article in enumerate(articles[:5], 1):
        parts.append(f"{i}. {article.get('title', 'Untitled')}: {article.get('content', '')[:300]}")
    return "\n".join(parts)


def _format_patient_context(context: dict) -> str:
    """Format patient context into a readable string."""
    if not context:
        return "No patient-specific context available."

    parts = []
    if "recent_prescriptions" in context:
        rx_list = context["recent_prescriptions"]
        meds = ", ".join(f"{rx['medication']} ({rx['dosage']})" for rx in rx_list[:3])
        parts.append(f"Recent medications: {meds}")

    if "recent_bookings" in context:
        bk_list = context["recent_bookings"]
        bookings = ", ".join(f"{bk['department']} on {bk['preferred_date']} ({bk['status']})" for bk in bk_list[:3])
        parts.append(f"Recent appointments: {bookings}")

    if "latest_vitals" in context:
        v = context["latest_vitals"]
        parts.append(f"Latest vitals: BP {v.get('blood_pressure', 'N/A')}, HR {v.get('heart_rate', 'N/A')}")

    return "\n".join(parts) if parts else "No patient-specific context available."


def generate_draft_with_gemini(gemini_client, patient_name: str, subject: str,
                                category: str, urgency: str, message: str,
                                articles: list[dict], patient_context: dict) -> dict:
    """Generate draft response using Gemini AI."""
    prompt = DRAFT_PROMPT.format(
        patient_name=patient_name,
        subject=subject,
        category=category,
        urgency=urgency,
        message=message,
        knowledge_context=_format_knowledge_context(articles),
        patient_context=_format_patient_context(patient_context),
    )

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        config={
            "temperature": 0.5,
            "max_output_tokens": 512,
        }
    )

    draft_text = response.text.strip() if response.text else ""

    if not draft_text:
        raise ValueError("Gemini returned empty response")

    return {
        "draft_text": draft_text,
        "confidence_score": 0.85,
        "tone": "professional",
        "sources_used": [a.get("title", "") for a in articles[:5]],
    }


def generate_draft_fallback(patient_name: str, category: str) -> dict:
    """Template-based fallback when Gemini is unavailable."""
    template = TEMPLATES.get(category, TEMPLATES["general"])
    draft_text = template.format(patient_name=patient_name)

    return {
        "draft_text": draft_text,
        "confidence_score": 0.4,
        "tone": "professional",
        "sources_used": ["template"],
    }


def generate_draft(gemini_client, patient_name: str, subject: str,
                   category: str, urgency: str, message: str,
                   articles: list[dict], patient_context: dict) -> dict:
    """Main entry point: try Gemini, fall back to templates."""
    if gemini_client:
        try:
            return generate_draft_with_gemini(
                gemini_client, patient_name, subject,
                category, urgency, message, articles, patient_context
            )
        except Exception as e:
            print(f"[AI Pipeline] Draft generation Gemini error: {e}")

    return generate_draft_fallback(patient_name, category)
