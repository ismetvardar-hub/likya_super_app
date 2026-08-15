'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Brain, Eye, MessageSquare, Send, Shield, LineChart } from 'lucide-react';
import { BRANCH_AGENTS, getBranchAgent, type SportBranchId } from '../lib/sportVision/branchAgents';
import {
  biomechanicsAnalysis,
  conditioningAnalysis,
  injuryPreventionAnalysis,
  coachPedagogy,
  caloriesBurned,
  strikeSpeed,
  coverageArea,
  hitRate,
  powerOutput,
  lactateThreshold,
} from '../lib/sportVision/sportsScienceEngine';
import { buildAthleteMessage, buildCoachMessage, buildCustomerMessage } from '../lib/sportVision/messagingEngine';

// ============================================================================
// 🎾 LİKYA SPORT VISION — OTONOM BRANŞ AJANLARI & SPOR BİLİMLERİ MATRİSİ
// Gözlemci ajan + deterministik BESYO analiz motoru + kişiselleştirilmiş mesajlaşma
// ============================================================================

export default function SportVisionDashboard() {
  const [branchId, setBranchId] = useState<SportBranchId>('padel');
  const [input, setInput] = useState({
    angleDeg: 42,
    optimalAngle: 38,
    leftStrength: 32,
    rightStrength: 38,
    weightKg: 72,
    impactFactor: 2.8,
    cooperDistanceM: 2200,
    minutes: 45,
    hrAvg: 148,
    hrRest: 58,
    hrMax: 186,
    weeklySessions: 4,
    hrvToday: 58,
    hrvBaseline: 66,
    attempts: 40,
    hits: 27,
    strikeDistanceM: 6,
    strikeTimeMs: 210,
    coverageSpeedKmh: 8.5,
    athleteMood: 'motivasyon-yüksek' as 'motivasyon-yüksek' | 'motivasyon-düşük',
  });
  const [athleteMsg, setAthleteMsg] = useState('');
  const [coachMsg, setCoachMsg] = useState('');

  const agent = getBranchAgent(branchId);

  // 🧮 Deterministik analiz — her render'da saf fonksiyonlarla hesaplanır (LLM yok)
  const analysis = useMemo(() => {
    const bio = biomechanicsAnalysis({
      angleDeg: input.angleDeg,
      optimalAngle: input.optimalAngle,
      leftStrength: input.leftStrength,
      rightStrength: input.rightStrength,
      weightKg: input.weightKg,
      impactFactor: input.impactFactor,
    });
    const cond = conditioningAnalysis({
      cooperDistanceM: input.cooperDistanceM,
      minutes: input.minutes,
      hrAvg: input.hrAvg,
      hrRest: input.hrRest,
      hrMax: input.hrMax,
      weeklySessions: input.weeklySessions,
    });
    const inj = injuryPreventionAnalysis({
      hrvToday: input.hrvToday,
      hrvBaseline: input.hrvBaseline,
      restingHr: input.hrRest,
      asymmetryScore: bio.asymmetryScore,
    });
    const ped = coachPedagogy({
      hitRatePct: hitRate(input.hits, input.attempts),
      angleEfficiency: bio.angleEfficiency,
      athleteMood: input.athleteMood,
    });
    return {
      bio,
      cond,
      inj,
      ped,
      calories: caloriesBurned(agent.met, input.weightKg, input.minutes),
      speed: strikeSpeed(input.strikeDistanceM, input.strikeTimeMs),
      hitRatePct: hitRate(input.hits, input.attempts),
      coverage: coverageArea(input.coverageSpeedKmh, input.minutes, 6),
      power: powerOutput(input.weightKg * 9.81 * 0.6, input.coverageSpeedKmh / 3.6),
      lactate: lactateThreshold(input.hrMax),
    };
  }, [input, agent]);
  const set = (k: keyof typeof input, v: number | string) => setInput((prev) => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎾 Sport Vision — Otonom Branş Ajanları & Spor Bilimleri
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Gözlemci ajanlar + deterministik BESYO analiz motoru (LLM halüsinasyonu yok)</p>
      </div>

      {/* Branş seçici */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {BRANCH_AGENTS.map((a) => (
          <button
            key={a.branchId}
            onClick={() => setBranchId(a.branchId)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: branchId === a.branchId ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: branchId === a.branchId ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.03)',
              color: branchId === a.branchId ? '#00f2fe' : '#94a3b8', fontSize: '11px', fontWeight: '700',
            }}
          >
            {a.icon} {a.name}
          </button>
        ))}
      </div>

      {/* Canlı gözlemci ajan durumu */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '12px 14px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(0,242,254,0.06), rgba(34,211,153,0.05))',
        border: '1px solid rgba(0,242,254,0.3)',
      }}>
        <span style={{ fontSize: '24px' }}>{agent.icon}</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={13} color="#00f2fe" /> {agent.name} Sahada • Biyomekanik Aktif
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{agent.persona}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
            💓 İdeal {agent.idealBpm} BPM
          </span>
          <span style={{ fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
            🥁 Ritim: {agent.rhythm}
          </span>
          <span style={{ fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
            MET {agent.met}
          </span>
        </div>
      </div>

      {/* Deterministik istatistik kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        <StatCard label="Kalori (kcal)" value={analysis.calories} color="#f59e0b" />
        <StatCard label="Vuruş Hızı (km/s)" value={analysis.speed} color="#00f2fe" />
        <StatCard label="İsabet Oranı" value={`%${analysis.hitRatePct}`} color="#34d399" />
        <StatCard label="Saha Kapsama (m²)" value={analysis.coverage.toLocaleString('tr-TR')} color="#a78bfa" />
        <StatCard label="Güç Çıkışı (W)" value={analysis.power} color="#f87171" />
        <StatCard label="VO2Max" value={analysis.cond.vo2max} color="#4ade80" />
        <StatCard label="Laktat Eşiği" value={`${analysis.lactate} bpm`} color="#fbbf24" />
        <StatCard label="Yük Skoru" value={analysis.cond.trainingLoadScore} color="#ecc94b" />
      </div>


      {/* Spor bilimleri analiz raporları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {/* Biyomekanik */}
        <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#00f2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} /> 🧬 Biyomekanik Analiz
          </div>
          <BarRow label="Açı Verimi" value={analysis.bio.angleEfficiency} color="#00f2fe" />
          <BarRow label="Denge Skoru" value={analysis.bio.balanceScore} color="#34d399" />
          <BarRow label="Asimetri (düşük iyi)" value={100 - analysis.bio.asymmetryScore} color="#f59e0b" invert />
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>{analysis.bio.verdict}</div>
        </div>

        {/* Kondisyon */}
        <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(34,211,153,0.04)', border: '1px solid rgba(34,211,153,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LineChart size={13} /> 🏋️ Kondisyon & Yüklenme
          </div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginBottom: '4px' }}>{analysis.cond.intensityZone}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.5' }}>{analysis.cond.verdict}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>📅 {analysis.cond.periodization}</div>
        </div>

        {/* Sakatlık */}
        <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(248,113,113,0.04)', border: `1px solid ${analysis.inj.riskLevel === 'YÜKSEK' ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.2)'}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} /> 🛡️ Sakatlık Önleme & Rejenerasyon
          </div>
          <BarRow label="Aşırı Yüklenme Riski" value={analysis.inj.overtrainingRiskPct} color={analysis.inj.overtrainingRiskPct > 60 ? '#f87171' : '#fbbf24'} />
          <div style={{ fontSize: '10px', fontWeight: '700', color: analysis.inj.riskLevel === 'YÜKSEK' ? '#f87171' : analysis.inj.riskLevel === 'ORTA' ? '#fbbf24' : '#4ade80', margin: '6px 0' }}>
            Risk: {analysis.inj.riskLevel}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.5' }}>{analysis.inj.regeneration}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px' }}>Risk noktaları: {agent.injuryRiskPoints.join(', ')}</div>
        </div>
      </div>

      {/* Ölçüm girişleri (demo) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <SliderField label="Vuruş Açısı (°)" value={input.angleDeg} min={0} max={90} onChange={(v) => set('angleDeg', v)} />
        <SliderField label="İdeal Açı (°)" value={input.optimalAngle} min={0} max={90} onChange={(v) => set('optimalAngle', v)} />
        <SliderField label="Vücut Ağırlığı (kg)" value={input.weightKg} min={40} max={130} onChange={(v) => set('weightKg', v)} />
        <SliderField label="Cooper Mesafesi (m)" value={input.cooperDistanceM} min={1200} max={3600} step={25} onChange={(v) => set('cooperDistanceM', v)} />
        <SliderField label="Seans (dk)" value={input.minutes} min={10} max={120} onChange={(v) => set('minutes', v)} />
        <SliderField label="HR Ortalama" value={input.hrAvg} min={90} max={200} onChange={(v) => set('hrAvg', v)} />
        <SliderField label="Deneme / İsabet" value={input.attempts} min={10} max={100} onChange={(v) => set('attempts', v)} />
        <SliderField label="İsabet Sayısı" value={input.hits} min={0} max={100} onChange={(v) => set('hits', v)} />
        <SliderField label="HRV Bugün (ms)" value={input.hrvToday} min={20} max={100} onChange={(v) => set('hrvToday', v)} />
        <SliderField label="HRV Baz (ms)" value={input.hrvBaseline} min={20} max={100} onChange={(v) => set('hrvBaseline', v)} />
        <SliderField label="Haftalık Seans" value={input.weeklySessions} min={1} max={7} onChange={(v) => set('weeklySessions', v)} />
        <div>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>Sporcu Motivasyonu</div>
          <select
            value={input.athleteMood}
            onChange={(e) => set('athleteMood', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }}
          >
            <option value="motivasyon-yüksek">😄 Motivasyon Yüksek</option>
            <option value="motivasyon-düşük">😔 Motivasyon Düşük</option>
          </select>
        </div>
      </div>


      {/* 📲 Kişiselleştirilmiş mesajlaşma */}
      <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa' }}>📲 Kişiselleştirilmiş İletişim Motoru</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setAthleteMsg(buildAthleteMessage(agent, analysis.bio, analysis.inj, { strikeSpeedKmh: analysis.speed, calories: analysis.calories }))}
              style={{ padding: '9px 16px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '11px', fontWeight: '700' }}
            >
              <Send size={12} style={{ display: 'inline', marginRight: 4 }} /> Sporcuya Gelişim Raporu Gönder
            </button>
            <button
              onClick={() => setCoachMsg(buildCoachMessage(agent, analysis.bio, analysis.inj, { tacticalAdvice: analysis.ped.tacticalAdvice, athleteDevelopment: analysis.ped.athleteDevelopment, nextStep: analysis.ped.nextStep }))}
              style={{ padding: '9px 16px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '700' }}
            >
              <MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} /> Antrenöre Taktik Notu İlet
            </button>
          </div>
        </div>

        {athleteMsg && (
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '10px', lineHeight: '1.7', color: '#cbd5e1', padding: '10px 12px', borderRadius: '10px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: '8px' }}>
            📱 <b style={{ color: '#4ade80' }}>SPORCUYA:</b> {athleteMsg}
          </div>
        )}
        {coachMsg && (
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '10px', lineHeight: '1.7', color: '#cbd5e1', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)' }}>
            📋 <b style={{ color: '#00f2fe' }}>ANTENÖRE:</b> {coachMsg}
          </div>
        )}
      </div>

      {/* 🎓 Antrenör pedagojisi */}
      <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>🎓 Antrenör Pedagojisi & Koçluk</div>
        <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: '1.6' }}>💡 {analysis.ped.tacticalAdvice}</div>
        <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.6', marginTop: '4px' }}>🧠 {analysis.ped.athleteDevelopment}</div>
        <div style={{ fontSize: '10px', color: '#f59e0b', lineHeight: '1.6', marginTop: '4px' }}>{analysis.ped.nextStep}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Yardımcı görsel bileşenler
// ----------------------------------------------------------------------------
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color, marginTop: '2px' }}>{value}</div>
    </div>
  );
}

function BarRow({ label, value, color, invert = false }: { label: string; value: number; color: string; invert?: boolean }) {
  const pct = Math.max(0, Math.min(100, invert ? 100 - value : value));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <span style={{ fontSize: '9px', color: '#64748b', minWidth: '90px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '9px', color: color, minWidth: '34px', textAlign: 'right' }}>%{Math.round(pct)}</span>
    </div>
  );
}

function SliderField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>
        <span>{label}</span>
        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00f2fe', height: '4px' }} />
    </div>
  );
}

