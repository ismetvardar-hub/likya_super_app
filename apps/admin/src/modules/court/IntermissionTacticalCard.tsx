'use client';

import React, { useState } from 'react';
import {
  INTERMISSION_BREAK_MS,
  aggregateIntermissionMetrics,
  generateTacticalAdvice,
  type SetMetrics,
} from '../../app/lib/court/intermissionAnalyticsEngine.ts';

// ============================================================================
// 🎯 KOÇ MOLA & SET ARASI TAKTİK HUD KARTI (Adım 107)
// 90 saniyelik değişimde son set özeti: İlk Servis %, Ortalama Racket Hızı,
// GCT Yorgunluk Drift'i (+ms), Yüksek Yüklü Deselerasyonlar + 3 maddelik
// düz dilli taktik önerisi. Motor: intermissionAnalyticsEngine.ts
// ============================================================================

export default function IntermissionTacticalCard() {
  const [metrics, setMetrics] = useState<SetMetrics>({
    serveFirstInPct: 46,
    avgRacketSpeedKmh: 74,
    gctMsStart: 214,
    gctMsEnd: 238,
    highLoadDecels: 31,
    opponentPattern: 'Rakip derin toplarda zorlanıyor',
  });
  const [secondsLeft, setSecondsLeft] = useState(INTERMISSION_BREAK_MS / 1000);

  const rolled = aggregateIntermissionMetrics(metrics);
  const advice = generateTacticalAdvice(rolled);

  function refresh() {
    setMetrics((prev) => ({
      ...prev,
      serveFirstInPct: Math.round(35 + Math.random() * 45),
      avgRacketSpeedKmh: Math.round(65 + Math.random() * 35),
      gctMsEnd: prev.gctMsStart + Math.round(Math.random() * 45),
      highLoadDecels: Math.round(10 + Math.random() * 35),
    }));
    setSecondsLeft(INTERMISSION_BREAK_MS / 1000);
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>⏱️ Set Arası Taktik Kartı</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: secondsLeft <= 15 ? '#F43F5E' : '#F27A1A' }}>{secondsLeft}sn kaldı</span>
      </div>

      {/* Metrik ızgarası */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, marginBottom: 8 }}>
        <div style={cell}>
          <div style={cellLabel}>İlk Servis %</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: rolled.serveFirstInPct < 50 ? '#F43F5E' : '#10B981' }}>%{rolled.serveFirstInPct}</div>
        </div>
        <div style={cell}>
          <div style={cellLabel}>Racket Hızı</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#00f2fe' }}>{rolled.avgRacketSpeedKmh} km/s</div>
        </div>
        <div style={cell}>
          <div style={cellLabel}>GCT Drift</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: rolled.gctFatigueDriftMs > 20 ? '#F27A1A' : '#10B981' }}>
            +{rolled.gctFatigueDriftMs}ms
          </div>
        </div>
        <div style={cell}>
          <div style={cellLabel}>Deselerasyon</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: rolled.highLoadDecels > 25 ? '#F43F5E' : '#94a3b8' }}>{rolled.highLoadDecels}</div>
        </div>
      </div>

      {/* Rakip deseni */}
      <div style={{ fontSize: 9, color: '#8B5CF6', marginBottom: 8 }}>👁️ Gözlem: {rolled.rallyPatternNote}</div>

      {/* 3 maddelik öneri */}
      <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>🧠 Koç Önerileri</div>
        {advice.bullets.map((b, i) => (
          <div key={i} style={{ fontSize: 9, color: '#94a3b8', marginBottom: 3 }}>• {b}</div>
        ))}
      </div>

      <button onClick={refresh} style={mini}>🔄 Son Seti Yükle (Simüle)</button>
    </div>
  );
}

const cell: React.CSSProperties = { border: '1px solid #1e293b', borderRadius: 8, padding: 6, textAlign: 'center' };
const cellLabel: React.CSSProperties = { fontSize: 8, color: '#64748b', marginBottom: 2 };
const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
