'use client';

import React, { useState } from 'react';
import {
  newTennisScore, scoreTennisPoint, tennisPointDisplay, tennisDisplay,
  basketballScored, newBasketballScore, basketballShotClock, nextBasketballPeriod,
  type TennisScore, type BasketballScore,
} from '../../app/lib/match/matchScoreEngine.ts';

// ============================================================================
// 🎾 CANLI MAÇ SKORBORDU & BİYOMEKANİK OVERLAY (Adım 76)
// Tenis (0/15/30/40, Deuce, Avantaj; oyun; set) + Basketbol (periyot, shot clock)
// HUD overlay: canlı nabız, servis hızı, son ralli GCT. Motor: matchScoreEngine.ts
// ============================================================================

export interface LiveMatchScoreboardProps {
  sport?: 'tennis' | 'basketball';
  liveHud?: { heartRate: number; serveVelocityKmh: number; rallyGctMs: number };
}

export default function LiveMatchScoreboard({ sport = 'tennis', liveHud }: LiveMatchScoreboardProps) {
  const [tennis, setTennis] = useState<TennisScore>(() => newTennisScore('A'));
  const [bball, setBball] = useState<BasketballScore>(() => newBasketballScore());

  if (sport === 'basketball') {
    return (
      <div style={{ background: 'rgba(2,6,23,0.8)', borderRadius: 14, padding: 12, width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, color: '#00f2fe' }}>
          <span>Ev {bball.homePoints}</span>
          <span>Periyot {bball.period} · Shot Clock {bball.shotClockSec}s</span>
          <span>Deplasman {bball.awayPoints}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setBball(basketballScored(bball, 'home', 3))} style={btnStyle}>Ev +3</button>
          <button onClick={() => setBball(basketballScored(bball, 'away', 2))} style={btnStyle}>Dep +2</button>
          <button onClick={() => setBball(basketballShotClock(bball, 14))} style={btnStyle}>Clock 14s</button>
          <button onClick={() => setBball(nextBasketballPeriod(bball))} style={btnStyle}>Sonraki Periyot</button>
        </div>
      </div>
    );
  }

  const pts = tennisPointDisplay(tennis);
  return (
    <div style={{ background: 'rgba(2,6,23,0.8)', borderRadius: 14, padding: 12, width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, fontWeight: 900, color: '#fff' }}>
        <span style={{ color: tennis.server === 'A' ? '#00f2fe' : '#94a3b8' }}>A · {pts.a}</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{tennisDisplay(tennis)}</span>
        <span style={{ color: tennis.server === 'B' ? '#00f2fe' : '#94a3b8' }}>{pts.b} · B</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button onClick={() => setTennis(scoreTennisPoint(tennis, 'A'))} style={btnStyle}>A Puan</button>
        <button onClick={() => setTennis(scoreTennisPoint(tennis, 'B'))} style={btnStyle}>B Puan</button>
        <button onClick={() => setTennis(newTennisScore())} style={btnStyle}>Sıfırla</button>
      </div>
      {liveHud && (
        <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 9, color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
          <span>❤️ {liveHud.heartRate} bpm</span>
          <span>🎾 {liveHud.serveVelocityKmh} km/h</span>
          <span>🦶 Ralli GCT {liveHud.rallyGctMs}ms</span>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '7px 12px', borderRadius: 8, border: '1px solid #334155', background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', cursor: 'pointer' };
