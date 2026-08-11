'use client';

import React, { useState } from 'react';

export default function TreasuryLiquidityBalancer() {
  const [reserves, setReserves] = useState([
    { asset: 'Canlı GES Güneş Enerjisi Üretimi ☀️', value: '142.8 kW (₺320,000 Karşılık)', ratio: '%38', color: '#f6ad55' },
    { asset: 'Doğrulanmış Karbon Kredisi (Gold Standard) 🌿', value: '2.4 Ton CO₂ (₺240,000 Karşılık)', ratio: '%28', color: '#48bb78' },
    { asset: 'Organik Kooperatif Hasat & Gıda Fonu 🫒', value: 'Toros Zeytinyağı & Bal (₺190,000 Karşılık)', ratio: '%22', color: '#e07a5f' },
    { asset: 'Kültür & 3D Biletleme Rezervi 🎟️', value: '1,250 Bilet (₺90,000 Karşılık)', ratio: '%12', color: '#00f2fe' },
  ]);

  const [totalBacking] = useState('₺840,000');

  const rebalancePool = () => {
    alert('💎 CFO Aura-Fin: Hazine likidite havuzunu otonom olarak dengeledi. Likya Coin reel enerji ve karbon varlıklarıyla %100 teminatlandırıldı!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(224, 122, 95, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(224, 122, 95, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>💎</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM HAZİNE LİKİDİTE DENGELEYİCİ & VARLIK TEMİNATI
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            CFO Aura-Fin: Likya Coin'i spekülatif değil; reel güneş kWh, karbon kredisi ve kooperatif hasat varlıklarıyla %100 destekleyen algoritma.
          </p>
        </div>

        <button
          onClick={rebalancePool}
          style={{
            background: 'linear-gradient(135deg, var(--accent-orange), var(--primary-blue))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(224, 122, 95, 0.35)',
          }}
        >
          💎 Otonom Likidite Dengeleme Tetikle
        </button>
      </div>

      {/* Toplam Teminat Kartı */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Hazine Teminat Varlığı</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-green)', marginTop: '4px' }}>{totalBacking}</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dolaşımdaki Likya Coin</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>840,000 LKY</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1 LKY Reel Değeri</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-orange)', marginTop: '4px' }}>₺1.00 Tam Eşitlik (1:1)</div>
        </div>
      </div>

      {/* Varlık Dağılım Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reserves.map((res, index) => (
          <div
            key={index}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{res.asset}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{res.value}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: res.color }}>{res.ratio}</span>
              <div style={{ width: '120px', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: res.ratio, height: '100%', background: res.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
