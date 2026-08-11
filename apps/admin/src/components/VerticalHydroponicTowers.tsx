'use client';

import React, { useState } from 'react';

export default function VerticalHydroponicTowers() {
  const [towers] = useState([
    {
      id: 'HYD-TOWER-01',
      cropType: 'Taze Fesleğen, Çilek & Bebek Ispanak 🍓🌱',
      waterEfficiency: '%95 Geleneksel Tarımdan Daha Az Su',
      harvestCycle: '18 Günde Bir Hasat (LED Spektrum Destekli)',
      status: 'Yemekhanelere Günlük Taze Tedarik',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🍓 OTONOM DİKEY HİDROPONİK TARIM KULELERİ (FAZ 48)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Topraksız tarımla binaların cephelerinde sıfır böcek ilacı ile organik sebze yetiştiren kuleler.
      </p>
      {towers.map((t) => (
        <div key={t.id} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{t.cropType}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>💧 {t.waterEfficiency}</span> • <span>⏳ {t.harvestCycle}</span> • <span>🥗 {t.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
