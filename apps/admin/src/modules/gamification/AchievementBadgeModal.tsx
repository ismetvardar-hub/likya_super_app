'use client';

import React, { useState } from 'react';
import { getBadge, type BadgeDef } from '../../app/lib/gamification/badgeRegistry.ts';

// ============================================================================
// 🏅 BAŞARI ROZETİ AÇILIŞ MODALI (Adım 62) — kutlama + paylaşılabilir kart
// Rozet açılışında parıltı/glow efektli modal; badgeRegistry'den tanım alır.
// ============================================================================

export interface AchievementBadgeModalProps {
  badgeId: string;
  athleteName?: string;
}

export default function AchievementBadgeModal({ badgeId, athleteName = 'Sporcu' }: AchievementBadgeModalProps) {
  const [open, setOpen] = useState(true);
  const badge: BadgeDef | undefined = getBadge(badgeId);
  if (!badge) return null;

  const shareText = encodeURIComponent(`🏅 ${badge.emoji} ${badge.name} rozetini kazandım! ${badge.description} — Likya/SportVisionX`);

  return (
    <>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 'min(360px, 92vw)', background: 'linear-gradient(160deg, #0f172a, #020617)', border: `1px solid ${badge.color}55`, borderRadius: 20, padding: 24, textAlign: 'center', boxShadow: `0 0 60px ${badge.color}44`, animation: 'likyaGlow 2s ease-in-out infinite' }}>
            <style>{`@keyframes likyaGlow { 0%,100% { box-shadow: 0 0 40px ${badge.color}33; } 50% { box-shadow: 0 0 70px ${badge.color}66; } }`}</style>
            <div style={{ fontSize: 64, filter: 'drop-shadow(0 0 18px ' + badge.color + 'aa)' }}>{badge.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: badge.color, marginTop: 8 }}>YENİ ROZET AÇILDI!</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{badge.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{badge.description}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{athleteName} 🎉</div>

            {/* Paylaşılabilir rozet kartı */}
            <div style={{ marginTop: 16, padding: 12, borderRadius: 14, border: `1px solid ${badge.color}44`, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 11, color: badge.color, fontWeight: 700 }}>Rozet Kartı</div>
              <div style={{ fontSize: 26, marginTop: 4 }}>{badge.emoji} <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>{badge.name}</span></div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{badge.description}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, fontWeight: 800, padding: '9px 14px', borderRadius: 10, background: '#25D366', color: '#0f172a', textDecoration: 'none' }}>WhatsApp'ta Paylaş</a>
              <button onClick={() => setOpen(false)} style={{ fontSize: 10, fontWeight: 800, padding: '9px 14px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>Harika! ✨</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
