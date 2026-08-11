'use client';

import React, { useState } from 'react';

export default function UrbanHeatMitigator() {
  const [roofs] = useState([
    {
      id: 'COOL-ROOF-01',
      location: 'Mühendislik & Yurt Binaları Yeşil Çatı Kuşağı 🏢🌿',
      surfaceTempReduction: '-12.4°C Yüzey Sıcaklığı Azalması',
      albedoRating: '0.82 Yüksek Güneş Yansıtma',
      indoorCoolingSaving: '%26 Klima Enerjisi Tasarrufu',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🏢 KENTSEL ISI ADASI AZALTICI VE YEŞİL EKO-ÇATI MONİTÖRÜ (FAZ 49)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Binaların soğutma maliyetini düşüren ve kentsel sıcaklığı dengeleyen fototermal yansıtıcı bitki çatıları.
      </p>
      {roofs.map((r) => (
        <div key={r.id} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{r.location}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>❄️ {r.surfaceTempReduction}</span> • <span>☀️ Albedo: {r.albedoRating}</span> • <span>⚡ Tasarruf: {r.indoorCoolingSaving}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
