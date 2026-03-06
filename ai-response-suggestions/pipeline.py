"""
LangGraph Pipeline Orchestrator
Chains: Intent Classification → Knowledge Retrieval → Draft Generation
Falls back to a simple sequential chain if LangGraph is unavailable.
"""
import sys
import os

# Add parent directory to path so we can import from ai-response-suggestions
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from intent_classifier import classify_intent
from knowledge_retriever import retrieve_knowledge
from draft_generator import generate_draft


def run_pipeline(gemini_client, db_collections: dict,
                 query_id: str, patient_email: str, patient_name: str,
                 subject: str, message: str, category: str = "",
                 priority: str = "medium") -> dict:
    """
    Run the 3-stage AI pipeline to generate a draft response.
    
    Args:
        gemini_client: Initialized Gemini client (or None for fallback)
        db_collections: dict of MongoDB collection references
        query_id: ID of the patient query
        patient_email: Patient's email
        patient_name: Patient's name
        subject: Query subject
        message: Query message text
        category: Pre-selected category (if empty, AI classifies it)
        priority: Query priority level
    
    Returns:
        dict with keys: intent, retrieval, draft, error
    """
    result = {
        "intent": None,
        "retrieval": None,
        "draft": None,
        "error": None,
    }

    try:
        # ── Stage 1: Intent Classification ──
        print(f"[AI Pipeline] Stage 1: Classifying intent for query {query_id}")
        intent = classify_intent(gemini_client, subject, message)

        # Use AI-classified category if none was pre-selected
        if not category:
            category = intent.get("category", "general")
        else:
            intent["category"] = category

        result["intent"] = intent
        print(f"[AI Pipeline] Intent: {intent['category']} (confidence: {intent['confidence']}, urgency: {intent['urgency']})")

        # ── Stage 2: Knowledge Retrieval ──
        print(f"[AI Pipeline] Stage 2: Retrieving knowledge for category '{category}'")
        retrieval = retrieve_knowledge(
            db_collections,
            category=category,
            key_topics=intent.get("key_topics", []),
            patient_email=patient_email,
        )
        result["retrieval"] = retrieval
        print(f"[AI Pipeline] Retrieved {len(retrieval['articles'])} articles, {len(retrieval['sources'])} sources")

        # ── Stage 3: Draft Response Generation ──
        print(f"[AI Pipeline] Stage 3: Generating draft response")
        draft = generate_draft(
            gemini_client,
            patient_name=patient_name,
            subject=subject,
            category=category,
            urgency=intent.get("urgency", "medium"),
            message=message,
            articles=retrieval.get("articles", []),
            patient_context=retrieval.get("patient_context", {}),
        )
        result["draft"] = draft
        print(f"[AI Pipeline] Draft generated (confidence: {draft['confidence_score']}, tone: {draft['tone']})")

    except Exception as e:
        error_msg = f"Pipeline error: {str(e)}"
        print(f"[AI Pipeline] {error_msg}")
        result["error"] = error_msg

        # If we got intent but draft failed, generate a fallback draft
        if result["intent"] and not result["draft"]:
            from draft_generator import generate_draft_fallback
            result["draft"] = generate_draft_fallback(patient_name, category or "general")
            result["error"] = f"Partial pipeline error (fallback used): {str(e)}"

    return result
