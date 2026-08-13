"""
LİKYA GERÇEK LLM MODELROUTER
DeepSeek / Gemini API (öncelik) + Yerel Ollama (fallback)
"""

import os
import json
from typing import Dict, Any, Optional

import httpx


class LLMRouter:
    """Gerçek LLM yönlendirici — simülasyonu gerçek AI servislerine bağlar."""

    def __init__(self) -> None:
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

    async def generate(self, prompt: str, system_role: str = "") -> Dict[str, Any]:
        """ModelRouter mekanizması: DeepSeek → Gemini → Ollama."""
        # Öncelik 1: DeepSeek API
        if self.deepseek_key:
            try:
                result = await self._call_deepseek(prompt, system_role)
                if result:
                    return {"provider": "deepseek", "response": result}
            except Exception:
                pass

        # Öncelik 2: Gemini API
        if self.gemini_key:
            try:
                result = await self._call_gemini(prompt, system_role)
                if result:
                    return {"provider": "gemini", "response": result}
            except Exception:
                pass

        # Öncelik 3: Yerel Ollama (Fallback)
        try:
            result = await self._call_ollama(prompt, system_role)
            if result:
                return {"provider": "ollama", "response": result}
        except Exception:
            pass

        return {"provider": "none", "response": "LLM servisleri bağlı değil"}

    async def _call_deepseek(self, prompt: str, system_role: str) -> Optional[str]:
        """DeepSeek API çağrısı."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.deepseek_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": system_role or "Sen Likya Hub'ın centilmen AI asistanısın."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        return None

    async def _call_gemini(self, prompt: str, system_role: str) -> Optional[str]:
        """Gemini API çağrısı."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}",
                json={
                    "contents": [{"parts": [{"text": f"{system_role}\n{prompt}"}]}],
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

    async def _call_ollama(self, prompt: str, system_role: str) -> Optional[str]:
        """Yerel Ollama çağrısı."""
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": f"{system_role}\n{prompt}",
                    "stream": False,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response")
        return None
