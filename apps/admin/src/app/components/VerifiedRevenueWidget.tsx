'use client';

import React, { useEffect, useState } from 'react';
import { calculateValuation } from '../lib/finance/mrrValuationEngine';

// ============================================================================
// 💳 VERIFIED REVENUE WIDGET — TrustMRR koyu neon finans kartı
// Gelir (Revenue) • Fiyat (Price) • Çarpan (Multiple) interaktif metrikleri.
// Kırılmasız: bağımsız bileşen; deterministic finans motoru.
// ============================================================================

export default function VerifiedRevenueWidget() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(148500);
  const [growthPct, setGrowthPct] = useState(12);
  const [marginPct, setMarginPct] = useState(24);

  const v = calculateValuation({ monthlyRevenue, growthRatePct: growthPct, netMarginPct: marginPct, days: 30 });
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setMonthlyRevenue((m) => Math.round(m * (1 + 0.0005))), 1200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.35)', borderRadius: '16px', padding: '18px',
      boxShadow: '0 0 30px rgba(0,242,254,0.12)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>💳 Doğrulanmış Gelir & Değerleme</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>TrustMRR Modeli — Deterministik Finans Motoru</div>
        </div>
        <button
          onClick={() => setLive((l) => !l)}
          style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: live ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.2)', background: live ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: live ? '#4ade80' : '#94a3b8' }}
        >
          {live ? '● CANLI' : '▶ CANLI BAŞLAT'}
        </button>
      </div>

      {/* Metrikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>AYLIK GELİR (MRR)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#00f2fe', marginTop: '4px' }}>{monthlyRevenue.toLocaleString('tr-TR')}₺</div>
          <div style={{ fontSize: '10px', color: '#34d399' }}>▲ {growthPct}% büyüme</div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.3)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>NET KÂR</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>{v.netProfitMonthly.toLocaleString('tr-TR')}₺</div>
          <div style={{ fontSize: '10px', color: '#a5b4fc' }}>{marginPct}% marj</div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.35)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>ÇARPAN</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>{v.multiple}x</div>
          <div style={{ fontSize: '10px', color: '#f59e0b' }}>hendek skoru {v.moatScore}</div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.35)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>HOLDİNG DEĞERİ</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{v.valuation.toLocaleString('tr-TR')}₺</div>
          <div style={{ fontSize: '10px', color: '#4ade80' }}>yıllıklandırılmış</div>
        </div>
      </div>

      {/* Girdiler */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: '10px', color: '#64748b' }}>MRR (₺)
          <input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)} style={{ width: '110px', marginLeft: '6px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }} />
        </label>
        <label style={{ fontSize: '10px', color: '#64748b' }}>Büyüme %
          <input type="number" value={growthPct} onChange={(e) => setGrowthPct(Number(e.target.value) || 0)} style={{ width: '70px', marginLeft: '6px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }} />
        </label>
        <label style={{ fontSize: '10px', color: '#64748b' }}>Marj %
          <input type="number" value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value) || 0)} style={{ width: '70px', marginLeft: '6px', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }} />
        </label>
      </div>

      <div style={{ fontSize: '11px', color: '#cbd5e1', padding: '8px 10px', borderRadius: '8px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.15)' }}>
        {v.recommendation}
      </div>
    </div>
  );
}
