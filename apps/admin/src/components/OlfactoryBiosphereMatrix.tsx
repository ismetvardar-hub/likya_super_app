'use client';

import React, { useState } from 'react';

export default function OlfactoryBiosphereMatrix() {
  const [zones] = useState([
    {
      id: 'AROMA-01',
      zone: 'Kütüphane & Çalışma Salonu (Zihinsel Odaklanma Modu)',
      essence: 'Toros Dağ Biberiyesi, Adaçayı & Narenciye Çiçeği 🌸',
      dispersionRate: '12 ml/saat Mikro-Nebülizasyon',
      status: 'Aktif (%94 Öğrenci Odak Artışı)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🌸 AROMATERAPİ VE DOĞA KOKUSU BİYOSFER DAĞITICILARI (FAZ 37)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Öğrenci ve çalışanların stres seviyesini düşüren mikro-nebülizasyonlu doğal esans yayıcılar.
      </p>
      {zones.map((z) => (
        <div key={z.id} style={{ background: 'rgba(224, 122, 95, 0.1)', border: '1px solid var(--accent-orange)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{z.zone}</h3>
          <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginTop: '4px' }}>{z.essence}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{z.dispersionRate} • {z.status}</div>
        </div>
      ))}
    </div>
  );
}
