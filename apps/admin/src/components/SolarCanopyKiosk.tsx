'use client';

import React, { useState } from 'react';

export default function SolarCanopyKiosk() {
  const [canopies] = useState([
    {
      id: 'CANOPY-01',
      location: 'Antik Liman Kordonu & Öğrenci Meydanı ⛱️',
      solarGeneration: '1.2 kW/saat Esnek Panel',
      activeUsersCharging: '8 Cihaz (Kablosuz Qi + USB-PD)',
      freeWifiMbs: '100 Mbps Wi-Fi 6 Açık Ağ',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        ⛱️ AKILLI GÜNEŞ ŞEMSİYELERİ VE MOBİL ŞARJ İSTASYONLARI (FAZ 45)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Gölge sağlarken aynı anda temiz elektrik ve hızlı internet sunan kamusal güneş kanopileri.
      </p>
      {canopies.map((c) => (
        <div key={c.id} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{c.location}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>☀️ {c.solarGeneration}</span> • <span>📱 {c.activeUsersCharging}</span> • <span>📶 {c.freeWifiMbs}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
