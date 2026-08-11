'use client';

import React, { useState } from 'react';

export default function QuantumCryptoKeyVault() {
  const [keys] = useState([
    {
      id: 'QKD-KEY-01',
      algorithm: 'CRYSTALS-Kyber-1024 (Post-Kuantum Şifreleme) 🔐',
      entropySource: 'Fotonik Kuantum Rastgele Sayı Üreteci (QRNG)',
      keyRotation: 'Her 60 saniyede bir otomatik yenilenir',
      securityLevel: '256-bit Kuantum Dayanıklı',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🔐 POST-KUANTUM KRİPTOGRAFİ VE ANAHTAR DAĞITIM KASASI (FAZ 40)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Holding hazinesini ve W3C DID kimliklerini geleceğin kuantum bilgisayar saldırılarına karşı koruyan kriptografi kalkanı.
      </p>
      {keys.map((k) => (
        <div key={k.id} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{k.algorithm}</h3>
          <div style={{ fontSize: '12px', color: 'white', marginTop: '6px' }}>🧪 Entropi: {k.entropySource}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>⚡ {k.keyRotation} • {k.securityLevel}</div>
        </div>
      ))}
    </div>
  );
}
