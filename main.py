"""
LİKYA SUPER APP - ANA GİRİŞ DOSYASI
FastAPI uygulaması ve otonom router entegrasyonu
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes.autonomous_router import router as autonomous_router

app = FastAPI(
    title="Likya Super App API",
    description="30-35 Dönüm Otonom Deneyim Parkı - Ultra-Hızlı Otonom Yapay Zeka Karar Motoru",
    version="1.0.0",
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Otonom router'ı ana uygulamaya ekle
app.include_router(autonomous_router)


@app.get("/")
async def root() -> dict:
    """Ana endpoint."""
    return {
        "app": "Likya Super App",
        "status": "online",
        "version": "1.0.0",
        "autonomous_engine": "Fast-Path Autonomous AI Engine",
    }


@app.get("/health")
async def health() -> dict:
    """Sağlık kontrolü."""
    return {"status": "healthy", "latency_ms": 0.5}
