'use client';

import React, { useState } from 'react';

export default function BioplasticFilamentLab() {
  const [extruders] = useState([
    {
      id: 'FIL-LAB-01',
      rawMaterial: 'Kurtarılan PET Şişeler & Mısır Nişastası PLA ♻️',
      filamentProduced: '85 Makara (1.75mm Hassas Çap)',
      carbonFootprint: '%82 Düşük Karbon Salınımı',
      targetUse: 'Maker Lab 3D Parça & Drone Gövde Üretimi',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        ♻️ BİYO-PLASTİK GERİ DÖNÜŞÜM VE 3D FİLAMENT FABRİKASYONU (FAZ 43)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Geri dönüştürülen plastikleri drone ve robot gövdeleri için yüksek mukavemetli filamentlere çeviren atölye.
      </p>
      {extruders.map((e) => (
        <div key={e.id} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{e.rawMaterial}</h3>
          <div style={{ fontSize: '13px', color: 'white', marginTop: '6px' }}>🧵 Üretilen Filament: <strong>{e.filamentProduced}</strong></div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>🌱 {e.carbonFootprint} • 🛠️ {e.targetUse}</div>
        </div>
      ))}
    </div>
  );
}
