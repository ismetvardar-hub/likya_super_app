'use client';

import React, { useState } from 'react';

export default function AcademicCredentialVault() {
  const [credentials] = useState([
    {
      id: 'DIP-2026-001',
      student: 'Burak Demir',
      degree: 'Biyomedikal & Ekolojik Mühendislik Lisans',
      didSignature: 'did:likya:edu:0x91fa...3321',
      verifiableIssuer: 'Likya Akademik Senatosu',
      badge: 'BLOKZİNCİR DİPLOMA PASAPORTU 🎓',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🎓 W3C DOĞRULANABİLİR AKADEMİK DİPLOMA VE ZANAAT PASAPORTU (FAZ 35)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Öğrencilerin ve yerel zanaatkarların başarılarını sahtecilik önleyici dijital imza ile belgeleyen kasa.
      </p>
      {credentials.map((c) => (
        <div key={c.id} style={{ background: 'rgba(159, 122, 234, 0.1)', border: '1px solid #9f7aea', padding: '16px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
            <strong>{c.student}</strong>
            <span style={{ color: '#9f7aea', fontSize: '12px' }}>{c.badge}</span>
          </div>
          <div style={{ fontSize: '14px', color: 'white', marginTop: '6px' }}>{c.degree}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px', fontFamily: 'monospace' }}>{c.didSignature}</div>
        </div>
      ))}
    </div>
  );
}
