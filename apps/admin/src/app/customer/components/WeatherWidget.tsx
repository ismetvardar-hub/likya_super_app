'use client';

import React from 'react';

export default function WeatherWidget() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4), rgba(0, 242, 254, 0.15))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '18px',
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#00f2fe', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.6px' }}>📍 Antalya / Olympos</span>
          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '9px', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold' }}>Canlı</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>32°C</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Çok Sıcak & Açık ☀️🔥</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '10px', color: '#cbd5e1' }}>
          <span>💧 %42 Nem</span>
          <span>💨 12 km/s GB</span>
          <span>☀️ UV: 6</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(242, 122, 26, 0.5))' }}>🌤️</div>
        <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>Parkurlar Açık 🌲</div>
      </div>
    </div>
  );
}
