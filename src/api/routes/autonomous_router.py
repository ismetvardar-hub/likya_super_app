"""
LİKYA OTONOM ROUTER - API Route Katmanı
POST /api/v1/autonomous/execute endpoint'i
"""

import time
from typing import Optional
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, Field

from src.services.autonomous_engine import AutonomousEngine
from src.services.crisis_recovery_engine import CrisisRecoveryEngine, FeedbackPayload

router = APIRouter(prefix="/api/v1/autonomous", tags=["autonomous"])

# Global motor örneği
engine = AutonomousEngine()
crisis_engine = CrisisRecoveryEngine()


class AutonomousRequest(BaseModel):
    """Otonom motor istek şeması."""

    source: str = Field(..., description="Kaynak (mobile, web, iot, crew)")
    user_id: str = Field(..., description="Kullanıcı ID")
    event_type: str = Field(..., description="Olay tipi (RECOVERY_OFFER, SERVICE_AUTO, vb.)")
    content: str = Field(..., description="Kullanıcı girdisi / içerik")


class AutonomousResponse(BaseModel):
    """Otonom motor yanıt şeması."""

    source: str
    user_id: str
    event_type: str
    intent: str
    fast_response: str
    latency_ms: float
    from_cache: bool


async def background_task(source: str, user_id: str, event_type: str, content: str) -> None:
    """Ağır veritabanı kayıtları ve LLM/API iş yüklerini arka planda çalıştırır."""
    # Simülasyon: ağır işlemler
    await asyncio_sleep(0.1)
    # Burada Supabase log kaydı, LLM çağrısı vb. yapılabilir
    print(f"[Background] {source}:{user_id}:{event_type} işlendi")


async def asyncio_sleep(seconds: float) -> None:
    """Asenkron uyku yardımcısı."""
    import asyncio
    await asyncio.sleep(seconds)


@router.post("/execute", response_model=AutonomousResponse)
async def execute_autonomous(request: AutonomousRequest, background_tasks: BackgroundTasks) -> AutonomousResponse:
    """Otonom motoru çalıştırır, hızlı yanıt döner, ağır işleri arka plana atar."""
    start_time = time.perf_counter()

    # Otonom motoru çalıştır
    result = await engine.execute(
        source=request.source,
        user_id=request.user_id,
        event_type=request.event_type,
        content=request.content,
    )

    # Ağır işleri arka plana at
    background_tasks.add_task(
        background_task,
        request.source,
        request.user_id,
        request.event_type,
        request.content,
    )

    # Latency'yi güncelle
    result["latency_ms"] = round((time.perf_counter() - start_time) * 1000, 2)

    return AutonomousResponse(**result)


@router.post("/feedback")
async def process_feedback(payload: FeedbackPayload) -> dict:
    """Müşteri geri bildirimini işler ve kriz çözümü uygular."""
    result = await crisis_engine.process_feedback(payload)
    return result
