'use client';

import React, { useState } from 'react';
import { generateBracket, registerWinner, assignCourt, BRACKET_SIZES, type Bracket, type BracketSize } from '../../app/lib/tournament/bracketGenerator.ts';

// ============================================================================
// 🏆 TURNUV BRAKET GÖRÜNÜMÜ (Adım 80)
// Tek/çift eliminasyon braketi + maç kazananı ilerleme + kort atama.
// Motor: bracketGenerator.ts
// ============================================================================

export default function TournamentBracketView() {
  const [size, setSize] = useState<BracketSize>(8);
  const [bracket, setBracket] = useState<Bracket>(() => generateBracket(8));

  const rebuild = (s: BracketSize) => { setSize(s); setBracket(generateBracket(s)); };

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        {BRACKET_SIZES.map((s) => (
          <button key={s} onClick={() => rebuild(s)} style={{ fontSize: 10, fontWeight: 800, padding: '5px 10px', borderRadius: 8, border: size === s ? '1px solid #00f2fe' : '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{s}</button>
        ))}
        <span style={{ fontSize: 9, color: '#64748b' }}>{bracket.mode} eliminasyon · {bracket.playerCount} oyuncu</span>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {bracket.rounds.map((round, ri) => (
          <div key={ri} style={{ minWidth: 150 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#00f2fe', marginBottom: 6 }}>Tur {ri + 1}</div>
            {round.map((m) => (
              <div key={m.id} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 6, marginBottom: 6, background: 'rgba(255,255,255,0.03)', fontSize: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.players[0] ? '#facc15' : '#e2e8f0' }}>Seed {m.players[0]} <span style={{ color: '#64748b' }}>vs</span> Seed {m.players[1]}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button onClick={() => setBracket(registerWinner(bracket, m.id, m.players[0]))} style={mini}>S1 kazanır</button>
                  <button onClick={() => setBracket(registerWinner(bracket, m.id, m.players[1]))} style={mini}>S2</button>
                  {m.court && <span style={{ fontSize: 8, color: '#10B981' }}>→ {m.court}</span>}
                </div>
                {ri < bracket.rounds.length - 1 && (
                  <button onClick={() => setBracket(assignCourt(bracket, m.id, `Kort ${1 + (m.matchIndex % 8)}`))} style={{ ...mini, marginTop: 4 }}>🎾 Kort Ata</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {bracket.winner !== null && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 900, color: '#facc15' }}>🏆 Şampiyon: Seed {bracket.winner}</div>}
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 8, fontWeight: 800, padding: '3px 6px', borderRadius: 5, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
