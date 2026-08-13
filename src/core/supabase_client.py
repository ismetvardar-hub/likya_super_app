"""
LİKYA SUPABASE PYTHON CLIENT
Asenkron veritabanı bağlantı servisi
"""

import os
from typing import Dict, Any, Optional

from supabase import create_client, Client


class SupabaseClient:
    """Supabase veritabanı bağlantı servisi."""

    def __init__(self) -> None:
        self.url = os.getenv("SUPABASE_URL", "")
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.client: Optional[Client] = None
        if self.url and self.service_key:
            self.client = create_client(self.url, self.service_key)

    def is_connected(self) -> bool:
        """Bağlantı durumunu kontrol eder."""
        return self.client is not None

    def log_audit(self, source: str, user_id: str, event_type: str, content: str) -> None:
        """Denetim kaydı yazar."""
        if not self.client:
            return
        self.client.table("audit_logs").insert({
            "source": source,
            "user_id": user_id,
            "event_type": event_type,
            "content": content,
        }).execute()

    def log_crisis(self, user_id: str, rating: int, comment: str, action: str, gift_code: str) -> None:
        """Kriz kaydı yazar."""
        if not self.client:
            return
        self.client.table("crisis_logs").insert({
            "user_id": user_id,
            "rating": rating,
            "comment": comment,
            "action": action,
            "gift_code": gift_code,
        }).execute()

    def save_ceo_brain(self, category: str, content: str) -> None:
        """CEO hafızasını kaydeder."""
        if not self.client:
            return
        self.client.table("ceo_brain").insert({
            "category": category,
            "content": content,
        }).execute()

    def log_gift(self, user_id: str, gift_code: str, status: str) -> None:
        """Hediye kaydı yazar."""
        if not self.client:
            return
        self.client.table("gift_claims").insert({
            "sender_id": user_id,
            "receiver_id": user_id,
            "qr_code": gift_code,
            "status": status,
        }).execute()
