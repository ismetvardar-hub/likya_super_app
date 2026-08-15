'use client';

import React, { useState, useMemo } from 'react';
import { Ruler, Baby, Apple, Users, TrendingUp } from 'lucide-react';
import {
  calculateKhamisRochePredictedHeight,
  calculateMirwaldOffset,
  determineGrowthPhase,
  calculateApeIndex,
  apeAdvantage,
  ageYears,
  calculateNutritionPlan,
  buildThreeWayReport,
  type YouthAthlete,
} from '../lib/sportVision/youthDevelopmentEngine';

// ============================================================================
// 🧬 LİKYA GELİŞİM LİGİ & BİYOMETRİK AKADEMİ PANELİ
// Büyüme eğrisi + PHV risk göstergesi + beslenme + 3 taraflı rapor
// ============================================================================

export default function YouthDevelopmentDashboard() {
  const [athlete, setAthlete] = useState<YouthAthlete>({
    ad: 'Kuzey',
    dogumTarihi: '2012-04-15',
    gender: 'erkek',
    boy: 152,
    kilo: 42,
    kolUzunlugu: 156,
    bacakBoyu: 78,
    oturmaYuksekligi: 76,
    ayakNumarasi: 38,
    anneBoyu: 168,
    babaBoyu: 182,
  });
  const [growthLastMonthCm, setGrowthLastMonthCm] = useState(1.8);
  const [trainingMinutes, setTrainingMinutes] = useState(300);
  const [parentReport, setParentReport] = useState('');
  const [nutritionPlan, setNutritionPlan] = useState('');

  const set = (k: keyof YouthAthlete, v: number | string) => setAthlete((prev) => ({ ...prev, [k]: v }));

  const data = useMemo(() => {
    const age = ageYears(athlete.dogumTarihi);
    const offset = calculateMirwaldOffset(athlete);
    const phase = determineGrowthPhase(offset);
    const apeIndex = calculateApeIndex(athlete.kolUzunlugu, athlete.boy);
    const predicted = calculateKhamisRochePredictedHeight(athlete);
    const nutrition = calculateNutritionPlan(athlete, phase.phase, trainingMinutes);
    const report = buildThreeWayReport(athlete, offset, apeIndex, growthLastMonthCm);
    return { age, offset, phase, apeIndex, predicted, nutrition, report };
  }, [athlete, growthLastMonthCm, trainingMinutes]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧬 Gelişim Ligi & Biyometrik Akademi
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Büyüme Zirve Hızı (PHV) • Mirwald 2002 • Khamis-Roche Boy Tahmini</p>
        <p style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>⚠️ Eğitim/performans amaçlıdır — tıbbi tanı değildir.</p>
      </div>

      {/* Sporcu profili + biyometrik girişler */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* giriş paneli */}
        <div style={{ flex: '1', minWidth: '260px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>🏷️ Sporcu Profili</div>
            <input
              value={athlete.ad}
              onChange={(e) => set('ad', e.target.value)}
              style={{ width: '110px', padding: '6px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select
              value={athlete.gender}
              onChange={(e) => set('gender', e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }}
            >
              <option value="erkek">👦 Erkek</option>
              <option value="kiz">👧 Kız</option>
            </select>
            <input type="date" value={athlete.dogumTarihi} onChange={(e) => set('dogumTarihi', e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <SliderF label="Boy (cm)" value={athlete.boy} min={100} max={210} onChange={(v) => set('boy', v)} />
            <SliderF label="Kilo (kg)" value={athlete.kilo} min={20} max={120} onChange={(v) => set('kilo', v)} />
            <SliderF label="Kulaç (cm)" value={athlete.kolUzunlugu} min={100} max={220} onChange={(v) => set('kolUzunlugu', v)} />
            <SliderF label="Bacak (cm)" value={athlete.bacakBoyu} min={30} max={110} onChange={(v) => set('bacakBoyu', v)} />
            <SliderF label="Oturma Yük. (cm)" value={athlete.oturmaYuksekligi} min={40} max={110} onChange={(v) => set('oturmaYuksekligi', v)} />
            <SliderF label="Ayak No (TR)" value={athlete.ayakNumarasi} min={30} max={48} onChange={(v) => set('ayakNumarasi', v)} />
            <SliderF label="Anne Boyu (cm)" value={athlete.anneBoyu} min={145} max={190} onChange={(v) => set('anneBoyu', v)} />
            <SliderF label="Baba Boyu (cm)" value={athlete.babaBoyu} min={155} max={205} onChange={(v) => set('babaBoyu', v)} />
            <SliderF label="Son 1 Ay Büyüme (cm)" value={growthLastMonthCm} min={0} max={4} step={0.1} onChange={(v) => setGrowthLastMonthCm(v)} />
            <SliderF label="Haftalık Antrenman (dk)" value={trainingMinutes} min={60} max={600} step={30} onChange={(v) => setTrainingMinutes(v)} />
          </div>
        </div>

        {/* Büyüme eğrisi grafiği (SVG) */}
        <div style={{ flex: '1', minWidth: '280px', padding: '14px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="#00f2fe" /> Büyüme Eğrisi — {athlete.ad} ({data.age.toFixed(1)} yaş)
          </div>
          <GrowthCurve current={athlete.boy} predicted={data.predicted} age={data.age} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '8px' }}>
            <span>📏 Mevcut: <b style={{ color: '#00f2fe' }}>{athlete.boy} cm</b></span>
            <span>🎯 Tahmini Yetişkin: <b style={{ color: '#4ade80' }}>{data.predicted} cm</b></span>
            <span>📊 Kalan: <b style={{ color: '#f59e0b' }}>{data.predicted - athlete.boy} cm</b></span>
          </div>
        </div>
      </div>

      {/* Biyometrik ölçüm kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
        <MetricCard icon="📏" label="Boy" value={`${athlete.boy} cm`} color="#00f2fe" />
        <MetricCard icon="⚖️" label="Kilo" value={`${athlete.kilo} kg`} color="#f59e0b" />
        <MetricCard icon="🤲" label="Kulaç" value={`${athlete.kolUzunlugu} cm`} color="#a78bfa" />
        <MetricCard icon="🦵" label="Bacak" value={`${athlete.bacakBoyu} cm`} color="#34d399" />
        <MetricCard icon="👟" label="Ayak No" value={athlete.ayakNumarasi} color="#f87171" />
        <MetricCard icon="📐" label="Ape Index" value={data.apeIndex.toFixed(2)} color={data.apeIndex > 1.03 ? '#4ade80' : '#fbbf24'} />
      </div>
      <div style={{ fontSize: '9px', color: '#64748b' }}>{apeAdvantage(data.apeIndex)}</div>


      {/* PHV büyüme atağı göstergesi */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${data.phase.risk === 'YUKSEK' ? 'rgba(248,113,113,0.45)' : data.phase.risk === 'ORTA' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.3)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🚀 Büyüme Atağı (PHV) Göstergesi — Mirwald Offset: <b style={{ color: data.phase.risk === 'YUKSEK' ? '#f87171' : '#00f2fe' }}>{data.offset.toFixed(2)} yıl</b>
          </div>
          <span style={{ fontSize: '10px', fontWeight: '700', padding: '5px 12px', borderRadius: '10px', background: `${data.phase.risk === 'YUKSEK' ? 'rgba(248,113,113,0.15)' : data.phase.risk === 'ORTA' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.12)'}`, color: data.phase.risk === 'YUKSEK' ? '#f87171' : data.phase.risk === 'ORTA' ? '#fbbf24' : '#4ade80', border: `1px solid ${data.phase.risk === 'YUKSEK' ? 'rgba(248,113,113,0.5)' : data.phase.risk === 'ORTA' ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.4)'}` }}>
            {data.phase.label}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>{data.phase.desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '22px' }}>
          {['-3', '-2', '-1', '0 (PHV)', '+1', '+2', '+3'].map((lbl, i) => {
            const isNow = Math.abs(i - 3 - data.offset) < 0.6;
            const active = i - 3 <= data.offset && i - 3 > data.offset - 1;
            return (
              <div key={lbl} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: active ? (data.phase.risk === 'YUKSEK' ? 'rgba(248,113,113,0.6)' : 'rgba(0,242,254,0.5)') : 'rgba(255,255,255,0.06)', boxShadow: isNow ? '0 0 10px rgba(0,242,254,0.5)' : 'none' }} />
                <span style={{ fontSize: '7px', color: isNow ? '#00f2fe' : '#475569' }}>{lbl}</span>
              </div>
            );
          })}
        </div>
      </div>


      {/* 🥗 Beslenme reçetesi + 3 taraflı rapor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '10px' }}>🥗 Büyüme & Antrenman Kalori Dengesi</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: '#94a3b8' }}>Günlük Kalori</span><b style={{ color: '#fff' }}>{data.nutrition.dailyCalories} kcal</b>
            <span style={{ color: '#94a3b8' }}>Protein</span><b style={{ color: '#fff' }}>{data.nutrition.proteinG} g</b>
            <span style={{ color: '#94a3b8' }}>Kalsiyum</span><b style={{ color: '#fff' }}>{data.nutrition.calciumMg} mg</b>
            <span style={{ color: '#94a3b8' }}>Su</span><b style={{ color: '#fff' }}>{data.nutrition.waterMl} ml</b>
            <span style={{ color: '#94a3b8' }}>Elektrolit</span><b style={{ color: '#fff' }}>{data.nutrition.electrolytesG} g</b>
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '10px', lineHeight: '1.5' }}>{data.nutrition.note}</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', marginBottom: '8px' }}>👨‍👩‍👧‍👦 3 Taraflı Pedagojik Rapor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9px', lineHeight: '1.5' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0,242,254,0.06)', color: '#cbd5e1' }}>
              <b style={{ color: '#00f2fe' }}>👦 Sporcu:</b> {data.report.athlete}
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(74,222,128,0.06)', color: '#cbd5e1' }}>
              <b style={{ color: '#4ade80' }}>👨‍👩‍👦 Veli:</b> {data.report.parent}
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', color: '#cbd5e1' }}>
              <b style={{ color: '#f59e0b' }}>📋 Antrenör:</b> {data.report.coach}
            </div>
          </div>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setParentReport(data.report.parent + `\n\n🥗 Haftalık hedef: ${data.nutrition.dailyCalories} kcal • ${data.nutrition.calciumMg} mg kalsiyum • ${data.nutrition.waterMl} ml su`)}
          style={{ padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '11px', fontWeight: '700' }}
        >
          👨‍👩‍👦 Veli Bilgilendirme Raporu Çıkar
        </button>
        <button
          onClick={() => setNutritionPlan(`🍳 HAFTALIK BESLENME PROGRAMI (${athlete.ad}) — ${data.phase.label}\n\n• Kalori: ${data.nutrition.dailyCalories} kcal/gün (büyüme + antrenman)\n• Protein: ${data.nutrition.proteinG} g • Kalsiyum: ${data.nutrition.calciumMg} mg\n• Su: ${data.nutrition.waterMl} ml • Elektrolit: ${data.nutrition.electrolytesG} g\n\n☀️ Kahvaltı: yumurta + yulaf + süt + ceviz\n🍽️ Öğle: tam buğday + ızgara + yoğurt\n🌙 Akşam: balık/tavuk + sebze + badem\n💧 Antrenman öncesi/sonrası elektrolit`)}
          style={{ padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '700' }}
        >
          🥗 Haftalık Beslenme Programı Oluştur
        </button>
      </div>

      {(parentReport || nutritionPlan) && (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '10px', lineHeight: '1.7', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
          {parentReport && <><b style={{ color: '#4ade80' }}>👨‍👩‍👦 VELİ RAPORU:</b>\n{parentReport}</>}
          {parentReport && nutritionPlan && '\n\n━━━━━━━━━━━━━━\n\n'}
          {nutritionPlan && <><b style={{ color: '#00f2fe' }}>🍳 BESLENME PROGRAMI:</b>\n{nutritionPlan}</>}
        </div>
      )}
    </div>
  );
}


// ----------------------------------------------------------------------------
// Yardımcı bileşenler
// ----------------------------------------------------------------------------
function GrowthCurve({ current, predicted, age }: { current: number; predicted: number; age: number }) {
  const W = 260;
  const H = 140;
  const pad = 20;
  const minH = Math.min(current, predicted) - 15;
  const maxH = Math.max(current, predicted) + 15;
  const y = (v: number) => H - pad - ((v - minH) / (maxH - minH)) * (H - pad * 2);
  const xNow = pad + ((age - 10) / (18 - 10)) * (W - pad * 2);
  const xAdult = W - pad;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '300px' }}>
      {[0, 1, 2, 3].map((i) => {
        const yv = pad + ((H - pad * 2) / 3) * i;
        return <line key={i} x1={pad} y1={yv} x2={W - pad} y2={yv} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      <defs>
        <linearGradient id="growGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <line x1={xNow} y1={y(current)} x2={xAdult} y2={y(predicted)} stroke="url(#growGrad)" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx={xNow} cy={y(current)} r="6" fill="#00f2fe" />
      <text x={xNow + 6} y={y(current) - 8} fill="#00f2fe" fontSize="9">{current} cm</text>
      <circle cx={xAdult} cy={y(predicted)} r="6" fill="#4ade80" />
      <text x={xAdult - 8} y={y(predicted) - 10} fill="#4ade80" fontSize="9" textAnchor="end">{predicted} cm</text>
      <text x={pad} y={H - 4} fill="#475569" fontSize="8">10 yaş</text>
      <text x={W - pad} y={H - 4} fill="#475569" fontSize="8" textAnchor="end">18 yaş</text>
    </svg>
  );
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
      <div style={{ fontSize: '16px' }}>{icon}</div>
      <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', margin: '3px 0' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

function SliderF({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b', marginBottom: '3px' }}>
        <span>{label}</span>
        <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00f2fe', height: '4px' }} />
    </div>
  );
}

