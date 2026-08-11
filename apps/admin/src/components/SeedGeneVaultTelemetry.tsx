'use client';

import React, { useState } from 'react';

export default function SeedGeneVaultTelemetry() {
  const [seeds] = useState([
    {
      id: 'SEED-VAULT-01',
      name: 'Atalık Toros Siyez Buğdayı & Yerli Susam',
      cryoTemp: '-18.5°C Sabit Kriyojenik Nem',
      germinationRate: '%99.2 Canlılık',
      speciesStored: '420+ Endemik Likya Tohumu',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🌾 ATALIK TOHUM BANKASI VE GEN KORUMA MAHZENİ (FAZ 36)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Gelecek nesiller için iklim krizine dayanıklı atalık tohumları kriyojenik ortamda koruyan otonom mahzen.
      </p>
      {seeds.map((s) => (
        <div key={s.id} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid var(--accent-green)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{s.name}</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: 'white' }}>
            <span>❄️ {s.cryoTemp}</span> • <span>🌱 {s.germinationRate}</span> • <span>🧬 {s.speciesStored}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
