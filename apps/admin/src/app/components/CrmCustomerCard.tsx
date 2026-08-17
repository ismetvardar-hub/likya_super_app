'use client';

import React, { useState } from 'react';
import { getMemberProfile, SAMPLE_MEMBERS, type CrmMember } from '../lib/crm/twentyCrmBridge';

// ============================================================================
// 📇 CRM MÜŞTERİ KARTI — Twenty Open-CRM koyu neon bileşeni
// Müşteri/sporcu detayları, üyelik durumu, harcama ve geçmiş aktiviteler.
// Kırılmasız: bağımsız bileşen; deterministic CRM verisi.
// ============================================================================

const STATUS_STYLE: Record<CrmMember['status'], { label: string; color: string }> = {
  aktif: { label: 'Aktif', color: '#22c55e' },
  dondurulmus: { label: 'Donduruldu', color: '#f59e0b' },
  misafir: { label: 'Misafir', color: '#94a3b8' },
  vip: { label: 'VIP', color: '#a78bfa' },
};

const SEGMENT_ICON: Record<string, string> = {
  sporcu: '🎾',
  misafir: '👤',
  'is-ortagi': '🤝',
  sponsor: '🤝',
};

export default function CrmCustomerCard() {
  const [selectedId, setSelectedId] = useState(SAMPLE_MEMBERS[0]?.id ?? '');
  const profile = getMemberProfile(selectedId);
  const member = profile.member;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 24px rgba(0,242,254,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📇 Likya Open-CRM — Müşteri Kartı</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Twenty CRM modeli • rezervasyon + harcama + sponsor temas</div>
        </div>
      </div>

      {/* Üye seçici */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {SAMPLE_MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              padding: '5px 11px', borderRadius: '999px', cursor: 'pointer', fontSize: '10px', fontWeight: 700,
              border: selectedId === m.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)',
              background: selectedId === m.id ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)',
              color: selectedId === m.id ? '#67e8f9' : '#94a3b8',
            }}
          >
            {SEGMENT_ICON[m.segment] ?? '👤'} {m.fullName.split(' ')[0]}
          </button>
        ))}
      </div>

      {member && (
        <>
          {/* Üst: kimlik + durum */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', background: `linear-gradient(135deg, ${STATUS_STYLE[member.status].color}22, rgba(0,242,254,0.08))`,
              border: `1px solid ${STATUS_STYLE[member.status].color}44`,
            }}>
              {SEGMENT_ICON[member.segment] ?? '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{member.fullName}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{member.email} • {member.phone}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', color: STATUS_STYLE[member.status].color, background: `${STATUS_STYLE[member.status].color}1a`, border: `1px solid ${STATUS_STYLE[member.status].color}44` }}>
                {STATUS_STYLE[member.status].label}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', padding: '3px 9px', borderRadius: '999px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)' }}>
                {profile.tier} ÜYE
              </span>
            </div>
          </div>

          {/* Metrikler */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.2)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>TOPLAM HARCAMA</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#00f2fe' }}>{member.totalSpent.toLocaleString('tr-TR')}₺</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>REZERVASYON</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#a78bfa' }}>{member.reservations}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>SEGMENT</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>{member.segment}</div>
            </div>
          </div>

          {/* Geçmiş aktiviteler */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>GEÇMİŞ AKTİVİTELER</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {profile.reservations.length > 0 ? (
              profile.reservations.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#cbd5e1' }}>📅 {r.resource} — {r.date}</span>
                  <span style={{ fontWeight: 700, color: r.status === 'tamam' ? '#4ade80' : r.status === 'beklemede' ? '#fbbf24' : '#f87171' }}>
                    {r.amount.toLocaleString('tr-TR')}₺ • {r.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: '#64748b' }}>Kayıtlı aktivite yok.</div>
            )}
          </div>

          {member.sponsorContact && (
            <div style={{ fontSize: '11px', color: '#fbbf24', padding: '8px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              🤝 Sponsor temas noktası aktif — son iletişim 2026-08-10
            </div>
          )}
        </>
      )}
    </div>
  );
}

