"""
Pydantic data models for the AI Response Suggestions system.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# ── Patient Query Models ──

class PatientQueryCreate(BaseModel):
    """Schema for a patient submitting a new query."""
    patient_email: str
    patient_name: str
    subject: str
    category: Literal["billing", "appointment", "medication", "lab_results", "general"] = "general"
    message: str
    priority: Literal["low", "medium", "high", "urgent"] = "medium"


class PatientQueryOut(BaseModel):
    """Schema for returning a patient query."""
    id: str
    patient_email: str
    patient_name: str
    subject: str
    category: str
    message: str
    priority: str
    status: str  # pending | ai_drafted | staff_reviewing | responded | closed
    created_at: str
    responded_at: Optional[str] = None
    assigned_staff: Optional[str] = None
    final_response: Optional[str] = None


# ── Draft Response Models ──

class DraftResponseOut(BaseModel):
    """Schema for an AI-generated draft response."""
    id: str
    query_id: str
    draft_text: str
    intent: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    knowledge_sources: list[str] = []
    status: str  # generated | reviewing | approved | sent | rejected
    created_at: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    staff_notes: Optional[str] = None


class StaffReviewRequest(BaseModel):
    """Schema for staff reviewing/editing a draft."""
    edited_text: Optional[str] = None
    staff_notes: Optional[str] = None
    staff_email: Optional[str] = None
    action: Literal["approve", "edit_and_approve", "reject", "reassign"]


class DraftSendRequest(BaseModel):
    """Schema for staff sending the final response."""
    staff_email: Optional[str] = None


# ── Knowledge Base Models ──

class KnowledgeArticleCreate(BaseModel):
    """Schema for adding a FAQ/knowledge article."""
    title: str
    category: Literal["billing", "appointment", "medication", "lab_results", "general"]
    content: str
    tags: list[str] = []


class KnowledgeArticleOut(BaseModel):
    """Schema for returning a knowledge article."""
    id: str
    title: str
    category: str
    content: str
    tags: list[str] = []
    created_at: str


# ── Pipeline Internal Models ──

class IntentResult(BaseModel):
    """Output of the intent classification stage."""
    category: str
    urgency: str  # low | medium | high | critical
    confidence: float = Field(ge=0.0, le=1.0)
    key_topics: list[str] = []


class RetrievalResult(BaseModel):
    """Output of the knowledge retrieval stage."""
    articles: list[dict] = []
    patient_context: dict = {}
    sources: list[str] = []


class DraftResult(BaseModel):
    """Output of the draft generation stage."""
    draft_text: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    tone: str = "professional"
    sources_used: list[str] = []


class PipelineState(BaseModel):
    """Full state passed through the LangGraph pipeline."""
    query_id: str
    patient_email: str
    patient_name: str
    subject: str
    message: str
    category: str = ""
    priority: str = "medium"
    # Filled by stages
    intent: Optional[IntentResult] = None
    retrieval: Optional[RetrievalResult] = None
    draft: Optional[DraftResult] = None
    error: Optional[str] = None
