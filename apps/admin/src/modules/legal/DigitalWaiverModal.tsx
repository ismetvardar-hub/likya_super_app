'use client';

import React, { useState } from 'react';
import { clearanceStatus, validateWaiver, blockSessionEntry, type MedicalClearance } from '../../app/lib/legal/digitalWaiverEngine.ts';

// ============================================================================
// 📋 DİJİTAL TIBBİ İZİN & FERAGAT MODALI (Adım 90)
// Veli dijital imzası + sağlık belgesi + acil iletişim; EXPIRED/VALID/PENDING
// durumuna göre seans girişini kilitler. Motor: digitalWaiverEngine.ts
// ============================================================================

export default function DigitalWaiverModal({ athleteName = 'Sporcu' }: { athleteName?: string }) {
  const [clearance, setClearance] = useState<MedicalClearance>({
    signedAt: null,
    expiresAt: null,
    healthDocUploaded: false,
  });
  const status = clearanceStatus(clearance);
  const validation = validateWaiver(clearance);
  const blocked = blockSessionEntry(clearance);
  const STATUS_COLOR: Record<string, string> = { VALID: '#10B981', EXPIRED: '#F43F5E', PENDING: '#F27A1A' };

  return (
    <div style={{ width: '100%', maxWidth: 420, background: 'rgba(2,6,23,0.8)', borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>📋 Tıbbi İzin & Feragat — {athleteName}</div>
      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: STATUS_COLOR[status] }}>
        Durum: {status === 'VALID' ? '✅ Geçerli' : status === 'EXPIRED' ? '🚫 Süresi Doldu' : '⏳ Bekliyor'}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{validation.reason}</div>

      {/* Sağlık belgesi + acil iletişim */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        <button
          onClick={() => setClearance({ ...clearance, healthDocUploaded: !clearance.healthDocUploaded })}
          style={{ fontSize: 9, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: clearance.healthDocUploaded ? 'rgba(16,185,129,0.15)' : 'transparent', color: '#e2e8f0', cursor: 'pointer' }}
        >
          {clearance.healthDocUploaded ? '✅ Sağlık belgesi yüklendi' : '📄 Sağlık belgesi yükle'}
        </button>
        <input placeholder="Acil iletişim: +90…" onChange={(e) => setClearance({ ...clearance, emergencyContact: e.target.value })} style={{ fontSize: 9, flex: 1, minWidth: 120, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '6px 10px' }} />
      </div>

      {/* Dijital imza */}
      <button
        onClick={() => {
          const expires = new Date(Date.now() + 365 * 86_400_000).toISOString();
          setClearance({ ...clearance, signedAt: new Date().toISOString(), expiresAt: expires });
        }}
        style={{ marginTop: 8, fontSize: 10, fontWeight: 800, padding: '9px 14px', borderRadius: 10, border: 'none', background: clearance.signedAt ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #00f2fe, #8B5CF6)', color: clearance.signedAt ? '#34d399' : '#020617', cursor: 'pointer' }}
      >
        {clearance.signedAt ? '✍️ İmza alındı (1 yıl geçerli)' : '✍️ Veli dijital imzasını al'}
      </button>

      {/* Seans giriş kilidi */}
      <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${STATUS_COLOR[status]}55`, background: 'rgba(255,255,255,0.03)', fontSize: 10, color: blocked ? '#F43F5E' : '#34d399' }}>
        {blocked ? '🔒 Seans girişi engellendi — tıbbi izin tamamlanmadı' : '✅ Seans girişi serbest — izin geçerli'}
      </div>
    </div>
  );
}
