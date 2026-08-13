"""
LİKYA KRİZ ÇÖZÜCÜ (Retention & Recovery Engine)
Ahlak ve Üslup Filtreli Müşteri İlişkileri Asistanı

Akıllı Kriz Tetikleyici Matrisi + Centilmen AI Prompt Engine + Daze-Gift
"""

from typing import Optional
from pydantic import BaseModel


class FeedbackPayload(BaseModel):
    """Müşteri geri bildirim şeması."""

    user_id: str
    rating: int  # 1 ile 5 arası
    comment: Optional[str] = ""
    branch_id: str


class CrisisRecoveryEngine:
    """Kriz çözücü motoru — olumsuz tecrübeyi sadakate dönüştürür."""

    # Kritik kelimeler (CRITICAL_ALERT tetikleyicisi)
    CRITICAL_KEYWORDS = ["soğuk", "berbat", "ilgisiz", "kaba", "rezalet", "asla", "şikayet"]

    # Centilmen AI Sistem Rolü
    SYSTEM_ROLE = (
        "Sen dünyanın en nazik, zeki ve centilmen müşteri ilişkileri temsilcisisin. "
        "Müşteri ne kadar öfkeli olursa olsun, asla savunmacı bir dil kullanmazsın. "
        "Onu anladığını gösterir, naif ve tatlı bir dille özür diler, anında telafi önerisi sunarsın."
    )

    # Dönüş şablonları
    GENTLEMAN_RESPONSES = {
        "delayed": (
            "Biraz bekletip ağzınızın tadını kaçırdıysak çok mahcubuz! "
            "Mutfaktaki şefimizin heyecanına verin. Gönlünüzü almak için bir sonraki "
            "gelişinizde masanıza özel tatlı ikramımız (Daze-Gift) tanımlandı. "
            "Lütfen bizi bağışlayın! ☕🍰"
        ),
        "service": (
            "Bugün size hak ettiğiniz o sıcacık ev sahipliğini tam yansıtamadığımız "
            "için gerçekten üzgünüz. Centilmenlik vizyonumuza yakışmayan bu durumu "
            "telafi etmek adına bir sonraki kahveniz bizden. Sizi yeniden ağırlayıp "
            "yüzünüzü güldürmek için sabırsızlanıyoruz."
        ),
        "default": (
            "Ağzınızın tadını kaçırdıysak gerçekten mahcubuz! 😔 "
            "Gönlünüzü almak için bir sonraki ziyaretinizde geçerli ikram kuponunuz "
            "tanımlandı. Kupon Kodunuz: {gift_code} ☕"
        ),
    }

    @staticmethod
    def _detect_critical(comment: str) -> bool:
        """Kritik kelimeleri tespit eder."""
        comment_lower = comment.lower()
        return any(kw in comment_lower for kw in CrisisRecoveryEngine.CRITICAL_KEYWORDS)

    @staticmethod
    async def process_feedback(payload: FeedbackPayload) -> dict:
        """Müşteri geri bildirimini işler ve kriz çözümü uygular."""
        # 1. Olumlu Senaryo: Google Maps Yönlendirmesi
        if payload.rating >= 4:
            return {
                "action": "GOOGLE_MAPS_REDIRECT",
                "google_maps_url": "https://g.page/r/YOUR_BUSINESS_LINK/review",
                "message": "Harika deneyiminizi Google'da paylaşarak bize destek olmak ister misiniz? 🌟",
                "notify_staff": False,
            }

        # 2. Kritik Kelime Tespiti (CRITICAL_ALERT)
        is_critical = CrisisRecoveryEngine._detect_critical(payload.comment)

        # 3. Olumsuz Senaryo: Kriz Yönetimi & Daze-Gift Tetikleme
        gift_code = f"DAZE-RECOVERY-{payload.user_id[-4:]}"

        # Centilmen yanıt seçimi
        if "gecik" in payload.comment.lower() or "soğuk" in payload.comment.lower():
            gentleman_response = CrisisRecoveryEngine.GENTLEMAN_RESPONSES["delayed"]
        elif "ilgi" in payload.comment.lower() or "garson" in payload.comment.lower():
            gentleman_response = CrisisRecoveryEngine.GENTLEMAN_RESPONSES["service"]
        else:
            gentleman_response = CrisisRecoveryEngine.GENTLEMAN_RESPONSES["default"].format(
                gift_code=gift_code
            )

        return {
            "action": "CRITICAL_ALERT" if is_critical else "INTERNAL_RECOVERY",
            "daze_gift_code": gift_code,
            "message": gentleman_response,
            "notify_staff": True if payload.rating <= 2 or is_critical else False,
            "system_role": CrisisRecoveryEngine.SYSTEM_ROLE,
        }
