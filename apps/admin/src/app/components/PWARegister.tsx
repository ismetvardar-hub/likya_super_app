'use client';

import { useEffect } from 'react';

// ============================================================================
// 📱 PWA SERVICE WORKER KAYITÇISI — Likya Command CEO
// Tarayıcı/PWA oturumunda /sw.js kaydı + offline önbellek (ağ öncelikli)
// ============================================================================

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        // Güncelleme geldiğinde yeni sürümü otomatik devral
        reg.addEventListener('updatefound', () => {});
      } catch {
        // Kayıt başarısız olursa sessiz geç — PWA çalışmaya devam eder
      }
    };
    register();
  }, []);
  return null;
}
