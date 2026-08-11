'use client';

import React, { useState } from 'react';

export default function DigitalHeritageVault() {
  const [artifacts, setArtifacts] = useState([
    {
      id: 'HRT-301',
      title: 'Bellerophon & Khimaira Likya Kaya Mezarı',
      era: 'M.Ö. 4. Yüzyıl (Likya Birliği)',
      scanQuality: '4K Fotogrametri (12.4 Milyon Poligon)',
      didHash: 'did:likya:heritage:0x89ab...7712',
      status: 'Dijital İkiz Koruma Altında 🏛️',
    },
    {
      id: 'HRT-302',
      title: 'Patara Meclis Binası (Bouleuterion) Yazıtları',
      era: 'M.Ö. 2. Yüzyıl (Antik Demokrasi)',
      scanQuality: 'Lidar & Epigrafik 3D Model',
      didHash: 'did:likya:heritage:0x34cd...99e4',
      status: 'UNESCO Dijital Arşivine Senkron 🌐',
    },
  ]);

  const addNewHeritageScan = () => {
    alert('AR vizöründen alınan yeni fotogrametrik 3D antik kent taraması W3C DID kasasına işlendi!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(224, 122, 95, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(224, 122, 95, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏛️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              W3C DID HOLOGRAFİK DİJİTAL MİRAS VE KÜLTÜR KASASI
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Likya uygarlığı lahitleri, kaya mezarları ve meclis yazıtlarının yüksek çözünürlüklü dijital ikizleri.
          </p>
        </div>

        <button
          onClick={addNewHeritageScan}
          style={{
            background: 'linear-gradient(135deg, var(--accent-orange), var(--primary-blue))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(224, 122, 95, 0.35)',
          }}
        >
          ➕ 3D Kültür Varlığı Tara & Arşivle
        </button>
      </div>

      {/* Kültür Varlığı Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {artifacts.map((art) => (
          <div
            key={art.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{art.id}</span>
                <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>{art.era}</span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>{art.title}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  <strong>Model Kalitesi:</strong> {art.scanQuality}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                  {art.didHash}
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                {art.status}
              </div>
            </div>

            <button
              onClick={() => alert(`"${art.title}" için AR 3D Hologram vizörü başlatıldı.`)}
              style={{
                marginTop: '18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              🕶️ AR 3D Hologramda İncele
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
