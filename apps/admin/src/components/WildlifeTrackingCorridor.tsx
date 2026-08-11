'use client';

import React, { useState } from 'react';

export default function WildlifeTrackingCorridor() {
  const [fauna] = useState([
    {
      id: 'WL-01',
      species: 'Toros Dağ Keçisi (Capra aegagrus) 🐐',
      location: 'Olympos Zirve Koridoru',
      herdSize: '18 Birey',
      healthTelemetry: 'Optimal Nabız • Kaçak Av Tehdidi Yok',
      trackingType: 'BLE Mesh Eko-Tasma & Kamera Kapanı',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🐐 YABAN HAYATI KORUMA VE EKOLOJİK KORİDOR İZLEYİCİSİ (FAZ 44)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Toros yaban hayatını koruyan, kaçak avlanmayı yapay zeka ses ve hareket analizleriyle önleyen eko-koridor.
      </p>
      {fauna.map((f) => (
        <div key={f.id} style={{ background: 'rgba(246, 173, 85, 0.1)', border: '1px solid var(--accent-orange)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{f.species}</h3>
          <div style={{ fontSize: '13px', color: 'white', marginTop: '6px' }}>📍 {f.location} • 👥 Sürü: {f.herdSize}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>💚 {f.healthTelemetry} • 📡 {f.trackingType}</div>
        </div>
      ))}
    </div>
  );
}
