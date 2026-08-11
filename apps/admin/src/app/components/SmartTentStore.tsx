'use client';

import React, { useState } from 'react';
import { Tent, Bed, Wind, Lightbulb, ShoppingBag, QrCode, Percent, ShoppingCart } from 'lucide-react';

// ============================================================================
// LİKYA TENT & EXPERIENCE STORE - ÇADIR KONAKLAMA & DENEYİMLE-SATIN AL
// "Try Before You Buy" ekipman kiralama + ciro payı sistemi
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

interface Equipment {
  id: string;
  name: string;
  icon: string;
  dailyRental: number;
  salePrice: number;
  brand: string;
  commissionRate: number;
  rented: boolean;
  purchased: boolean;
}

export default function SmartTentStore() {
  const [guests, setGuests] = useState<TentGuest[]>([
    { id: '1', name: 'Can Yılmaz', mode: 'own_tent', nights: 2, guests: 2, equipment: [], status: 'checked_in' },
    { id: '2', name: 'Elif Kaya', mode: 'rent_equipment', nights: 3, guests: 1, equipment: ['Lüks Çadır', 'Şişme Yatak'], status: 'checked_in' },
  ]);

  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', name: 'Lüks Çadır', icon: '🎪', dailyRental: 50, salePrice: 2500, brand: 'Quechua', commissionRate: 10, rented: true, purchased: false },
    { id: '2', name: 'Şişme Yatak & Yastık', icon: '🛏️', dailyRental: 20, salePrice: 800, brand: 'Decathlon', commissionRate: 10, rented: true, purchased: false },
    { id: '3', name: 'Mobil Kamp Kliması', icon: '🌬️', dailyRental: 40, salePrice: 1800, brand: 'EcoFlow', commissionRate: 12, rented: false, purchased: false },
    { id: '4', name: 'Güç İstasyonu (Solar)', icon: '💡', dailyRental: 30, salePrice: 1200, brand: 'Jackery', commissionRate: 12, rented: false, purchased: false },
  ]);

  const [walletBalance, setWalletBalance] = useState(500.00);
  const [commissionTotal, setCommissionTotal] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([
    '🎪 Elif Kaya: Lüks Çadır + Şişme Yatak kiralandı (QR ile zimmetlendi)',
  ]);

  // Konaklama tarifesi: 15$/gece/kişi
  const overnightRate = 15;
  const rateTL = overnightRate * 35; // 1$ = 35 TL

  // Ekipman kiralama
  const rentEquipment = (equipId: string) => {
    const item = equipment.find((e) => e.id === equipId);
    if (!item || item.rented) return;

    setEquipment((prev) =>
      prev.map((e) => (e.id === equipId ? { ...e, rented: true } : e))
    );
    setWalletBalance((prev) => prev - item.dailyRental);

    setNotifications((prev) => [
      `🎪 ${item.name} kiralandı! (${item.dailyRental} ₺/gün) QR ile zimmetlendi`,
      ...prev,
    ]);
  };

  // "Beğendim, Satın Alıyorum"
  const purchaseEquipment = (equipId: string) => {
    const item = equipment.find((e) => e.id === equipId);
    if (!item || item.purchased) return;

    // Ciro payı hesapla
    const commission = item.salePrice * (item.commissionRate / 100);

    setEquipment((prev) =>
      prev.map((e) => (e.id === equipId ? { ...e, purchased: true, rented: false } : e))
    );
    setCommissionTotal((prev) => prev + commission);
    setWalletBalance((prev) => prev - item.salePrice);

    setNotifications((prev) => [
      `🛒 ${item.name} satın alındı! (${item.salePrice} ₺) ${item.brand} markasına %${item.commissionRate} komisyon (${commission} ₺) Likya Hub hesabına işlendi`,
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tent size={20} color="#34d399" />
            Tent & Experience Store — Deneyimle-Satın Al
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Çadır konaklama • Try Before You Buy • Ciro payı</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            💰 {formatTL(walletBalance)} ₺
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            📈 Komisyon: {formatTL(commissionTotal)} ₺
          </div>
        </div>
      </div>

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
                  {g.mode === 'own_tent' ? '🏕️ Kendi Çadırıyla' : '🎪 Ekipman Kiraladı'} • {g.nights} gece • {g.guests} kişi
                </div>
                {g.equipment.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>Ekipman: {g.equipment.join(', ')}</div>
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

      {/* Ekipman Kataloğu */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🎪 Ekipman Kataloğu (Try Before You Buy)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {equipment.map((e) => (
            <div key={e.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{e.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{e.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{e.brand} • %{e.commissionRate} komisyon</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: '600' }}>Kira: {formatTL(e.dailyRental)} ₺/gün</span>
                <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>Satış: {formatTL(e.salePrice)} ₺</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {!e.rented && !e.purchased && (
                  <button onClick={() => rentEquipment(e.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    🎪 Kirala
                  </button>
                )}
                {!e.purchased && (
                  <button onClick={() => purchaseEquipment(e.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    🛒 Satın Al
                  </button>
                )}
                {e.purchased && (
                  <span style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(52,211,153,0.2)', color: '#34d399', fontSize: '11px', fontWeight: '600' }}>
                    ✅ Satın Alındı
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
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
