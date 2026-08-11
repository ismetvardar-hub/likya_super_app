'use client';

import React, { useState } from 'react';

export default function RainwaterCisternGrid() {
  const [cisterns] = useState([
    {
      id: 'CIS-01',
      name: 'Phaselis Antik Sarnıç Esinli Yeraltı Akiferi 💧',
      storedVolumeLitres: '450,000 Litre Yağmur Suyu',
      filterStages: 'Aktif Karbon + UV Sterilizasyon',
      usageTarget: 'Kampüs Bahçe Sulaması & Yangın Rezervi',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        💧 YAĞMUR SUYU HASADI VE YERALTI AKİFER SARNIÇ AĞI (FAZ 42)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Tüm çatı ve açık alan yağışlarını toplayıp arıtan devasa yeraltı temiz su rezervuarı.
      </p>
      {cisterns.map((c) => (
        <div key={c.id} style={{ background: 'rgba(56, 182, 255, 0.1)', border: '1px solid #38b6ff', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{c.name}</h3>
          <div style={{ fontSize: '13px', color: 'white', marginTop: '6px' }}>🚰 Depolanan Hacim: <strong>{c.storedVolumeLitres}</strong></div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>🧪 {c.filterStages} • 🎯 {c.usageTarget}</div>
        </div>
      ))}
    </div>
  );
}
