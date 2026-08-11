'use client';

import React, { useState } from 'react';

export default function SubmarineAuvTelemetry() {
  const [auvList, setAuvList] = useState([
    {
      id: 'AUV-NEPTUNE-01',
      name: 'Kekova Batık Kent Sualtı AUV Kaşifi 🌊',
      depthMeters: '34.5m Derinlik',
      battery: '%88 Lityum-Titanyum',
      sonarAnalysis: 'Antik Amfora ve Taş Rıhtım Sütunu Tespiti (3D Nokta Bulutu)',
      status: 'Otonom Dalışta 🤿',
    },
    {
      id: 'AUV-NEPTUNE-02',
      name: 'Phaselis Antik Liman Dalgakıran İnceleme AUV',
      depthMeters: '18.2m Derinlik',
      battery: '%94',
      sonarAnalysis: 'Roma Dönemi Kurşunlu Ahşap Gemi Omurgası İskeleti',
      status: 'Haritalama Yapıyor 🗺️',
    },
  ]);

  const pingSonar = () => {
    alert('🌊 Kekova batık kentine yüksek frekanslı 3D batimetri sonar pinglemesi gönderildi!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(0, 242, 254, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🌊</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              OTONOM SUALTI AUV & BATIK ARKEOLOJİ SONAR TELEMETRİSİ (FAZ 31)
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Kekova ve Phaselis batık kentlerinde sualtı otonom araştırma robotları (AUV) ile 3D batimetrik arkeolojik tarama.
          </p>
        </div>
        <button
          onClick={pingSonar}
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          📡 3D Sonar Taraması Başlat
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {auvList.map((auv) => (
          <div
            key={auv.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{auv.id}</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold' }}>{auv.status}</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{auv.name}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Derinlik:</span> <strong style={{ color: 'white' }}>{auv.depthMeters}</strong>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Batarya:</span> <strong style={{ color: 'var(--accent-cyan)' }}>{auv.battery}</strong>
              </div>
            </div>
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#cbd5e1' }}>
              🔍 <strong>Sonar Tespiti:</strong> {auv.sonarAnalysis}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
