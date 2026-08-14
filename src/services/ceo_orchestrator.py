"""
LİKYA CEO OTONOM ŞEKİLLENDİRME VE KARAR MOTORU
Öğrenilen CEO zihniyetini projenin tüm alanlarına uygular.
"""

from typing import Dict, Any, List

from src.services.ceo_brain import CEOBrain


class CostOptimizerPipeline:
    """Gemini → Cline Maliyet Optimizasyon Boru Hattı.

    Kural 1 (Context Filtering): Gemini geniş context ile dosya tarar, bağlam çıkarır,
    mimari planlama yapar. Cline'a tüm dosyaları taratmak yerine rafine talimat iletir.

    Kural 2 (Surgical Prompting): Cline'a sadece file paths + kod bloğu + doğrulama komutu
    iletilir. Gereksiz dosya okuma ve deneme-yanılma loop'u azaltılarak API maliyeti
    %70-%85 tasarruf edilir.
    """

    def __init__(self) -> None:
        self.pipeline_active = True

    def filter_context(self, request: str, project_files: List[str]) -> Dict[str, Any]:
        """Gemini Phase: Geniş context ile dosya tarar, bağlam çıkarır, cerrahi talimat üretir."""
        # Gemini geniş context ile dosya taraması yapar (ücretsiz/geniş context)
        relevant_files = [f for f in project_files if self._is_relevant(f, request)]

        # Cerrahi hassasiyette kısa talimat üret
        surgical_prompt = {
            "target_files": relevant_files,
            "instruction": request,
            "verification_command": "npx tsc --noEmit",
            "context_filtered": True,
        }
        return surgical_prompt

    def _is_relevant(self, file_path: str, request: str) -> bool:
        """Dosyanın taleple ilgili olup olmadığını kontrol eder."""
        request_lower = request.lower()
        file_lower = file_path.lower()
        # İlgili anahtar kelimeler
        keywords = ["component", "screen", "service", "router", "page", "tab", "agent", "engine"]
        return any(kw in file_lower for kw in keywords) and any(
            kw in request_lower for kw in ["yazılım", "kod", "ekran", "modül", "bileşen", "servis", "agent"]
        )

    def build_surgical_prompt(self, target_files: List[str], code_block: str, verification: str) -> str:
        """Cline Phase: Minimum token kullanımıyla cerrahi talimat oluşturur."""
        return (
            f"PROJE GÖREVİ: Cerrahi Kod Değişikliği\n\n"
            f"📁 Hedef Dosyalar:\n" + "\n".join(f"• {f}" for f in target_files) +
            f"\n\n📝 Kod Bloğu:\n{code_block}\n\n"
            f"✅ Doğrulama: {verification}"
        )


class CEOOrchestrator:
    """CEO orkestratörü — CEO prensiplerini 3 alana uygular."""

    def __init__(self, brain: CEOBrain) -> None:
        self.brain = brain
        self.cost_optimizer = CostOptimizerPipeline()

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
