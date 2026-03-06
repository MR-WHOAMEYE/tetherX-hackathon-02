"""
Stage 1: Intent Classification
Classifies patient queries into categories and extracts urgency using Gemini.
Falls back to keyword-based classification if Gemini is unavailable.
"""
import json
import re


INTENT_PROMPT = """You are a hospital query classifier. Analyze the patient query below and return a JSON object with:
- "category": one of ["billing", "appointment", "medication", "lab_results", "general"]
- "urgency": one of ["low", "medium", "high", "critical"]
- "confidence": a float between 0.0 and 1.0
- "key_topics": list of 1-3 key topics extracted from the query

Patient Query:
Subject: {subject}
Message: {message}

Return ONLY valid JSON, no markdown formatting or extra text."""


# Keyword mapping for fallback
KEYWORD_MAP = {
    "billing": ["bill", "charge", "payment", "insurance", "cost", "fee", "refund", "invoice", "receipt"],
    "appointment": ["appointment", "schedule", "book", "reschedule", "cancel", "visit", "slot", "availability", "doctor visit"],
    "medication": ["medicine", "medication", "prescription", "drug", "dosage", "side effect", "refill", "pharmacy", "tablet", "dose"],
    "lab_results": ["lab", "test", "result", "report", "blood", "scan", "x-ray", "mri", "ct", "biopsy", "sample"],
}

URGENCY_KEYWORDS = {
    "critical": ["emergency", "urgent", "immediately", "severe", "critical", "life-threatening", "chest pain", "breathing"],
    "high": ["soon", "asap", "worried", "pain", "bleeding", "fever", "reaction", "allergic"],
    "medium": ["question", "wondering", "could you", "please", "help", "need"],
    "low": ["curious", "general", "information", "just wanted", "when convenient"],
}


def classify_intent_with_gemini(gemini_client, subject: str, message: str) -> dict:
    """Classify intent using Gemini AI."""
    prompt = INTENT_PROMPT.format(subject=subject, message=message)

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        config={
            "temperature": 0.1,
            "max_output_tokens": 256,
        }
    )

    text = response.text.strip()
    # Strip markdown code fences if present
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'\s*```$', '', text)

    result = json.loads(text)

    # Validate and clamp values
    valid_categories = ["billing", "appointment", "medication", "lab_results", "general"]
    valid_urgencies = ["low", "medium", "high", "critical"]

    return {
        "category": result.get("category", "general") if result.get("category") in valid_categories else "general",
        "urgency": result.get("urgency", "medium") if result.get("urgency") in valid_urgencies else "medium",
        "confidence": min(max(float(result.get("confidence", 0.5)), 0.0), 1.0),
        "key_topics": result.get("key_topics", [])[:5],
    }


def classify_intent_fallback(subject: str, message: str) -> dict:
    """Keyword-based fallback when Gemini is unavailable."""
    text = f"{subject} {message}".lower()

    # Detect category
    category = "general"
    best_score = 0
    for cat, keywords in KEYWORD_MAP.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            category = cat

    # Detect urgency
    urgency = "medium"
    for level in ["critical", "high", "medium", "low"]:
        if any(kw in text for kw in URGENCY_KEYWORDS[level]):
            urgency = level
            break

    return {
        "category": category,
        "urgency": urgency,
        "confidence": 0.6 if best_score > 0 else 0.3,
        "key_topics": [],
    }


def classify_intent(gemini_client, subject: str, message: str) -> dict:
    """Main entry point: try Gemini, fall back to keywords."""
    if gemini_client:
        try:
            return classify_intent_with_gemini(gemini_client, subject, message)
        except Exception as e:
            print(f"[AI Pipeline] Intent classification Gemini error: {e}")

    return classify_intent_fallback(subject, message)
