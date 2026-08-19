'use client';

import React, { useState } from 'react';
import { buildCatchPadMatrix, runReactionRound, reactionAccuracy, detectTripodShot, hooperSessionAccumulate, catchPadReactionStatus, type CatchPad, type HooperSession } from '../lib/sports/catchPadReactionEngine';
import { mockGesture, touchlessFlag, gestureControlEngineStatus, type Gesture } from '../lib/security/gestureControlEngine';

// ============================================================================
// 🎯 CATCHPAD IoT & TRİPOD ŞUT KARTI + TEMASSIZ JEST
// SportVisionX görünümüne bağlı. Bluetooth/webcam yoksa mock-first. Plan Z.
// ============================================================================

export default function CatchPadReactionCard() {
  const [pods, setPods] = useState<CatchPad[]>(() => buildCatchPadMatrix(6));
  const [session, setSession] = useState<HooperSession>({ shots: [], makes: 0, attempts: 0, shootingPct: 0 });
  const [lastGesture, setLastGesture] = useState(() => mockGesture('none'));

  const runRound = (idx: number) => {
    const pod = pods[idx];
    const reactionMs = 320 + Math.round(Math.random() * 260);
    const round = runReactionRound(pod, reactionMs, 450);
    const next = [...pods];
    next[idx] = pod;
    setPods(next);
    // Aynı anda tripod şut takibi
    const shot = detectTripodShot({ playerY: 0.6, rimY: 0.2, ballArc: round.hit ? 0.9 : 0.55, distanceM: 6.2 });
    setSession((s) => hooperSessionAccumulate(s, shot));
  };

  const acc = reactionAccuracy(pods);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(34,211,238,0.08)' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🎯 CatchPad IoT & Hooper POV</div>
      <div style={{ fontSize: '10px', color: '#64748b' }}>{catchPadReactionStatus()} • {gestureControlEngineStatus()}</div>

      {/* 6'LI POD MATRİSİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '8px' }}>
        {pods.map((p, i) => (
          <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${p.connected ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`, borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: p.connected ? '#4ade80' : '#f87171' }}>{p.connected ? '●' : '○'} {p.name}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>🔋 %{p.batteryPct}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#22d3ee', margin: '4px 0' }}>{p.lastReactionMs > 0 ? `${p.lastReactionMs}ms` : '—'}</div>
            <button onClick={() => runRound(i)} disabled={!p.connected} style={{ fontSize: '9px', fontWeight: 800, padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: p.connected ? 'pointer' : 'not-allowed', background: p.connected ? 'linear-gradient(135deg,#22d3ee,#4facfe)' : '#334155', color: p.connected ? '#0d1322' : '#94a3b8' }}>
              💡 TEST
            </button>
          </div>
        ))}
      </div>

      {/* İSTATİSTİK + TRİPOD + JEST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.7 }}>
          <b style={{ color: '#4ade80' }}>İSABET %{acc.hitRate}</b> • ort {acc.avgMs}ms • en iyi {acc.bestMs}ms
          <div style={{ fontSize: '9px', color: '#64748b' }}>6 pod • Bluetooth eşleşmeli</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.7 }}>
          <b style={{ color: '#22d3ee' }}>🎥 Hooper POV:</b> {session.attempts} şut • {session.makes} isabet • <b style={{ color: '#4ade80' }}>%{session.shootingPct}</b>
          <div style={{ fontSize: '9px', color: '#64748b' }}>Tek kamera tripod — pota + oyuncu açısı</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.7 }}>
          <b style={{ color: '#a78bfa' }}>✋ Temassız:</b> {lastGesture.gesture === 'none' ? 'jest yok' : lastGesture.action}
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
            {(['Swipe_Left_Right', 'Pinch_Select', 'Open_Palm_Stop'] as Gesture[]).map((g) => (
              <button key={g} onClick={() => setLastGesture(mockGesture(g))} style={{ fontSize: '8px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(167,139,250,0.4)', background: 'transparent', color: '#a78bfa', cursor: 'pointer' }}>{g.replace('_', ' ')}</button>
            ))}
          </div>
          <div style={{ fontSize: '8px', color: '#64748b', marginTop: '4px' }}>{touchlessFlag('kiosk').note}</div>
        </div>
      </div>
    </div>
  );
}
