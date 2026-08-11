'use client';

import React from 'react';

export default function GrandSingularityHub() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.6), rgba(0, 242, 254, 0.2))',
        border: '2px solid var(--accent-cyan)',
        borderRadius: '28px',
        padding: '36px',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0, 242, 254, 0.25)',
      }}
    >
      <div style={{ fontSize: '54px', marginBottom: '12px' }}>👑</div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
        LİKYA HOLDİNG & SUPER-APP MASTER SINGULARITY AI ORCHESTRATOR (FAZ 50)
      </h1>
      <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '750px', margin: '14px auto 28px', lineHeight: '1.6' }}>
        Tüm 50 faz, 5 bağlı holding şirketi, 6 otonom C-Suite yapay zeka lideri, Jarvis sesli protokolü, 40+ mobil ekran,
        uydu haritaları, sualtı AUV filosu, P2P enerji borsaları ve W3C DID blokzincir kasası tek bir süper ekosistemde birleşti!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tamamlanan Faz Sayısı</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '4px' }}>50 / 50 (%100)</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Holding Toplam Varlığı</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)', marginTop: '4px' }}>₺1,000,000+</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Otonom AI Ajanlar</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-orange)', marginTop: '4px' }}>6 C-Suite Lideri</div>
        </div>
      </div>
    </div>
  );
}
