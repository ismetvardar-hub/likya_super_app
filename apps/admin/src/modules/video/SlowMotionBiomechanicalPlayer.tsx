'use client';

import React, { useState } from 'react';
import { stepFrames, advancePlayback, jointAngle, lineAngle, racketSwingLine, PLAYBACK_SPEEDS, type Point2D, type PlaybackSpeed } from '../../app/lib/video/videoPlayerEngine.ts';

// ============================================================================
// 🎞️ AĞIR ÇEKİM BİYOMEKANİK VİDEO OYNATICI & KARE ANNOTASYONU (Adım 79)
// 0.1×-1.0× hızlar • 33ms kare adımı • diz açısı + raket savrulma çizgisi ölçümü.
// Motor: videoPlayerEngine.ts
// ============================================================================

export default function SlowMotionBiomechanicalPlayer() {
  const [timeMs, setTimeMs] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(0.25);
  const hip: Point2D = { x: 100, y: 80 };
  const knee: Point2D = { x: 105, y: 130 };
  const ankle: Point2D = { x: 100, y: 180 };
  const racket: Point2D = { x: 60, y: 60 };
  const kneeAngle = jointAngle(hip, knee, ankle);
  const swing = racketSwingLine(racket, -35, 60);

  return (
    <div style={{ width: '100%', maxWidth: 520, background: 'rgba(2,6,23,0.8)', borderRadius: 14, padding: 12 }}>
      {/* Video karesi (şematik) */}
      <svg viewBox="0 0 200 220" width="100%" role="img" aria-label="Ağır çekim biyomekanik analiz">
        <rect width="200" height="220" fill="#020617" />
        {/* Raket savrulma çizgisi */}
        <line x1={swing.start.x} y1={swing.start.y} x2={swing.end.x} y2={swing.end.y} stroke="#F27A1A" strokeWidth={2} strokeDasharray="5 3" />
        {/* Bacak iskeleti */}
        <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke="#00f2fe" strokeWidth={2.5} />
        <line x1={knee.x} y1={knee.y} x2={ankle.x} y2={ankle.y} stroke="#00f2fe" strokeWidth={2.5} />
        <circle cx={hip.x} cy={hip.y} r={3} fill="#10B981" />
        <circle cx={knee.x} cy={knee.y} r={4} fill="#facc15" />
        <circle cx={ankle.x} cy={ankle.y} r={3} fill="#10B981" />
        {/* Açı etiketi */}
        <text x={knee.x + 10} y={knee.y - 6} fontSize={10} fontWeight={800} fill="#facc15">diz {kneeAngle}°</text>
        <text x={swing.start.x - 60} y={swing.start.y - 10} fontSize={9} fill="#F27A1A">savrulma {swing.angleDeg}°</text>
      </svg>

      {/* Oynatma kontrolleri */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        <button onClick={() => setTimeMs(stepFrames(timeMs, -1))} style={btnStyle}>⏮ −1kare</button>
        <button onClick={() => setTimeMs(stepFrames(timeMs, 1))} style={btnStyle}>+1kare ⏭</button>
        <button onClick={() => setTimeMs(advancePlayback(timeMs, speed, 500))} style={btnStyle}>▶ Oynat</button>
        {PLAYBACK_SPEEDS.map((s) => (
          <button key={s} onClick={() => setSpeed(s)} style={{ ...btnStyle, border: speed === s ? '1px solid #facc15' : '1px solid #334155' }}>{s}×</button>
        ))}
        <span style={{ fontSize: 9, color: '#94a3b8' }}>t={timeMs.toFixed(0)}ms</span>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
