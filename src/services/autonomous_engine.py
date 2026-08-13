"""
LİKYA ULTRA-HIZLI OTONOM YAPAY ZEKA KARAR MOTORU
Fast-Path Autonomous AI Engine

Memory-Cache (<1ms) + Fast Intent Router (<30ms) + Fast-Path Response
"""

import time
import asyncio
from typing import Dict, Any, Optional
from collections import OrderedDict


class MemoryCache:
    """Sık gelen sorguları milisaniyeler içinde (<1ms) bellekten döndürür."""

    def __init__(self, max_size: int = 1000) -> None:
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self._max_size = max_size

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Cache'ten değer döndürür, varsa en sona taşır (LRU)."""
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]
        return None

    def set(self, key: str, value: Dict[str, Any]) -> None:
        """Değeri cache'e ekler, max boyutu aşarsa en eskiyi siler."""
        self._cache[key] = value
        self._cache.move_to_end(key)
        if len(self._cache) > self._max_size:
            self._cache.popitem(last=False)

    def clear(self) -> None:
        """Cache'i temizler."""
        self._cache.clear()


class FastIntentRouter:
    """Gelen kullanıcı girdisini asenkron olarak analiz eder, niyeti tespit eder."""

    INTENT_KEYWORDS: Dict[str, list[str]] = {
        "RECOVERY_OFFER": ["recovery", "iyileşme", "menü", "somon", "elektrolit", "protein"],
        "SERVICE_AUTO": ["arıza", "bakım", "turnike", "sensör", "iş emri", "kalibrasyon"],
        "SECURITY_ALERT": ["güvenlik", "ihlal", "acil", "tahliye", "yangın", "izinsiz"],
        "PAYMENT_ACTION": ["ödeme", "bakiye", "cüzdan", "prim", "maaş", "bordro"],
        "GENERAL_AI": [],
    }

    def __init__(self) -> None:
        self._cache = MemoryCache()

    async def route(self, content: str) -> str:
        """İçeriği analiz eder ve niyeti döndürür."""
        # Cache kontrolü
        cache_key = f"intent:{content[:50]}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached["intent"]

        # Asenkron analiz simülasyonu
        await asyncio.sleep(0.005)  # 5ms

        content_lower = content.lower()
        for intent, keywords in self.INTENT_KEYWORDS.items():
            if any(kw in content_lower for kw in keywords):
                self._cache.set(cache_key, {"intent": intent})
                return intent

        self._cache.set(cache_key, {"intent": "GENERAL_AI"})
        return "GENERAL_AI"


class FastPathResponse:
    """Ağır AI işlemlerini beklemeden anında yönlendirici ilk yanıtı üretir."""

    FAST_RESPONSES: Dict[str, str] = {
        "RECOVERY_OFFER": "Sporcu iyileşme menüsü hazırlanıyor! 🍽️",
        "SERVICE_AUTO": "Arıza tespit edildi, iş emri oluşturuluyor! 🔧",
        "SECURITY_ALERT": "Güvenlik protokolü devreye alındı! 🛡️",
        "PAYMENT_ACTION": "Ödeme işlemi başlatılıyor! 💳",
        "GENERAL_AI": "Likya Hub sizinle! Nasıl yardımcı olabilirim? 🤖",
    }

    def generate(self, intent: str) -> str:
        """Niyete göre anında yönlendirici yanıt üretir."""
        return self.FAST_RESPONSES.get(intent, self.FAST_RESPONSES["GENERAL_AI"])


class AutonomousEngine:
    """Ultra-hızlı otonom karar motoru."""

    def __init__(self) -> None:
        self._cache = MemoryCache()
        self._router = FastIntentRouter()
        self._responder = FastPathResponse()

    async def execute(self, source: str, user_id: str, event_type: str, content: str) -> Dict[str, Any]:
        """Ana yürütme fonksiyonu."""
        start_time = time.perf_counter()

        # 1. Memory-Cache kontrolü
        cache_key = f"{source}:{user_id}:{event_type}:{content[:50]}"
        cached = self._cache.get(cache_key)
        if cached:
            cached["latency_ms"] = round((time.perf_counter() - start_time) * 1000, 2)
            cached["from_cache"] = True
            return cached

        # 2. Fast Intent Router
        intent = await self._router.route(content)

        # 3. Fast-Path Response
        fast_response = self._responder.generate(intent)

        # 4. Sonucu cache'e kaydet
        result = {
            "source": source,
            "user_id": user_id,
            "event_type": event_type,
            "intent": intent,
            "fast_response": fast_response,
            "latency_ms": round((time.perf_counter() - start_time) * 1000, 2),
            "from_cache": False,
        }
        self._cache.set(cache_key, result)

        return result
