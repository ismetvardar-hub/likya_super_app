"""
LİKYA CEO ETKİLEŞİMLİ MÜLAKAT VE SORUŞTURMA MOTORU
Kullanıcıya stratejik sorular sorar, yanıtları kategorize eder ve beyne işler.
"""

from typing import Dict, Any, List

from src.services.ceo_brain import CEOBrain


class CEOInterviewEngine:
    """CEO mülakat motoru — kullanıcının vizyonunu öğrenir."""

    QUESTIONS: List[Dict[str, str]] = [
        {
            "id": "q1",
            "category": "İnsan İlişkileri",
            "question": "İş ilişkilerinde ve kriz anlarında temel duruşun nedir?",
        },
        {
            "id": "q2",
            "category": "Yazılım",
            "question": "Yazılım mimarisinde senin için vazgeçilmez olan 3 temel kural nedir?",
        },
        {
            "id": "q3",
            "category": "Üslup",
            "question": "Müşteri iletişiminde üslup ve ahlak sınırların nasıl olmalı?",
        },
        {
            "id": "q4",
            "category": "İş Modeli",
            "question": "İş modelinde öncelik verdiğin gelir ve büyüme stratejisi nedir?",
        },
        {
            "id": "q5",
            "category": "İnsan İlişkileri",
            "question": "Personel ve kiracılarla ilişkilerde adalet ve liyakat nasıl işlemeli?",
        },
    ]

    def __init__(self, brain: CEOBrain) -> None:
        self.brain = brain
        self._question_index = 0

    def get_next_question(self) -> Dict[str, str]:
        """Sıradaki soruyu döndürür."""
        question = self.QUESTIONS[self._question_index % len(self.QUESTIONS)]
        self._question_index += 1
        return question

    def process_answer(self, question_id: str, answer: str) -> Dict[str, Any]:
        """Kullanıcının cevabını analiz eder, kategorize eder ve beyne işler."""
        # Soruyu bul
        question = next((q for q in self.QUESTIONS if q["id"] == question_id), None)
        if not question:
            return {"success": False, "error": "Soru bulunamadı"}

        category = question["category"]

        # Cevabı beyne işle
        self.brain.learn(category, answer)

        # Kategoriye göre ek işlemler
        if category == "Üslup":
            self.brain.set_style("müşteri_iletişim", answer)
        elif category == "Yazılım":
            self.brain.set_decision_criteria(answer)
        elif category == "İnsan İlişkileri":
            self.brain.set_principle(answer)
        elif category == "İş Modeli":
            self.brain.set_vision(answer)

        # Güncellenmiş düşünme tarzını döndür
        return {
            "success": True,
            "category": category,
            "learned": answer,
            "mindset": self.brain.synthesize_master_prompt(),
        }
