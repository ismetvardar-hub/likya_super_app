"""
LİKYA CEO KALICI HAFIZA VE BEYİN SERVİSİ
Kullanıcının prensiplerini, karar alma kriterlerini, üslup ve vizyonunu saklar.
"""

import json
import os
from typing import Dict, Any, List


class CEOBrain:
    """CEO'nun kalıcı hafızası — prensipleri ve vizyonu saklar."""

    MEMORY_FILE = "ceo_brain.json"

    def __init__(self, memory_file: str = MEMORY_FILE) -> None:
        self.memory_file = memory_file
        self.memory: Dict[str, Any] = self._load()

    def _load(self) -> Dict[str, Any]:
        """Hafızayı JSON dosyasından yükler."""
        if os.path.exists(self.memory_file):
            with open(self.memory_file) as f:
                return json.load(f)
        return {
            "principles": [],
            "decision_criteria": [],
            "style": {},
            "vision": "",
            "categories": {
                "Üslup": [],
                "Yazılım": [],
                "İnsan İlişkileri": [],
                "İş Modeli": [],
            },
        }

    def _save(self) -> None:
        """Hafızayı JSON dosyasına kaydeder."""
        with open(self.memory_file, "w") as f:
            json.dump(self.memory, f, ensure_ascii=False, indent=2)

    def learn(self, category: str, content: str) -> None:
        """Yeni bilgiyi hafızaya işler."""
        if category in self.memory["categories"]:
            self.memory["categories"][category].append(content)
        else:
            self.memory["categories"][category] = [content]
        self._save()

    def set_principle(self, principle: str) -> None:
        """Yeni bir prensip ekler."""
        self.memory["principles"].append(principle)
        self._save()

    def set_decision_criteria(self, criteria: str) -> None:
        """Yeni bir karar alma kriteri ekler."""
        self.memory["decision_criteria"].append(criteria)
        self._save()

    def set_style(self, key: str, value: str) -> None:
        """Üslup kuralı ekler."""
        self.memory["style"][key] = value
        self._save()

    def set_vision(self, vision: str) -> None:
        """Vizyonu günceller."""
        self.memory["vision"] = vision
        self._save()

    def synthesize_master_prompt(self) -> str:
        """Öğrenilen her yeni bilgiyle sistemin genel davranış kurallarını dinamik olarak yeniden oluşturur."""
        prompt = "LİKYA CEO MASTER PROMPT & MINDSET\n"
        prompt += "=" * 50 + "\n\n"

        if self.memory["vision"]:
            prompt += f"VİZYON: {self.memory['vision']}\n\n"

        if self.memory["principles"]:
            prompt += "PRENSİPLER:\n"
            for p in self.memory["principles"]:
                prompt += f"  • {p}\n"
            prompt += "\n"

        if self.memory["decision_criteria"]:
            prompt += "KARAR ALMA KRİTERLERİ:\n"
            for c in self.memory["decision_criteria"]:
                prompt += f"  • {c}\n"
            prompt += "\n"

        if self.memory["style"]:
            prompt += "ÜSLUP KURALLARI:\n"
            for k, v in self.memory["style"].items():
                prompt += f"  • {k}: {v}\n"
            prompt += "\n"

        for category, items in self.memory["categories"].items():
            if items:
                prompt += f"{category.upper()}:\n"
                for item in items:
                    prompt += f"  • {item}\n"
                prompt += "\n"

        return prompt

    def get_mindset(self) -> Dict[str, Any]:
        """Şu anki CEO yapay zeka profilini ve kurallarını döndürür."""
        return {
            "vision": self.memory["vision"],
            "principles": self.memory["principles"],
            "decision_criteria": self.memory["decision_criteria"],
            "style": self.memory["style"],
            "categories": self.memory["categories"],
            "master_prompt": self.synthesize_master_prompt(),
        }
