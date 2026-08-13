"""
LİKYA CEO OTONOM ŞEKİLLENDİRME VE KARAR MOTORU
Öğrenilen CEO zihniyetini projenin tüm alanlarına uygular.
"""

from typing import Dict, Any

from src.services.ceo_brain import CEOBrain


class CEOOrchestrator:
    """CEO orkestratörü — CEO prensiplerini 3 alana uygular."""

    def __init__(self, brain: CEOBrain) -> None:
        self.brain = brain

    def shape_software(self, code_rule: str) -> Dict[str, Any]:
        """Yazılım & Mimari: Kodlama standartlarını CEO prensiplerine göre denetler."""
        self.brain.set_decision_criteria(f"Yazılım Kuralı: {code_rule}")
        return {
            "area": "Yazılım & Mimari",
            "applied_rule": code_rule,
            "status": "Uygulandı",
        }

    def shape_communication(self, message: str) -> Dict[str, Any]:
        """İnsan İlişkileri & İletişim: Yanıtları naif, centilmen, zeki ve esprili süzgeçten geçirir."""
        style = self.brain.memory["style"].get("müşteri_iletişim", "Centilmen, naif, asla savunmaya geçmeyen")
        filtered_message = f"[{style}] {message}"
        return {
            "area": "İnsan İlişkileri & İletişim",
            "original": message,
            "filtered": filtered_message,
            "style": style,
        }

    def shape_operations(self, operation: str) -> Dict[str, Any]:
        """İş & Operasyon: Krizleri, ikramları ve kampanya süreçlerini CEO vizyonuna göre yönlendirir."""
        vision = self.brain.memory["vision"] or "Likya vizyonu"
        return {
            "area": "İş & Operasyon",
            "operation": operation,
            "guided_by": vision,
            "status": "CEO vizyonuna göre yönlendirildi",
        }
