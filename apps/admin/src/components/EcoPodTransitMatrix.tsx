'use client';

import React, { useState } from 'react';

export default function EcoPodTransitMatrix() {
  const [pods] = useState([
    {
      id: 'POD-01',
      route: 'Antalya Merkez Kampüs ➔ Yaşam Merkezi MagLev Hattı 🚊',
      speed: '45 km/s (Manyetik Kaldırma)',
      occupancy: '6 / 8 Yolcu',
      energyConsumption: '0.04 kWh/yolcu (Sıfır Emisyon)',
      status: 'Seyir Halinde (1.2 dk sonra varış)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🚊 MANYETİK EKO-POD HIZLI KAMPÜS ULAŞIM AĞI (FAZ 33)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Güneş enerjisiyle çalışan sessiz manyetik raylı eko-pod kapsül filosu.
      </p>
      {pods.map((p) => (
        <div key={p.id} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{p.route}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              ⚡ Hız: <strong>{p.speed}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              👥 Yolcu: <strong>{p.occupancy}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🟢 Durum: <strong>{p.status}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
