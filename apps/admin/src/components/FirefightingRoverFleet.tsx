'use client';

import React, { useState } from 'react';

export default function FirefightingRoverFleet() {
  const [rovers] = useState([
    {
      id: 'FIRE-ROVER-01',
      name: 'VULCAN-X Yangın Söndürme Paletli Robotu 🚒',
      extinguisherType: 'Biyo-Dostu Köpük & Su Sisi (Mist)',
      heatResistance: '1,000°C Seramik Isı Kalkanı',
      status: 'Olympos Orman Girişi Nöbette (%100 Hazır)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🚒 OTONOM YANGIN SÖNDÜRME ROBOTLARI VE ISI KALKANI (FAZ 41)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Alevlere doğrudan yaklaşarak can kaybı riskini sıfırlayan otonom paletli söndürme robotları.
      </p>
      {rovers.map((r) => (
        <div key={r.id} style={{ background: 'rgba(255, 77, 79, 0.1)', border: '1px solid #ff4d4f', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{r.name}</h3>
          <div style={{ fontSize: '12px', color: 'white', marginTop: '6px' }}>🧯 {r.extinguisherType} • 🛡️ {r.heatResistance}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>✅ {r.status}</div>
        </div>
      ))}
    </div>
  );
}
