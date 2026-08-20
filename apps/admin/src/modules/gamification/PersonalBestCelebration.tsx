'use client';

import React, { useState } from 'react';
import { pbMilestoneCard, type PbEvent } from '../../app/lib/gamification/pbDetectionEngine.ts';

// ============================================================================
// 🎉 KİŞİSEL REKOR (PB) KONFETİ KUTLAMA MODALI (Adım 71)
// Hafif canvas konfeti/particle + sesli zil kancası + paylaşılabilir milestone kartı.
// PB tespiti: pbDetectionEngine.ts
// ============================================================================

export interface PersonalBestCelebrationProps {
  event: PbEvent;
  athleteName?: string;
}

export default function PersonalBestCelebration({ event, athleteName = 'Sporcu' }: PersonalBestCelebrationProps) {
  const [open, setOpen] = useState(true);
  const [burst, setBurst] = useState(0);
  const card = pbMilestoneCard(event, athleteName);
  const share = encodeURIComponent(card);

  // Canvas konfeti patlaması (particle simülasyonu — hafif)
  const particles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2;
    const dist = 40 + (i % 7) * 8;
    return { x: 50 + Math.cos(angle) * dist, y: 50 + Math.sin(angle) * dist, color: ['#00f2fe', '#10B981', '#F27A1A', '#8B5CF6', '#facc15'][i % 5] };
  });

  return (
    <>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 75, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 'min(380px, 92vw)', background: 'linear-gradient(160deg, #0f172a, #020617)', border: '1px solid rgba(0,242,254,0.4)', borderRadius: 20, padding: 22, textAlign: 'center' }}>
            {/* Konfeti canvas */}
            <button onClick={() => setBurst((b) => b + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }} aria-label="Konfetiyi tekrarla">
              <svg viewBox="0 0 100 100" width="100%" height={110} role="img" aria-label="PB konfeti patlaması">
                {particles.map((p, i) => (
                  <circle key={`${burst}-${i}`} cx={p.x} cy={p.y} r={2.2} fill={p.color} opacity={0.9}>
                    <animate attributeName="cy" from={p.y + 20} to={p.y} dur="0.6s" begin={`${(i % 6) * 0.05}s`} fill="freeze" />
                    <animate attributeName="opacity" from="0" to="0.9" dur="0.3s" begin={`${(i % 6) * 0.05}s`} fill="freeze" />
                  </circle>
                ))}
              </svg>
            </button>

            <div style={{ fontSize: 40 }}>{event.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#00f2fe', marginTop: 4 }}>🎉 YENİ KİŞİSEL REKOR!</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{event.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#facc15' }}>{event.newValue} {event.unit}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              {event.previousBest === null ? 'İlk kayıt' : `Önceki: ${event.previousBest}${event.unit} · +%${event.improvedPct}`} · {athleteName}
            </div>

            {/* PB Milestone Kartı */}
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: '1px dashed rgba(250,204,21,0.4)', fontSize: 10, color: '#e2e8f0', background: 'rgba(250,204,21,0.05)' }}>{card}</div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
              <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, fontWeight: 800, padding: '9px 14px', borderRadius: 10, background: '#25D366', color: '#0f172a', textDecoration: 'none' }}>WhatsApp'ta Paylaş</a>
              <button onClick={() => setOpen(false)} style={{ fontSize: 10, fontWeight: 800, padding: '9px 14px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>Harika! 🎊</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
