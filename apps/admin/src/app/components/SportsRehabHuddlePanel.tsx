'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PEACE_PRINCIPLES, LOVE_PRINCIPLES, generateRehabPlan, rehabDayCard, type InjuryType, type RehabDayPlan } from '../lib/sports/injuryRehabEngine';
import { startPlayerHuddle20, HUDDLE_ERROR_FILTER, type HuddleErrorType, type Huddle20Result } from '../lib/sports/csmHuddleEngine';
import { evaluateSidelineRisk, evaluateAngleCoverage, scoreLegBlock, scoreLayupFootwork, type SidelineRisk } from '../lib/sports/courtSpatialBiometrics';
import { assignSpeedTransitionRoute, routeTotalDurationSec } from '../lib/sports/soccerConditioningRoute';

// ============================================================================
// 🩹 SPORTS REHAB & HUDDLE PANELİ — PEACE&LOVE • 20s Huddle • Çizgi Tuzağı
// + Kaleci/Turnike Biyomekaniği + Futbol Speed Transition. SportVisionX'te.
// ============================================================================

const ATHLETES = ['Efe K.', 'Deniz A.', 'Mert S.', 'Zeynep T.', 'Alp Y.'];
const INJURIES: InjuryType[] = ['kas', 'bilek-burkulma', 'diz', 'omuz', 'genel-yumusak-doku'];

