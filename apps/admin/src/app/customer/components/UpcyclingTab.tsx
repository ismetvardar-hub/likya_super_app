'use client';

import React, { useState } from 'react';

export default function UpcyclingTab() {
  const [aiScanning, setAiScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<{ brand: string; model: string; price: string } | null>(null);
  const [unlockedLocker, setUnlockedLocker] = useState<string | null>(null);

  const handleAiScan = () => {
    setAiScanning(true);
    setTimeout(() => {
      setAiScanning(false);
      setScannedItem({
        brand: 'Quechua / Decathlon',
        model: '2 Seconds Easy Çadır 3 Kişilik',
        price: '₺1,450',
      });
    }, 1000);
  };

  const items = [
    { id: 'd1', title: 'Fender FA-115 Akustik Gitar (Upcycling Onarıldı)', seller: 'Müzik Atölyesi 🎸', price: '₺2,400', condition: 'Çok İyi • Teller Yeni', badge: 'Spor Kulübü Fonuna ₺240', icon: '🎸' },
    { id: 'd2', title: 'Wilson Pro Staff Tenis Raketi', seller: 'Caner K. 🎾', price: '₺1,100', condition: 'Az Kullanılmış', badge: 'Spor Kulübü Fonuna ₺110', icon: '🎾' },
    { id: 'd3', title: 'Salomon X Ultra Gore-Tex Outdoor Ayakkabı', seller: 'Zeynep D. 🥾', price: '₺1,850', condition: 'Yeni Gibi', badge: 'Spor Kulübü Fonuna ₺185', icon: '🥾' },
  ];

  return (
    <>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #00d2b5, #008f7a)', borderRadius: '16px', padding: '14px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>♻️ LİKYA 2.EL AL-SAT & UPCYCLING</span>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>Spor Kulübü Fonu ⚽</span>
        </div>
        <div style={{ fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>2. El Doğa Eşyaları & Yenilenmiş Ürünler</div>
        <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>Satış gelirlerinin %10'u Amatör Spor Kulübüne aktarılır.</div>
      </div>

      {/* AI Vision İlan Yükleme */}
      <div style={{ background: 'rgba(0, 210, 181, 0.08)', border: '1px solid #00d2b5', borderRadius: '14px', padding: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00d2b5' }}>📸 AI Vision ile 5 Saniyede İlan Yükle</div>
        <p style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>Satmak veya bağışlamak istediğiniz ekipmanın fotoğrafını çekin.</p>
        <button
          onClick={handleAiScan}
          disabled={aiScanning}
          style={{ marginTop: '8px', width: '100%', background: '#00d2b5', border: 'none', color: '#000', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
        >
          {aiScanning ? '⏳ AI Fotoğrafı Tanıyor...' : '📷 Fotoğraf Çek & Fiyat Önerisi Al'}
        </button>
        {scannedItem && (
          <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', fontSize: '11px' }}>
            <span style={{ color: '#00d2b5', fontWeight: 'bold' }}>Tespit Edildi:</span> {scannedItem.brand} {scannedItem.model} • <strong>{scannedItem.price}</strong>
          </div>
        )}
      </div>

      {/* Akıllı IoT Teslimat Dolabı */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0, 210, 181, 0.12), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(0, 210, 181, 0.3)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00d2b5' }}>📦 Akıllı IoT Dolap (Temassız Teslimat)</div>
          <span style={{ background: 'rgba(0, 210, 181, 0.2)', color: '#00d2b5', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px' }}>Bluetooth / IoT 🔐</span>
        </div>
        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
          2. El ürünleri veya Adil Masa siparişlerinizi yüz yüze gelmeden dolaplardan 7/24 teslim alın.
        </div>
        <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>📍 Dolap #04 (Mühendislik Binası Girişi)</div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Bekleyen: Fender Gitar • Şifre: 8492</div>
          </div>
          <button
            onClick={() => {
              setUnlockedLocker('Dolap #04');
              alert('🔓 Dolap #04 Kilidi Açıldı! Lütfen eşyanızı alıp kapağı kapatınız.');
            }}
            style={{ background: unlockedLocker === 'Dolap #04' ? '#48bb78' : 'linear-gradient(135deg, #00d2b5, #008f7a)', border: 'none', color: unlockedLocker === 'Dolap #04' ? '#fff' : '#000', padding: '8px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {unlockedLocker === 'Dolap #04' ? '✅ Açıldı' : '🔓 Kilidi Aç'}
          </button>
        </div>
      </div>

      {/* 2. El Ürün Kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '32px' }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{item.title}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.seller} • {item.condition}</div>
              <div style={{ fontSize: '9px', color: '#00d2b5', fontWeight: 'bold', marginTop: '2px' }}>💚 {item.badge}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{item.price}</div>
              <button
                onClick={() => alert(`"${item.title}" için Escrow güvenceli satın alma başlatıldı.`)}
                style={{ marginTop: '4px', background: '#00d2b5', border: 'none', color: '#000', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Teklif Ver / Al
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
