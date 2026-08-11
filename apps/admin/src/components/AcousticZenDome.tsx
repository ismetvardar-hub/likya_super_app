'use client';

import React, { useState } from 'react';

export default function AcousticZenDome() {
  const [domes] = useState([
    {
      id: 'ZEN-01',
      name: 'Kampüs Meditasyon & Akustik Sessizlik Kubbesi 🧘',
      ambientNoiseReduction: '-38 dB Aktif Gürültü İptali (ANC)',
      soundScape: 'Kuş Cıvıltıları, Çam Rüzgarı & 432 Hz Şifa Frekansı',
      status: 'Açık (Maksimum 12 Kişi)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🧘 AKUSTİK SESSİZLİK VE HUZUR ALANLARI KUBBESİ (FAZ 47)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Şehir ve trafik gürültüsünü aktif faz tersleme ile yok eden biyo-akustik dinlenme kubbesi.
      </p>
      {domes.map((d) => (
        <div key={d.id} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{d.name}</h3>
          <div style={{ fontSize: '12px', color: 'white', marginTop: '6px' }}>🔇 Gürültü İptali: <strong>{d.ambientNoiseReduction}</strong></div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>🎵 {d.soundScape} • {d.status}</div>
        </div>
      ))}
    </div>
  );
}
