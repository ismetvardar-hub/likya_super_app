'use client';

import React, { useEffect, useState } from 'react';
import { generateLiveHubSnapshot, livePerformanceHubStatus, type LivePerformanceHubSnapshot } from '../lib/sports/livePerformanceHub';

// ============================================================================
// 🏆 SPORTVISIONX LIVE PERFORMANCE HUB — 6 bölgeli canlı ekran
// 1. Kinetik & Patlayıcılık  2. Biyomekanik & Tabanlık  3. Fizyolojik & İç Yük
// 4. Anlık Kıyas & Sapma      5. Koordinasyon & Kol      6. Canlı Yorgunluk
// ============================================================================

export default function ExtremeSLivePerformanceHub() {
  const [snap, setSnap] = useState<LivePerformanceHubSnapshot>(() => generateLiveHubSnapshot(1));
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setSnap(generateLiveHubSnapshot()), 3000);
    return () => clearInterval(id);
  }, [live]);

  const f = snap.physiology;
  const c = snap.comparison;
  const k = snap.kinetic;
  const co = snap.coordination;
  const fa = snap.fatigue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '16px', color: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>🏆 SportVisionX Live Performance Hub</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: live ? '#f87171' : '#64748b' }}>{live ? '🔴 LIVE' : '⏸️ DURAKLATILDI'}</span>
          <button onClick={() => setLive((v) => !v)} style={{ fontSize: '9px', fontWeight: 800, padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', cursor: 'pointer' }}>{live ? '⏸️' : '▶️'}</button>
        </div>
      </div>
      {/* SPORCU BİLGİSİ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>🧑‍🚀 Sporcu: {snap.athlete.name}</span>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>🗓️ {snap.athlete.date} {snap.athlete.time} • {snap.athlete.sessionType}</span>
        <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>⏱️ {snap.elapsed.h}:{snap.elapsed.m}:{snap.elapsed.s}</span>
      </div>

      {/* 6 BÖLGE GRİD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {/* 1. KİNETİK & PATLAYICILIK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>🏎️ Kinetik & Patlayıcılık</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#4ade80', marginTop: '6px' }}>{k.speedKmh} <span style={{ fontSize: '11px' }}>km/h</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Top Hızı: {k.topSpeedKmh} km/h</div>
          <hr style={{ border: 0, borderTop: '1px solid #334155', margin: '10px 0' }} />
          <div style={{ fontSize: '10px', color: '#e2e8f0' }}>🚀 İvmelenme (0-5m): <b style={{ color: '#38bdf8' }}>{k.accelerationMps2} m/s²</b></div>
          <div style={{ fontSize: '10px', color: '#e2e8f0' }}>⬆️ Sıçrama: <b style={{ color: '#a78bfa' }}>{k.jumpCm} cm</b> ({k.flightMs} ms)</div>
        </div>

        {/* 2. BİYOMEKANİK & TABANLIK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>👟 Biyomekanik & Tabanlık</div>
          <div style={{ width: '90px', height: '160px', border: '3px solid #475569', borderRadius: '45px 45px 30px 30px', margin: '10px auto', position: 'relative', background: '#0f172a' }}>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '16px', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: snap.insole.forefootPct > 70 ? 'rgba(239,68,68,0.9)' : 'rgba(250,204,21,0.9)', boxShadow: snap.insole.forefootPct > 70 ? '0 0 14px rgba(239,68,68,0.5)' : '0 0 14px rgba(250,204,21,0.5)' }}>
              ÖN: %{snap.insole.forefootPct}
            </div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '12px', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: 'rgba(34,197,94,0.9)', boxShadow: '0 0 14px rgba(34,197,94,0.5)' }}>
              TOPUK: %{snap.insole.heelPct}
            </div>
          </div>
        </div>


        {/* 3. FİZYOLOJİK & İÇ YÜK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>❤️ Fizyolojik & İç Yük</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#f87171', marginTop: '6px' }}>{f.heartRate} <span style={{ fontSize: '11px' }}>bpm</span> <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800 }}>({f.heartZone})</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Ort. Nabız: {f.avgHeartRate} bpm</div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>🔋 Enerji / Pil (Fatigue):</div>
          <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ height: '100%', width: `${f.energyPct}%`, borderRadius: '99px', background: f.energyPct > 70 ? 'linear-gradient(90deg,#4ade80,#22d3ee)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>%{f.energyPct} kaldı • HRV (rMSSD): <b style={{ color: '#a78bfa' }}>{f.hrvRmssd} ms</b> (Stabil)</div>
        </div>

        {/* 4. ANLIK KIYAS VE SAPMA */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>📊 Anlık Kıyas & Sapma</div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '8px' }}>👟 Temas (GCT): <b style={{ color: '#38bdf8', fontSize: '16px' }}>{c.gctMs} ms</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(Hedef &lt;{c.gctTargetMs}ms)</span> <span style={{ color: c.gctMs < c.gctTargetMs ? '#4ade80' : '#fbbf24', fontWeight: 800 }}>{c.gctMs < c.gctTargetMs ? '✅' : '⚠️'}</span></div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '8px' }}>🦵 Reaktif Güç (RSI): <b style={{ color: '#a78bfa', fontSize: '16px' }}>{c.rsi}</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(Sınıf: {c.rsiClass})</span> <span style={{ color: '#fbbf24' }}>⭐</span></div>
        </div>


        {/* 5. KOORDİNASYON & KOL */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>☄️ Koordinasyon & Kol</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#fbbf24', marginTop: '6px' }}>{co.armSpeedKmh} <span style={{ fontSize: '11px' }}>km/h</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Raket Açısı: {co.racketAngleDeg}°</div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>🏸 Vuruş: <b>{co.shots}</b></div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>Servis: {co.serves} | Forehand: {co.forehands}</div>
        </div>

        {/* 6. CANLI YORGUNLUK ANALİZİ */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>🔋 Canlı Yorgunluk Analizi</div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 11px', borderRadius: '999px', color: fa.riskSafe ? '#4ade80' : '#fbbf24', background: fa.riskSafe ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', border: `1px solid ${fa.riskSafe ? 'rgba(74,222,128,0.4)' : 'rgba(250,204,21,0.4)'}` }}>
              🛡️ Sakatlık Riski: {fa.injuryRisk} {fa.riskSafe ? '🟢 Güvenli' : '🟡 Dikkat'}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>📉 Performans Düşüşü: <b style={{ color: fa.performanceDropPct > 6 ? '#fb7185' : '#4ade80' }}>%{fa.performanceDropPct}</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(GCT %{fa.gctLengthenPct} uzadı)</span> {fa.gctLengthenPct > 10 ? '⚠️' : '✅'}</div>
        </div>
      </div>

      <div style={{ fontSize: '9px', color: '#475569' }}>{livePerformanceHubStatus()}</div>
    </div>
  );
}