export default function SportsRehabHuddlePanel() {
  const [athlete, setAthlete] = useState('Efe K.');
  const [injury, setInjury] = useState<InjuryType>('kas');
  const [day, setDay] = useState(1);
  const [plan, setPlan] = useState<RehabDayPlan | null>(() => rehabDayCard('kas', 'Efe K.', 1));

  const [huddleFlags, setHuddleFlags] = useState<Partial<Record<HuddleErrorType, boolean>>>({ Coverage: true });
  const [huddle, setHuddle] = useState<Huddle20Result | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sidelineFt, setSidelineFt] = useState(0.5);
  const [sidelineRisk, setSidelineRisk] = useState<SidelineRisk>(() => evaluateSidelineRisk(0.5));
  const [layup, setLayup] = useState(() => scoreLayupFootwork(2, 1, 2));
  const [legBlock, setLegBlock] = useState(() => scoreLegBlock(true, true, true));
  const [route, setRoute] = useState<{ totalMin: string; laps: number; taskId: string } | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const updatePlan = () => {
    setPlan(rehabDayCard(injury, athlete, day));
  };

  const startHuddle = () => {
    const res = startPlayerHuddle20(huddleFlags);
    setHuddle(res);
    setCountdown(20);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(244,114,182,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🩹 Rehab & Taktik Kartlar — PEACE·LOVE • Huddle • Çizgi • Kaleci</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Gün gün iyileşme yükü • 20s oyuncu toplantısı • saha risk skalası</div>
        </div>
        <select value={athlete} onChange={(e) => setAthlete(e.target.value)} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer' }}>
          {ATHLETES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* 1. PEACE & LOVE */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={injury} onChange={(e) => { setInjury(e.target.value as InjuryType); }} style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
            {INJURIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input type="range" min={1} max={14} value={day} onChange={(e) => setDay(Number(e.target.value))} style={{ flex: 1, minWidth: 120 }} />
          <button onClick={updatePlan} style={{ fontSize: '10px', padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f472b6,#fb7185)', color: '#fff', fontWeight: 800 }}>Gün {day} Reçetesi</button>
        </div>
        {plan && (
          <div style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '10px', padding: '10px', color: '#e2e8f0', lineHeight: 1.6, fontSize: '10px' }}>
            <b>{plan.phase}</b> — Gün {plan.day} • Yük <b>%{plan.loadPercent}</b> | {plan.protocol}<br />
            {plan.exercises.map((e) => <span key={e}>• {e}<br /></span>)}
            <span style={{ color: '#7dd3fc' }}>🏁 {plan.returnSportSignal}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '9px' }}>
          {PEACE_PRINCIPLES.map((p) => <span key={p.letter} style={{ padding: '4px 8px', borderRadius: '999px', border: '1px solid rgba(244,114,182,0.4)', color: '#f9a8d4', background: 'rgba(244,114,182,0.1)' }}>🩹 {p.letter} {p.label}</span>)}
          {LOVE_PRINCIPLES.map((p) => <span key={p.letter} style={{ padding: '4px 8px', borderRadius: '999px', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac', background: 'rgba(74,222,128,0.1)' }}>💚 {p.letter} {p.label}</span>)}
        </div>
      </div>

      {/* 2. CSM 20s HUDDLE */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {HUDDLE_ERROR_FILTER.map((e) => (
            <label key={e.type} style={{ fontSize: '9px', color: '#cbd5e1', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!huddleFlags[e.type]} onChange={(ev) => setHuddleFlags((p) => ({ ...p, [e.type]: ev.target.checked }))} />
              {e.turkish}
            </label>
          ))}
          <button onClick={startHuddle} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#38bdf8,#818cf8)', color: '#fff' }}>
            {countdown !== null && countdown > 0 ? `⏱️ ${countdown}s` : '⏱️ 20s Oyuncu Toplantısı Başlat'}
          </button>
        </div>
        {huddle && (
          <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '10px' }}>
            {huddle.detected.length === 0 ? '5 hata filtresinde kritik bulgu yok — ritmi koru.' : (
              <>
                Tespit: {huddle.detected.map((d) => `${d.turkish} (%${d.weight})`).join(' • ')}<br />
                🔧 Öncelik: <b>{huddle.priorityFix?.oneFix}</b>
              </>
            )}
            <br /><span style={{ color: '#94a3b8' }}>{huddle.coachNote}</span>
          </div>
        )}
      </div>


      {/* 3. ÇİZGİ TUZAĞI + KALECİ/TURNİKE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>📐 Çizgi Tuzağı Riski</div>
          <input type="range" min={0} max={40} step={0.5} value={sidelineFt} onChange={(e) => { const v = Number(e.target.value) / 10; setSidelineFt(v); setSidelineRisk(evaluateSidelineRisk(v)); }} style={{ width: '100%' }} />
          <div style={{ fontSize: '10px', color: '#e2e8f0' }}>Çizgiye uzaklık: <b>{sidelineFt.toFixed(1)} ft</b></div>
          <div style={{ fontSize: '12px', fontWeight: 900, color: sidelineRisk.zone === 'DANGER' ? '#f87171' : sidelineRisk.zone === 'RISK' ? '#fbbf24' : '#4ade80' }}>
            {sidelineRisk.zone === 'DANGER' ? '☠️ DANGER (0-1ft)' : sidelineRisk.zone === 'RISK' ? '⚠️ RISK (1-2ft)' : '✅ SAFE (2+ft)'} • {sidelineRisk.riskScore}/100
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{sidelineRisk.note}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>🥅 Kaleci & Turnike</div>
          <div style={{ fontSize: '9.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
            Açı kapatma: <b>{evaluateAngleCoverage(8, 30, 3).angleCoverageScore}/100</b> • Bacak blok: <b>{legBlock.score}/100</b>
          </div>
          <div style={{ fontSize: '9.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
            Turnike basış: <b>{layup.footworkScore}/100</b> — Outside {layup.outsideFoot}/2 • Inside {layup.insideFoot}/2 • Takeoff {layup.verticalTakeoff}/2
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setLegBlock(scoreLegBlock(false, false, true))} style={{ fontSize: '9px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Kötü blok sim</button>
            <button onClick={() => setLayup(scoreLayupFootwork(1, 0, 1))} style={{ fontSize: '9px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Bozuk adım sim</button>
            <button onClick={() => { setLegBlock(scoreLegBlock(true, true, true)); setLayup(scoreLayupFootwork(2, 2, 2)); }} style={{ fontSize: '9px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', cursor: 'pointer' }}>Reset</button>
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{legBlock.note}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{layup.note}</div>
        </div>
      </div>

      {/* 4. FUTBOL SPEED TRANSITION */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, fontSize: '10px', color: '#e2e8f0', lineHeight: 1.5 }}>
          <b>🏃 Futbol Speed Transition (30x20m):</b> Jog 30m → Cruise 20m → %90 Sprint 30m → Recovery 30m<br />
          <span style={{ color: '#94a3b8' }}>4 tur ≈ {routeTotalDurationSec(4)}s • her turda 4 hız geçişi</span>
        </div>
        <button onClick={() => { const r = assignSpeedTransitionRoute(athlete, 4); setRoute({ totalMin: r.totalMin, laps: 4, taskId: r.taskId }); }} style={{ fontSize: '10px', fontWeight: 800, padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f97316,#fbbf24)', color: '#0d1322' }}>
          ⚡ Rotayı {athlete.split(' ')[0]} için ata
        </button>
        {route && <div style={{ fontSize: '9px', color: '#4ade80' }}>✅ Atandı: {route.laps} tur ≈ {route.totalMin} dk ({route.taskId})</div>}
      </div>
    </div>
  );
}

