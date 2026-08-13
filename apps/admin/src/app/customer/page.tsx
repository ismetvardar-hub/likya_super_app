'use client';

import React, { useState, useEffect } from 'react';
import WeatherWidget from './components/WeatherWidget';
import ShoppingTab from './components/ShoppingTab';
import UpcyclingTab from './components/UpcyclingTab';
import FoodTab from './components/FoodTab';
import AccommodationTab from './components/AccommodationTab';
import SportsTab from './components/SportsTab';
import TicketsTab from './components/TicketsTab';
import WalletTab from './components/WalletTab';
import AIChatModal from './components/AIChatModal';
import CommunityEventsTab from './components/CommunityEventsTab';
import GiftSystem from './components/GiftSystem';
import ReviewTab from './components/ReviewTab';

export default function CustomerSuperApp() {
  const [activeScreen, setActiveScreen] = useState<'trendyol' | 'dolap' | 'food' | 'booking' | 'sports' | 'tickets' | 'wallet' | 'community' | 'gift' | 'review'>('trendyol');
  const [walletBalance, setWalletBalance] = useState(1450.00);
  const [ecoPoints, setEcoPoints] = useState(320);
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([]);
  const [qrCountdown, setQrCountdown] = useState(15);
  const [qrHash, setQrHash] = useState('LKY-9824-A7F2');

  // TOTP 15 Saniyelik QR Kod Döngüsü
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrHash(`LKY-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (dish: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === dish.id);
      if (exist) {
        return prev.map(i => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...dish, qty: 1 }];
    });
  };

  const tabs = [
    { key: 'review', icon: '⭐', label: 'Değerlendir' },
    { key: 'trendyol', icon: '🛍️', label: 'Alışveriş' },
    { key: 'dolap', icon: '♻️', label: '2.El Al-Sat' },
    { key: 'food', icon: '🍔', label: 'Yemek' },
    { key: 'booking', icon: '🏨', label: 'Konaklama' },
    { key: 'sports', icon: '🎾', label: 'Spor' },
    { key: 'tickets', icon: '🎟️', label: 'QR Bilet' },
    { key: 'wallet', icon: '💳', label: 'Cüzdan' },
    { key: 'community', icon: '👥', label: 'Topluluk' },
    { key: 'gift', icon: '🎁', label: 'İkram' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050811', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Akıllı Telefon Çerçevesi (Mobile Phone Mockup) */}
      <div
        style={{
          width: '410px',
          height: '844px',
          background: '#0d1322',
          borderRadius: '48px',
          border: '9px solid #1e293b',
          boxShadow: '0 30px 80px rgba(0, 242, 254, 0.25), 0 0 0 2px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Üst Durum Çubuğu (Status Bar & Dynamic Island) */}
        <div style={{ height: '38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', fontSize: '11px', color: '#94a3b8', zIndex: 30 }}>
          <span style={{ fontWeight: 'bold', color: '#fff' }}>09:41</span>
          <div style={{ width: '90px', height: '18px', background: '#000', borderRadius: '12px' }}></div>
          <span>📶 5G  🔋 98%</span>
        </div>

        {/* Müşteri Başlık Barı */}
        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13, 19, 34, 0.8)', backdropFilter: 'blur(12px)', zIndex: 20 }}>
          <div>
            <div style={{ fontSize: '10px', color: '#00f2fe', fontWeight: 'bold', letterSpacing: '0.8px' }}>🌲 LİKYA YAŞAM KAMPÜSÜ</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
              {activeScreen === 'trendyol' && '🛍️ Sıfır Ürün Alışverişi'}
              {activeScreen === 'dolap' && '♻️ 2.El Al-Sat & Upcycling'}
              {activeScreen === 'food' && '🍔 Kampüs Yemek (Migros)'}
              {activeScreen === 'booking' && '🏨 Konaklama & Rezervasyon'}
              {activeScreen === 'sports' && '🎾 Spor Kompleksi & Kort'}
              {activeScreen === 'tickets' && '🎟️ Bilet & QR Turnike'}
              {activeScreen === 'wallet' && '💳 Likya Pay & Cüzdan'}
              {activeScreen === 'community' && '👥 Topluluk & Etkinlikler'}
              {activeScreen === 'gift' && '🎁 Espirili İkram & Hediye'}
              {activeScreen === 'review' && '⭐ Hizmet Değerlendirmesi'}
            </div>
          </div>
          <div
            onClick={() => setActiveScreen('wallet')}
            style={{ background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00f2fe', borderRadius: '12px', padding: '4px 10px', cursor: 'pointer', textAlign: 'right' }}
          >
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Bakiye</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00f2fe' }}>₺{walletBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* Kaydırılabilir İçerik Alanı */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Canlı Glassmorphic Hava Durumu */}
          <WeatherWidget />

          {/* Aktif Sekme İçeriği */}
          {activeScreen === 'trendyol' && <ShoppingTab />}
          {activeScreen === 'dolap' && <UpcyclingTab />}
          {activeScreen === 'food' && <FoodTab cart={cart} addToCart={addToCart} walletBalance={walletBalance} setWalletBalance={setWalletBalance} setCart={setCart} />}
          {activeScreen === 'booking' && <AccommodationTab />}
          {activeScreen === 'sports' && <SportsTab />}
          {activeScreen === 'tickets' && <TicketsTab qrHash={qrHash} qrCountdown={qrCountdown} />}
          {activeScreen === 'community' && <CommunityEventsTab />}
          {activeScreen === 'gift' && <GiftSystem />}
          {activeScreen === 'review' && <ReviewTab />}
          {activeScreen === 'wallet' && <WalletTab walletBalance={walletBalance} setWalletBalance={setWalletBalance} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} />}
        </div>

        {/* Alt Sabit Menü (Bottom Navigation Bar) */}
        <div style={{ height: '68px', background: '#080d19', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 4px', zIndex: 20 }}>
          {tabs.map((tab) => {
            const isSelected = activeScreen === tab.key;
            return (
              <div
                key={tab.key}
                onClick={() => setActiveScreen(tab.key as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.45,
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  padding: '2px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span style={{ fontSize: '9px', color: isSelected ? '#00f2fe' : '#94a3b8', fontWeight: isSelected ? 'bold' : 'normal', marginTop: '2px' }}>
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yüzen AI Rehber Asistanı */}
      <AIChatModal />
    </div>
  );
}
