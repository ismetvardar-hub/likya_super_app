'use client';

import React, { useState } from 'react';

export default function MicroWindAerodynamics() {
  const [turbines] = useState([
    {
      id: 'WIND-TUR-01',
      name: 'Gelidonya Feneri Dikey Eksenli Sessiz Türbin (VAWT) 🌀',
      windSpeed: '7.8 m/s (Güçlü Esinti)',
      liveOutputKw: '48.2 kW Canlı',
      birdSafeStatus: '%100 Kanatsız Güvenli Tasarım',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🌀 DİKEY EKSENLİ SESSİZ MİKRO-RÜZGAR TÜRBİNLERİ (FAZ 38)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Kuşlara zarar vermeyen kanatsız dikey eksenli rüzgar enerji santralleri.
      </p>
      {turbines.map((t) => (
        <div key={t.id} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{t.name}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>💨 Rüzgar: <strong>{t.windSpeed}</strong></span> • <span>⚡ Üretim: <strong>{t.liveOutputKw}</strong></span> • <span>🕊️ {t.birdSafeStatus}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
