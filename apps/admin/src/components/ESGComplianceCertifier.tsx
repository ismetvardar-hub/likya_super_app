'use client';

import React, { useState } from 'react';

export default function ESGComplianceCertifier() {
  const [issuedCertificates, setIssuedCertificates] = useState([
    {
      id: 'CERT-ISO-14001',
      standard: 'ISO 14001:2026 Çevre Yönetim Sistemi',
      issuer: 'Likya Sovereign Audit Core',
      score: 'A+ (99.8%)',
      carbonOffsetVerified: '2.4 Ton CO₂',
      wasteDiversionRate: '%94 Sıfır Atık',
      digitalStamp: 'SHA256: 0x98f21c...84e1',
      validUntil: 'Ağustos 2027',
    },
    {
      id: 'CERT-GOLD-CO2',
      standard: 'Gold Standard & Verra Doğrulamalı Karbon Kredisi',
      issuer: 'Likya Fintek & CSO Ajanı',
      score: '100% Doğrulandı',
      carbonOffsetVerified: '142.5 kg CO₂ (Bireysel Emeklilik)',
      wasteDiversionRate: '68,600 PET Şişe Önleme',
      digitalStamp: 'SHA256: 0x4a18d2...99c0',
      validUntil: 'Kalıcı Blokzincir Damgası',
    },
  ]);

  const generateNewCertificate = () => {
    alert('Yeni ESG & SAIF Güvenlik Uyumluluk Sertifikası kriptografik olarak imzalandı ve blokzincire yazıldı!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4), rgba(129, 178, 154, 0.2))',
          border: '1px solid rgba(129, 178, 154, 0.4)',
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
            <span style={{ fontSize: '28px' }}>📜</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              ESG & SAIF GÜVENLİK VE UYUMLULUK SERTİFİKASYON MERKEZİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Uluslararası çevre ve veri güvenliği standartlarına tam uyumlu dijital eko-sertifikalar.
          </p>
        </div>

        <button
          onClick={generateNewCertificate}
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-green))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(72, 187, 120, 0.35)',
          }}
        >
          📜 Yeni Sertifika Oluştur & İmzala
        </button>
      </div>

      {/* Sertifika Kartları Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {issuedCertificates.map((cert) => (
          <div
            key={cert.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{cert.id}</span>
                <span
                  style={{
                    background: 'rgba(72, 187, 120, 0.15)',
                    color: 'var(--accent-green)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {cert.score}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>{cert.standard}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Onaylayan: {cert.issuer}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Karbon Ofset:</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{cert.carbonOffsetVerified}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Atık Önleme:</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{cert.wasteDiversionRate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dijital Damga:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{cert.digitalStamp}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Geçerlilik: {cert.validUntil}</span>
              <button
                onClick={() => alert(`"${cert.id}" sertifikası PDF olarak dışa aktarılıyor.`)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                📥 PDF İndir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
