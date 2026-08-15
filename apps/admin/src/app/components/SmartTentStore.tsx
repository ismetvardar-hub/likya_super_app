'use client';

import React, { useState } from 'react';
import { Tent } from 'lucide-react';

// ============================================================================
// 🏕️ LİKYA ÇADIR KONAKLAMA & GLAMPING — yer tahsisi (fiziksel alan)
// "Çadır & Ekipman kiralama" ➔ 🛒 Pazaryeri → Kiralama & Ekipman Kataloğu
// (Try Before You Buy) altında yapılandırılmıştır — MİMARİ AYRIM TAMAM.
// ============================================================================

interface TentGuest {
  id: string;
  name: string;
  mode: 'own_tent' | 'rent_equipment';
  nights: number;
  guests: number;
  equipment: string[];
  status: 'checked_in' | 'checked_out';
}

export default function SmartTentStore() {
  const [guests, setGuests] = useState<TentGuest[]>([
    { id: '1', name: 'Can Yılmaz', mode: 'own_tent', nights: 2, guests: 2, equipment: [], status: 'checked_in' },
    { id: '2', name: 'Elif Kaya', mode: 'rent_equipment', nights: 3, guests: 1, equipment: ['Lüks Çadır', 'Şişme Yatak'], status: 'checked_in' },
  ]);

  const [notifications] = useState<string[]>([
    '🏕️ Elif Kaya: Lüks Çadır + Şişme Yatak ekipmanını Pazaryeri Kiralama Kataloğu ndan kiraladı (QR zimmet)',
  ]);

  const overnightRate = 15;
  const rateTL = overnightRate * 35; // 1$ = 35 TL

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tent size={20} color="#34d399" />
            Çadır Konaklama & Glamping

      {/* Konaklama Tarifesi */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#34d399', marginBottom: '12px' }}>🏕️ Çadır Konaklama Tarifesi</h3>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
          Standart Çadır Konaklama: <strong style={{ color: '#34d399' }}>15$/gece/kişi</strong> ({formatTL(rateTL)} TL)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {guests.map((g) => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{g.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {g.mode === 'own_tent' ? '🏕️ Kendi Çadırıyla' : '🎪 Pazaryeri Kiralama'} • {g.nights} gece • {g.guests} kişi
                </div>
                {g.equipment.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>Ekipman (Pazaryeri): {g.equipment.join(', ')}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  {g.nights * g.guests * rateTL} ₺
                </span>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: g.status === 'checked_in' ? 'rgba(0,242,254,0.2)' : 'rgba(148,163,184,0.2)', color: g.status === 'checked_in' ? '#00f2fe' : '#94a3b8', border: `1px solid ${g.status === 'checked_in' ? 'rgba(0,242,254,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {g.status === 'checked_in' ? '✅ Giriş Yaptı' : '🚪 Çıkış'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Yer tahsisi • fiziksel konaklama — ekipman kiralama Pazaryeri Kiralama Kataloğu nda
          </p>
        </div>
      </div>

      {/* Mimari Ayrım Notu */}
      <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '10px', color: '#34d399', lineHeight: '1.7' }}>
        🎪 <b>Try Before You Buy Kataloğu</b> artık 🛒 Pazaryeri → <b>Kiralama &amp; Ekipman Kataloğu</b> altında:
        Lüks Glamping Çadırı, Şişme Yatak, Mobil Klima ve Güç İstasyonu — kirala, beğen, satın al.
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Likya Hub Bildirimleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

