'use client';

import React, { useEffect, useState } from 'react';

// ============================================================================
// 🔔 PUSH TERCİH PANELİ (Adım 11) — granüler bildirim toggle'ları
// Geofence • Kırmızı-zon sakatlık • Günlük/haftalık digest • Milestone
// localStorage'a kaydeder + state ile senkron.
// /parent ve /coach portallarında kullanılır.
// ============================================================================

export interface NotificationPreferences {
  geofenceAlerts: boolean;
  injuryRisk: boolean;
  sessionDigest: boolean;
  milestones: boolean;
}

export const DEFAULT_PREFS: NotificationPreferences = {
  geofenceAlerts: true,
  injuryRisk: true,
  sessionDigest: false,
  milestones: true,
};

const LS_KEY = 'likya_notification_prefs';

export function loadPrefs(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadPrefs());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const toggle = (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const items: { key: keyof NotificationPreferences; label: string; detail: string; emoji: string }[] = [
    { key: 'geofenceAlerts', label: 'Geofence Anlık Alarmlar', detail: 'Çocuk/sporcu güvenli alan dışına çıkınca anında bildirim', emoji: '🛡️' },
    { key: 'injuryRisk', label: 'Kırmızı-Zon Sakatlık Riski', detail: 'ACWR/yorgunluk eşiği aşılınca acil uyarı', emoji: '🔴' },
    { key: 'sessionDigest', label: 'Günlük/Haftalık Seans Özeti', detail: 'Antrenör digest e-postası (TRIMP, bayraklar)', emoji: '📧' },
    { key: 'milestones', label: 'Milestone & Rozet Bildirimleri', detail: 'Sporcu başarıları ve kilit taşları', emoji: '🏅' },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>🔔 Bildirim Tercihlerim</div>
        {saved && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669' }}>💾 Kaydedildi</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {items.map((it) => (
          <button key={it.key} onClick={() => toggle(it.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, textAlign: 'left', padding: '9px 12px', borderRadius: 12, border: `1px solid ${prefs[it.key] ? '#bbf7d0' : '#e2e8f0'}`, background: prefs[it.key] ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', width: '100%' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{it.emoji}</span>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#0f172a' }}>{it.label}</div>
                <div style={{ fontSize: 8.5, color: '#64748b' }}>{it.detail}</div>
              </div>
            </div>
            <span style={{ fontSize: 18, color: prefs[it.key] ? '#22c55e' : '#94a3b8' }}>{prefs[it.key] ? '✅' : '⬜'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
