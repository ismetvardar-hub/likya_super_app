'use client';

import React, { useState } from 'react';
import { resolveTacticalProblem, csmTacticalEngineStatus, type CsmResolution, type CsmPhase } from '../lib/sports/csmTacticalEngine';
import { analyzeDeceleration, type DecelerationReport } from '../lib/sports/decelerationBiomechanics';
import { TACTICAL_DRILLS, assignTacticalDrill } from '../lib/sports/tacticalDrillsSuite';

// ============================================================================
// 🧠 CSM TAKTİK PANELİ — Identify → One Fix → Sorumluluk → Geri Bildirim
// + Zemin frenleme skoru (Brake Index / Traction / Yük) + taktik drill atama.
// Tek tıkla senaryo seç; çözüm Daze Hub Event Bus'a görev olarak düşer.
// ============================================================================

const ATHLETES = ['Efe K.', 'Deniz A.', 'Mert S.', 'Zeynep T.', 'Alp Y.'];

interface Scenario {
  id: string;
  icon: string;
  label: string;
  input: { phase: CsmPhase; opponentPressing?: boolean; spacingMeters?: number; gapOnLeft?: boolean; possessionSec?: number; lastCutFailed?: boolean };
}

const SCENARIOS: Scenario[] = [
  { id: 'pressing', icon: '💨', label: 'Rakip Baskısı', input: { phase: 'hucum', opponentPressing: true } },
  { id: 'spacing', icon: '📏', label: 'Dar Mesafe', input: { phase: 'hucum', spacingMeters: 2.5 } },
  { id: 'gap', icon: '↖️', label: 'Sol Açık', input: { phase: 'hucum', gapOnLeft: true } },
  { id: 'tempo', icon: '⏱️', label: 'Statik Top', input: { phase: 'hucum', possessionSec: 11 } },
  { id: 'finish', icon: '🎯', label: 'Son Vuruş', input: { phase: 'hucum', lastCutFailed: true } },
];

export default function CsmTacticalPanel() {
  const [athlete, setAthlete] = useState('Efe K.');
  const [resolution, setResolution] = useState<CsmResolution | null>(null);
  const [decel, setDecel] = useState<DecelerationReport | null>(null);
  const [assigned, setAssigned] = useState<{ drill: string; at: string }[]>([]);

  const solve = (sc: Scenario) => {
    const r = resolveTacticalProblem({ ...sc.input, succeeded: sc.id === 'gap', attempted: true });
    setResolution(r);
  };

  const runDecel = () => {
    const d = analyzeDeceleration({ athlete, approachKmh: 24, plantKmh: 6, brakeDistanceM: 3.2, lateralSlipCm: 18, surface: 'parke', wetFloor: false, bodyMassKg: 74, impactLoadG: 4.2, weeklySprintCount: 7 });
    setDecel(d);
  };

  const assign = (id: string) => {
    const res = assignTacticalDrill(id, athlete);
    if (res.ok) setAssigned((p) => [{ drill: res.drill?.name ?? '', at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }, ...p].slice(0, 4));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(74,222,128,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🧠 CSM Taktik Problem Çözücü</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{csmTacticalEngineStatus()}</div>
        </div>
        <select value={athlete} onChange={(e) => setAthlete(e.target.value)} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer' }}>
          {ATHLETES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* 1. ADIM: Senaryo seç → Identify + One Fix + Sorumluluk */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '8px' }}>
        {SCENARIOS.map((sc) => (
          <button key={sc.id} onClick={() => solve(sc)} style={{ fontSize: '10px', fontWeight: 700, padding: '10px 8px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)', color: '#4ade80', cursor: 'pointer' }}>
            {sc.icon} {sc.label}
          </button>
        ))}
      </div>

      {resolution && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#e2e8f0' }}>
          <div style={{ fontWeight: 800, color: '#fff' }}>🕵️ IDENTIFY — {resolution.issue.title} <span style={{ color: '#f87171' }}>(ciddiyet {resolution.issue.severity}/5)</span></div>
          <div>{resolution.issue.detail}</div>
          <div style={{ fontWeight: 800, color: '#4ade80' }}>🔧 ONE FIX (1 kural, 5 değil): {resolution.fix.fix}</div>
          <div style={{ color: '#94a3b8' }}>Sonraki pozisyon: {resolution.fix.nextPossession}</div>
          <div style={{ fontWeight: 700 }}>👥 SORUMLULUK: {resolution.responsibility.commander} (komut) → {resolution.responsibility.adapter} (uyarla) → {resolution.responsibility.cover} (kademe)</div>
          <div>📊 GERİ BİLDİRİM: {resolution.feedback.verdict} • {resolution.feedback.score}/100 — {resolution.feedback.feedback}</div>
        </div>
      )}

      {/* 2. ADIM: Zemin frenleme skoru */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={runDecel} style={{ fontSize: '10px', fontWeight: 800, padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f87171)', color: '#0d1322' }}>🛑 Frenleme Analizi Başlat</button>
        {decel && (
          <div style={{ flex: 1, minWidth: 220, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
            <b>{decel.athlete}</b> — Zemin {decel.profile.traction.surface} • Not <b style={{ color: decel.overallGrade === 'A' ? '#4ade80' : decel.overallGrade === 'B' ? '#a3e635' : decel.overallGrade === 'C' ? '#fbbf24' : '#f87171' }}>{decel.overallGrade}</b><br />
            🛑 Brake Index: <b>{decel.profile.brake.brakeIndex.toFixed(2)}</b> ({decel.profile.brake.approachSpeedKmh}→{decel.profile.brake.plantSpeedKmh} km/h) | 🧲 Traction: <b>{decel.profile.traction.tractionCoeff.toFixed(2)}</b> (kayma {decel.profile.traction.lateralSlipCm}cm) | ⚠️ Yük riski: <b>{decel.profile.load.injuryRiskScore}/100</b><br />
            <span style={{ color: '#94a3b8' }}>→ {decel.prescription}</span>
          </div>
        )}
      </div>

      {/* 3. ADIM: Taktik drill kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '10px' }}>
        {TACTICAL_DRILLS.map((d) => (
          <div key={d.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{d.icon} {d.name}</div>
            <div style={{ fontSize: '9.5px', color: '#94a3b8', lineHeight: 1.45 }}>{d.goal}</div>
            <div style={{ fontSize: '9px', color: '#00f2fe' }}>{d.setsReps} • {d.rest}</div>
            <div style={{ fontSize: '9px', color: '#7dd3fc' }}>🎯 {d.successCriteria}</div>
            <button onClick={() => assign(d.id)} style={{ marginTop: 'auto', fontSize: '10px', padding: '7px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800 }}>
              ⚡ {athlete.split(' ')[0]} için ata
            </button>
          </div>
        ))}
      </div>

      {assigned.length > 0 && (
        <div style={{ fontSize: '9px', color: '#64748b' }}>
          Son atamalar: {assigned.map((a) => `${a.drill} • ${a.at}`).join('  |  ')}
        </div>
      )}
    </div>
  );
}

