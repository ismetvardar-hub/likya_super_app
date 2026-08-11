'use client';

import React, { useState } from 'react';

export default function GeothermalHeatMatrix() {
  const [springs] = useState([
    {
      id: 'GEO-01',
      name: 'Kaş Doğal Termal Kaynak & Isı Pompası ♨️',
      waterTemp: '48.5°C Doğal Sıcaklık',
      districtHeatingKwh: '320 kW Isı Geri Kazanımı',
      savedNaturalGas: '%100 Sıfır Fosil Yakıt',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        ♨️ JEOTERMAL VE TERMAL SU ISI GERİ KAZANIM AĞI (FAZ 34)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Doğal kaynak sularının ısısını kış aylarında yurt ve atölyelere ileten temiz jeotermal döngü.
      </p>
      {springs.map((s) => (
        <div key={s.id} style={{ background: 'rgba(224, 122, 95, 0.1)', border: '1px solid var(--accent-orange)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{s.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🌡️ Sıcaklık: <strong>{s.waterTemp}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🔥 Isı Gücü: <strong>{s.districtHeatingKwh}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'white' }}>
              🌱 Tasarruf: <strong>{s.savedNaturalGas}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
