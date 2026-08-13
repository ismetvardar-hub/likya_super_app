"""
LİKYA CEO API ROUTE KATMANI
GET /api/v1/ceo/next-question, POST /api/v1/ceo/answer, GET /api/v1/ceo/mindset
"""

from fastapi import APIRouter
from pydantic import BaseModel

from src.services.ceo_brain import CEOBrain
from src.services.ceo_interview import CEOInterviewEngine
from src.services.ceo_orchestrator import CEOOrchestrator

router = APIRouter(prefix="/api/v1/ceo", tags=["ceo"])

# Global CEO servisleri
brain = CEOBrain()
interview = CEOInterviewEngine(brain)
orchestrator = CEOOrchestrator(brain)


class AnswerRequest(BaseModel):
    """CEO cevap istek şeması."""

    question_id: str
    answer: str


@router.get("/next-question")
async def get_next_question() -> dict:
    """Likya CEO'nun kullanıcıyı tanımak için soracağı sıradaki soruyu getirir."""
    return interview.get_next_question()


@router.post("/answer")
async def process_answer(request: AnswerRequest) -> dict:
    """Kullanıcının cevabını alır, beyine işler ve güncellenmiş düşünme tarzını döndürür."""
    return interview.process_answer(request.question_id, request.answer)


@router.get("/mindset")
async def get_mindset() -> dict:
    """Şu anki CEO yapay zeka profilini ve kurallarını listeler."""
    return brain.get_mindset()
