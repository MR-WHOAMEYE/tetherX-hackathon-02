"""
Sentiment Intelligence — NLP-based patient feedback analysis.
Uses MongoDB only — no SQLite mock data.
"""
from fastapi import APIRouter
from collections import defaultdict
import os
import time
from typing import Any, Dict, Optional
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/sentiment", tags=["Sentiment Intelligence"])

from mongo import *

# Alias for the collection
feedback_col = patient_feedback_col

# Simple TTL cache
class TTLCache:
    def __init__(self, ttl_seconds: int = 60):
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

_sentiment_cache = TTLCache(ttl_seconds=60)

# MongoDB
@router.get("/analysis")
def sentiment_analysis():
    """NLP-based sentiment analysis with department ranking."""
    if feedback_col is None:
        return {"departments": [], "overall": {"avg_score": 0, "total_feedback": 0, "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0}}}
    
    # Check cache first
    cached = _sentiment_cache.get("analysis")
    if cached is not None:
        return cached

    feedbacks = list(feedback_col.find().limit(500))

    dept_stats = defaultdict(lambda: {
        "total": 0, "positive": 0, "neutral": 0, "negative": 0,
        "sum_score": 0, "sum_rating": 0, "texts": []
    })

    for f in feedbacks:
        score = f.get("sentiment_score", 0)
        d = dept_stats[f.get("department", "Unknown")]
        d["total"] += 1
        d["sum_score"] += score
        d["sum_rating"] += f.get("rating", 0)
        if score > 0.2:
            d["positive"] += 1
        elif score < -0.1:
            d["negative"] += 1
        else:
            d["neutral"] += 1
        if score < -0.1:
            d["texts"].append({"text": f.get("feedback_text", ""), "score": score, "rating": f.get("rating", 0)})

    results = []
    for dept, stats in dept_stats.items():
        avg_score = round(stats["sum_score"] / stats["total"], 3) if stats["total"] else 0
        avg_rating = round(stats["sum_rating"] / stats["total"], 1) if stats["total"] else 0
        dissatisfaction = round(stats["negative"] / stats["total"] * 100, 1) if stats["total"] else 0
        results.append({
            "department": dept,
            "avg_sentiment_score": avg_score,
            "avg_rating": avg_rating,
            "total_feedback": stats["total"],
            "positive_count": stats["positive"],
            "neutral_count": stats["neutral"],
            "negative_count": stats["negative"],
            "dissatisfaction_pct": dissatisfaction,
            "negative_samples": sorted(stats["texts"], key=lambda x: x["score"])[:5],
        })

    results.sort(key=lambda x: x["dissatisfaction_pct"], reverse=True)

    all_scores = [f.get("sentiment_score", 0) for f in feedbacks]
    overall = {
        "avg_score": round(sum(all_scores) / len(all_scores), 3) if all_scores else 0,
        "total_feedback": len(feedbacks),
        "sentiment_distribution": {
            "positive": sum(1 for s in all_scores if s > 0.2),
            "neutral": sum(1 for s in all_scores if -0.1 <= s <= 0.2),
            "negative": sum(1 for s in all_scores if s < -0.1),
        }
    }

    result = {"departments": results, "overall": overall}
    _sentiment_cache.set("analysis", result)
    return result
