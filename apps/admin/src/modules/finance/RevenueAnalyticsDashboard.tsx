'use client';

import React, { useState } from 'react';
import { computeRevenueMetrics, forecastCashFlow, forecastSummary, type RevenueInput } from '../../app/lib/finance/revenueAnalyticsEngine.ts';

// ============================================================================
// 📈 AKADEMİ GELİR ANALİTİĞİ & MRR PANOSU (Adım 92)
// MRR/ARR • Churn • ARPU • komisyon • 3/6 aylık nakit akışı tahmini.
// Motor: revenueAnalyticsEngine.ts
// ============================================================================

export default function RevenueAnalyticsDashboard() {
  const [input, setInput] = useState<RevenueInput>({
    activeMembers: 120,
    avgMonthlyPrice: 120,
    churnedLastMonth: 6,
    privateSessionsPerMonth: 80,
    privateSessionPrice: 60,
    privateCoachSplitPct: 60,
    commissionPct: 25,
  });
  const metrics = computeRevenueMetrics(input);
  const forecast = forecastCashFlow(metrics.mrr, 2, 6);
  const sum = forecastSummary(metrics.mrr, 2);

  return (
    <div style={{ width: '100%', maxWidth: 640, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
        <div style={card}>MRR <b style={{ color: '#00f2fe' }}>${metrics.mrr}</b></div>
        <div style={card}>ARR <b style={{ color: '#8B5CF6' }}>${metrics.arr}</b></div>
        <div style={card}>Churn <b style={{ color: metrics.churnRatePct > 5 ? '#F43F5E' : '#10B981' }}>%{metrics.churnRatePct}</b></div>
        <div style={card}>ARPU <b style={{ color: '#facc15' }}>${metrics.arpu}</b></div>
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
        Koçluk komisyonu: ${metrics.coachingRevenue}/ay · Toplam: <b style={{ color: '#34d399' }}>${metrics.totalMonthly}</b>/ay
      </div>

      {/* Tahmin çubuğu */}
      <div style={{ display: 'flex', gap: 4, marginTop: 12, alignItems: 'flex-end', height: 60 }}>
        {forecast.map((p) => (
          <div key={p.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 8, color: '#94a3b8' }}>${Math.round(p.projectedMrr)}</span>
            <div style={{ width: '100%', height: (p.projectedMrr / (forecast[5]?.projectedMrr ?? 1)) * 50, background: 'linear-gradient(180deg, #00f2fe, #8B5CF6)', borderRadius: '6px 6px 0 0' }} />
            <span style={{ fontSize: 8, color: '#64748b' }}>A{p.month}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: '#e2e8f0' }}>3 aylık tahmin: <b>${sum.threeMonth}</b> · 6 aylık: <b>${sum.sixMonth}</b></div>
    </div>
  );
}

const card: React.CSSProperties = { background: '#0f172a', borderRadius: 10, padding: 12, fontSize: 10, color: '#94a3b8' };
