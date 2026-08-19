'use client';

import React, { useEffect, useState } from 'react';
import { generateLiveHubSnapshot, type LivePerformanceHubSnapshot } from '../../lib/sports/livePerformanceHub';
import { gctPlain, footStrikePlain, rsiPlain, loadingRatePlain, hrvDropPlain, heartRatePlain, type PlainMetric } from '../../lib/sports/plainLanguage';

// ============================================================================
// 🏃 SPORCU PORTALI (/athlete) — sade dille bugünkü formum + başarılar
// "Bugünkü Formum" • Isı Haritası (Sağlıklı Basış) • Kazanılan Başarılar
// Mevcut telemetri motorlarını kullanır; yalnızca sunum katmanı ekler.
// ============================================================================

export default function AthletePortal() {
  const [hub, setHub] = useState<LivePerformanceHubSnapshot>(() => generateLiveHubSnapshot(1));
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setHub(generateLiveHubSnapshot()), 3000);
    return () => clearInterval(id);
  }, [live]);

  const gct = gctPlain(hub.comparison.gctMs);
  const foot = footStrikePlain(hub.insole.heelPct);
  const rsi = rsiPlain(hub.comparison.rsi);
  const loading = loadingRatePlain(hub.comparison.gctMs > 200 ? 2.6 : 1.9);
  const hrv = hrvDropPlain(hub.physiology.hrvRmssd, 48);
  const hr = heartRatePlain(hub.physiology.heartRate);

  const energy = hub.physiology.energyPct;
  const badges = [
    { icon: '🚀', name: '100 km/h Kol Savurma Kulübü', owned: hub.coordination.armSpeedKmh >= 98 },
    { icon: '🦶', name: 'Sıfır Topuk Basışı Serisi', owned: hub.insole.heelPct <= 24 },
    { icon: '⭐', name: 'Elit RSI Rozeti', owned: hub.comparison.rsi >= 2.0 },
    { icon: '🔥', name: '7 Gün Seri Antrenman', owned: true },
  ];

  const metricCards: { m: PlainMetric; key: string }[] = [
    { m: gct, key: 'gct' },
    { m: foot, key: 'foot' },
    { m: rsi, key: 'rsi' },
    { m: loading, key: 'loading' },
    { m: hrv, key: 'hrv' },
    { m: hr, key: 'hr' },
  ];

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg,#f0fdf4,#ecfdf5)', minHeight: '100vh', color: '#0f172a' }}>
      {/* BAŞLIK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#065f46' }}>🏃 Merhaba, Arda! 👋</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Bugünkü formun — sade dille, teknik dille değil.</div>
        </div>
        <button onClick={() => setLive((v) => !v)} style={{ fontSize: '11px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #a7f3d0', background: '#fff', color: '#047857', cursor: 'pointer' }}>{live ? '⏸️ Duraklat' : '▶️ Devam'}</button>
      </div>

      {/* BUGÜNKÜ FORMUM — ENERJİ BAR + SKORLAR */}
      <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>⚡ Bugünkü Formum</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>🔋 Enerji</div>
            <div style={{ height: '10px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ height: '100%', width: `${energy}%`, borderRadius: '99px', background: energy > 70 ? 'linear-gradient(90deg,#34d399,#22d3ee)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#047857', marginTop: '4px' }}>%{energy} kaldı</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '12px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>⭐ Reaktif Güç (RSI)</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{hub.comparison.rsi}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#059669' }}>Elit</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '12px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>🏎️ Hız Skoru</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{hub.kinetic.speedKmh}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#059669' }}>km/h</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '12px' }}>
            <div style={{ fontSize: '9px', color: '#64748b' }}>🫀 Nabız</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{hub.physiology.heartRate}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#059669' }}>bpm · Kontrollü</div>
          </div>
        </div>
      </div>


      {/* SADE METRİK KARTLARI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {metricCards.map(({ m, key }) => (
          <div key={key} style={{ background: '#fff', border: `1px solid ${m.level === 'ELIT' ? '#bbf7d0' : m.level === 'IYI' ? '#fde68a' : '#fecaca'}`, borderRadius: '14px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{m.title}</div>
                <div style={{ fontSize: '9.5px', color: '#64748b', lineHeight: '1.4', marginTop: '3px' }}>{m.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SADE ISI HARİTASI + SAĞLIKLI BARIŞ ROZETİ */}
      <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>🦶 Basış Haritam</div>
          {foot.level === 'ELIT' && <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '999px', color: '#047857', background: '#d1fae5', border: '1px solid #6ee7b7' }}>🏅 Sağlıklı Basış Rozeti</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
          <div style={{ width: '90px', height: '160px', border: '3px solid #a7f3d0', borderRadius: '45px 45px 30px 30px', position: 'relative', background: '#f0fdf4' }}>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '16px', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: hub.insole.forefootPct >= 70 ? 'rgba(22,163,74,0.95)' : 'rgba(250,204,21,0.95)' }}>ÖN %{hub.insole.forefootPct}</div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '12px', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: hub.insole.heelPct > 50 ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.9)' }}>TOPUK %{hub.insole.heelPct}</div>
          </div>
          <div style={{ fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>{foot.detail}</div>
        </div>
      </div>

      {/* KAZANILAN BAŞARILAR */}
      <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>🏅 Kazanılan Başarılar</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {badges.map((b) => (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '12px', background: b.owned ? '#f0fdf4' : '#f8fafc', border: `1px solid ${b.owned ? '#6ee7b7' : '#e2e8f0'}`, opacity: b.owned ? 1 : 0.55 }}>
              <span style={{ fontSize: '20px' }}>{b.owned ? b.icon : '🔒'}</span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: b.owned ? '#047857' : '#94a3b8' }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

