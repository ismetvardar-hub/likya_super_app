'use client';

import React, { useState } from 'react';

export default function DarkSkyObservatory() {
  const [telescopes] = useState([
    {
      id: 'OBS-TAURUS-01',
      name: 'Bakırlıtepe Otonom Robotik Teleskop 🔭',
      bortleScale: 'Bortle 2 (Mükemmel Karanlık Gökyüzü)',
      trackedObject: 'Andromeda Galaksisi & Perseid Meteor Akımı',
      liveSeeing: '0.85 ark-saniye (Yüksek Çözünürlük)',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🔭 LİKYA KARANLIK GÖKYÜZÜ GÖZLEMEVİ VE ASTRONOMİ (FAZ 39)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Işık kirliliğinden arındırılmış Toros zirvelerinden canlı robotik teleskop gökyüzü yayını.
      </p>
      {telescopes.map((t) => (
        <div key={t.id} style={{ background: 'rgba(159, 122, 234, 0.1)', border: '1px solid #9f7aea', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{t.name}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>🌌 {t.bortleScale}</span> • <span>🛰️ {t.trackedObject}</span> • <span>✨ {t.liveSeeing}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
