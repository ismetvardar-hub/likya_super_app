'use client';

import React, { useState } from 'react';

export default function AlgaeCarbonReactor() {
  const [reactors] = useState([
    {
      id: 'ALG-REC-01',
      name: 'Fotobiyoreaktör #1 (Spirulina & Chlorella) 🧪',
      oxygenOutput: '14.8 m³/gün Saf Oksijen',
      carbonCaptured: '8.4 kg CO₂/gün',
      biomassYield: '2.5 kg Yüksek Proteinli Biyo-Gıda',
      phLevel: '9.2 pH (Optimum Fotosentez)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🧪 SPİRULİNA VE MİKROYOSUN OKSİJEN BİYOREAKTÖRLERİ (FAZ 32)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Kampüs yaşam alanlarına temiz oksijen sağlayan ve CO₂ yakalayarak organik gıda proteini üreten biyo-reaktörler.
      </p>
      {reactors.map((r) => (
        <div key={r.id} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{r.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              💨 Oksijen Üretimi: <strong>{r.oxygenOutput}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🌿 Yakalanan Karbon: <strong>{r.carbonCaptured}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🥗 Biyokütle Gıda: <strong>{r.biomassYield}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
