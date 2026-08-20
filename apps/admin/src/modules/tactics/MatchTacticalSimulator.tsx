'use client';

import React, { useState } from 'react';
import {
  OPPONENT_ARCHETYPES,
  SHOT_STRATEGIES,
  runMonteCarlo,
  optimalShotSelection,
  mulberry32,
  type PlayerProfile,
  type OpponentArchetype,
} from '../../app/lib/tactics/monteCarloMatchSimulator.ts';

// ============================================================================
// 🎲 ETKİLEŞİMLİ TAKTİK MAÇ SİMÜLATÖRÜ (Adım 132)
// 1000 Monte Carlo maç simülasyonu: rakip arketiplerine karşı kazanma
// olasılığı + optimal taktik vuruş seçimi. Motor: monteCarloMatchSimulator.ts
// ============================================================================

export default function MatchTacticalSimulator() {
  const [player, setPlayer] = useState<PlayerProfile>({ speedQuicknessMs: 3300, serveFirstInPct: 62, serveWinsPct: 55, fatigueDecayVelocity: 30, aggressionLevel: 60 });
  const [archetype, setArchetype] = useState<OpponentArchetype>('baseline_grinder');
  const [result, setResult] = useState<ReturnType<typeof runMonteCarlo> | null>(null);
  const [optimal, setOptimal] = useState<ReturnType<typeof optimalShotSelection> | null>(null);

  function run() {
    setResult(runMonteCarlo(player, archetype, 1000, mulberry32(Date.now() % 2 ** 31)));
    setOptimal(optimalShotSelection(player, archetype, 200, mulberry32((Date.now() % 2 ** 31) + 1)));
  }

  const profile = OPPONENT_ARCHETYPES[archetype];

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', marginBottom: 8 }}>🎲 Monte Carlo Taktik Simülatörü</div>

      {/* Oyuncu profili */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 10, fontSize: 9, color: '#94a3b8' }}>
        <label>Hız (20m ms)<br /><input type="range" min={3000} max={3700} step={10} value={player.speedQuicknessMs} onChange={(e) => setPlayer({ ...player, speedQuicknessMs: Number(e.target.value) })} style={{ width: '100%' }} /> {player.speedQuicknessMs}ms</label>
        <label>İlk Servis %<br /><input type="range" min={30} max={80} value={player.serveFirstInPct} onChange={(e) => setPlayer({ ...player, serveFirstInPct: Number(e.target.value) })} style={{ width: '100%' }} /> %{player.serveFirstInPct}</label>
        <label>Servis Oyunu %<br /><input type="range" min={30} max={75} value={player.serveWinsPct} onChange={(e) => setPlayer({ ...player, serveWinsPct: Number(e.target.value) })} style={{ width: '100%' }} /> %{player.serveWinsPct}</label>
        <label>Yorgunluk Düşüşü<br /><input type="range" min={0} max={100} value={player.fatigueDecayVelocity} onChange={(e) => setPlayer({ ...player, fatigueDecayVelocity: Number(e.target.value) })} style={{ width: '100%' }} /> {player.fatigueDecayVelocity}</label>
      </div>

      {/* Rakip arketipi */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {(Object.keys(OPPONENT_ARCHETYPES) as OpponentArchetype[]).map((a) => (
          <button key={a} onClick={() => setArchetype(a)} style={{ ...chip, borderColor: a === archetype ? '#8B5CF6' : '#334155', color: a === archetype ? '#8B5CF6' : '#94a3b8' }}>
            {OPPONENT_ARCHETYPES[a].label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 8 }}>Rakip: {profile.description}</div>

      <button onClick={run} style={primary}>🎲 1000 Maç Simüle Et + Optimal Strateji</button>

      {result && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6 }}>
          <div style={cell}>
            <div style={cellLabel}>Kazanma Olasılığı</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: result.winPct >= 50 ? '#10B981' : '#F27A1A' }}>%{result.winPct}</div>
            <div style={{ fontSize: 8, color: '#64748b' }}>{result.playerWins}/{result.simulations} maç · ort. {result.avgRallies} ralli</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>Optimal Strateji</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe' }}>{optimal?.best.strategy.label}</div>
            <div style={{ fontSize: 8, color: '#64748b' }}>win %{optimal?.best.winPct} · uplift {optimal?.upliftPct}pp</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>Strateji Karşılaştırma</div>
            {optimal?.perStrategy.map((s) => (
              <div key={s.strategy.id} style={{ fontSize: 8, color: '#94a3b8' }}>{s.strategy.label}: %{s.winPct}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const primary: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '8px 14px', borderRadius: 8, border: '1px solid #8B5CF6', background: 'rgba(139,92,246,0.14)', color: '#8B5CF6', cursor: 'pointer' };
const chip: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
const cell: React.CSSProperties = { border: '1px solid #1e293b', borderRadius: 8, padding: 8 };
const cellLabel: React.CSSProperties = { fontSize: 8, color: '#64748b', marginBottom: 2 };
