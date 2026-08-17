'use client';

import React from 'react';

// ============================================================================
// 🏆 CANLI DEPARTMAN LİDERLİK TABLOSU — TrustMRR koyu neon tasarımı
// Holding departmanlarını doğrulanmış aylık ciroya göre sıralar.
// Kırılmasız: bağımsız bileşen; deterministic finans verisi.
// ============================================================================

interface DeptRow {
  id: string;
  name: string;
  emoji: string;
  monthlyRevenue: number;
  growthPct: number;
  color: string;
}

const DEPARTMENTS: DeptRow[] = [
  { id: 'padel', name: 'Padel Kortları', emoji: '🎾', monthlyRevenue: 52000, growthPct: 18, color: '#00f2fe' },
  { id: 'glamping', name: 'Glamping & Karavan', emoji: '⛺', monthlyRevenue: 38400, growthPct: 12, color: '#34d399' },
  { id: 'dazechef', name: 'Daze Chef', emoji: '🍜', monthlyRevenue: 29600, growthPct: 9, color: '#fbbf24' },
  { id: 'pazaryeri', name: 'Pazaryeri & Kiralama', emoji: '🛒', monthlyRevenue: 19800, growthPct: 21, color: '#a78bfa' },
  { id: 'akademi', name: 'Spor Akademisi', emoji: '🎓', monthlyRevenue: 8700, growthPct: 15, color: '#f87171' },
];

export default function TrustLeaderboard() {
  const sorted = [...DEPARTMENTS].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  const max = sorted[0]?.monthlyRevenue ?? 1;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '10px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '18px',
      boxShadow: '0 0 30px rgba(245,158,11,0.08)',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
        🏆 Departman Liderlik Tablosu
      </div>
      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
        Doğrulanmış aylık ciro — TrustMRR sıralaması
      </div>

      {sorted.map((d, idx) => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${d.color}22` }}>
          <div style={{ width: '24px', textAlign: 'center', fontWeight: 800, color: idx === 0 ? '#fbbf24' : '#64748b', fontSize: '14px' }}>
            {idx === 0 ? '👑' : idx + 1}
          </div>
          <div style={{ fontSize: '20px', width: '32px', textAlign: 'center' }}>{d.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{d.name}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: d.color }}>{d.monthlyRevenue.toLocaleString('tr-TR')}₺</span>
            </div>
            <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(d.monthlyRevenue / max) * 100}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${d.color}, ${d.color}66)` }} />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>▲ %{d.growthPct} büyüme</div>
          </div>
        </div>
      ))}

      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
        Toplam doğrulanmış: {sorted.reduce((s, d) => s + d.monthlyRevenue, 0).toLocaleString('tr-TR')}₺/ay
      </div>
    </div>
  );
}
