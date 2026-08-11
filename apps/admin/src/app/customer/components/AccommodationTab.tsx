'use client';

import React, { useState } from 'react';

export default function AccommodationTab() {
  const [subTab, setSubTab] = useState<'cadir' | 'karavan' | 'karavan_otopark' | 'bungalow'>('cadir');
  const [hasFireplace, setHasFireplace] = useState(true);
  const [hasJacuzzi, setHasJacuzzi] = useState(true);

  return (
    <>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #065f46, #047857)', borderRadius: '16px', padding: '14px', color: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>🌲 LİKYA DOĞAL YAŞAM KONAKLAMA</div>
        <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>30-35 Dönüm Eko-Turizm & Deneyim Parkı</div>
        <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>Güneş Enerjisi (GES) • %100 Arıtılmış Su • Sıfır Atık Kampüsü</div>
      </div>

      {/* 4 Alt Kategori Butonları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '14px' }}>
        {[
          { id: 'cadir', label: 'Çadır', icon: '⛺' },
          { id: 'karavan', label: 'Karavan', icon: '🚐' },
          { id: 'karavan_otopark', label: 'Otopark', icon: '🅿️' },
          { id: 'bungalow', label: 'Bungalow', icon: '🏡' },
        ].map((tab) => {
          const isSelected = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              style={{
                background: isSelected ? '#10b981' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 2px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: isSelected ? 'bold' : '600', color: isSelected ? '#fff' : '#94a3b8' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tarih & Misafir Bilgi Kartı */}
      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Tarih Aralığı (2 Gece)</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>📅 12 Ağu 2026 - 14 Ağu 2026</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>Misafir</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>👥 2 Yetişkin</div>
        </div>
      </div>

      {/* 1. Çadır */}
      {subTab === 'cadir' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>⛺ Çadır Parselleri & Doğa Kampı</div>
          {[
            { id: 'c1', name: 'Göl Kenarı Çadır Parseli (C-04)', desc: 'Göl manzarası, 220V elektrik prizi, ortak mutfak & sıcak duş', price: 450, features: ['220V Kamp Prizi ⚡', 'Sıcak Duş 🚿', 'Ateş Çukuru 🔥'], icon: '⛺' },
            { id: 'c2', name: 'Sedir Koruluğu Çadır Parseli (C-11)', desc: 'Doğal gölgelik, hamak kancaları, temiz içme suyu çeşmesi', price: 400, features: ['Gölgelik Alan 🌲', 'Su Çeşmesi 💧', 'Starlink WiFi 📶'], icon: '🏕️' },
            { id: 'c3', name: 'Panoramik Tepe Çadır Parseli (C-18)', desc: 'Yıldız gözlem terası, özel ahşap platform taban, rüzgar korumalı', price: 500, features: ['Ahşap Platform 🪵', 'Yıldız Terası ✨', 'İzole Konum 🧘'], icon: '🌌' },
          ].map((item) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                {item.features.map((f, idx) => (
                  <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '6px', fontSize: '9px' }}>{f}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>₺{item.price}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}> / Gece</span>
                </div>
                <button
                  onClick={() => alert(`"${item.name}" için Çadır Rezervasyonunuz onaylandı!`)}
                  style={{ background: '#10b981', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Çadır Rezervasyonu Yap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Karavan */}
      {subTab === 'karavan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00f2fe' }}>🚐 "Try Before Buy" Test Karavanları</div>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '10px', color: '#cbd5e1' }}>
            💡 <strong>İnovasyon:</strong> Aracı satın alırsanız, 2 gecelik test konaklama bedeli satış fiyatından <strong>%100 düşülür!</strong>
          </div>
          {[
            { id: 'k1', name: 'Likya Nomad 4x4 Offroad Karavan', mfg: 'Hunter Nature Karavan A.Ş. • Parsel A-04', nightPrice: 1800, salePrice: '₺1,450,000 Satış', features: ['800W GES ☀️', '400Ah Akü 🔋', 'Dizel Isıtıcı ♨️'], icon: '🚐' },
            { id: 'k2', name: 'Olympos Panorama Tiny House (8.5m)', mfg: 'Mooble House Endüstriyel • Parsel B-08', nightPrice: 2400, salePrice: '₺2,200,000 Satış', features: ['Termowood Cephe 🪵', 'Asma Kat 🛏️', 'Şömine 🔥'], icon: '🏡' },
            { id: 'k3', name: 'Toros Compact Çekme Karavan (3.90m)', mfg: 'Erba Karavan • Parsel A-12', nightPrice: 1200, salePrice: '₺480,000 Satış', features: ['750kg O1 Belgeli 🚗', 'B Ehliyetli 🪪'], icon: '🚙' },
          ].map((item) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#00f2fe' }}>{item.mfg}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                {item.features.map((f, idx) => (
                  <span key={idx} style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '2px 6px', borderRadius: '6px', fontSize: '9px' }}>{f}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>₺{item.nightPrice} <span style={{ fontSize: '9px', color: '#94a3b8' }}>/ Gece</span></div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>Satış: {item.salePrice}</div>
                </div>
                <button
                  onClick={() => alert(`"${item.name}" için Test Konaklama rezervasyonunuz alındı!`)}
                  style={{ background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Test Konakla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Karavan Otopark */}
      {subTab === 'karavan_otopark' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6' }}>🅿️ Karavan Otopark & Donanımlı Parseller</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>16A/32A elektrik, temiz su ve gri su boşaltımına bağlanın.</div>
          {[
            { id: 'p1', name: 'Standart Karavan Parseli (K-02)', size: '10m x 6m • Çakıl Taban', price: 650, features: ['16A Elektrik ⚡', 'Temiz Su 🚰', 'Gri Su Tahliyesi 🕳️'], icon: '🅿️' },
            { id: 'p2', name: 'XL Offroad / Otobüs Karavan Parseli (K-09)', size: '14m x 8m • Kolay Giriş', price: 850, features: ['32A Hızlı Şarj ⚡', 'Basınçlı Su 🚿', 'Kimyasal Kaset 🧪'], icon: '🚌' },
            { id: 'p3', name: 'Göl Manzaralı Deck Parseli (K-15)', size: '12m x 7m • Ahşap Teras', price: 950, features: ['Özel Deck 🌅', 'Ayrı IoT Sayaç 📊', '7/24 Bariyer 🚧'], icon: '🏞️' },
          ].map((item) => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#3b82f6' }}>{item.size}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                {item.features.map((f, idx) => (
                  <span key={idx} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '2px 6px', borderRadius: '6px', fontSize: '9px' }}>{f}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#60a5fa' }}>₺{item.price}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}> / Gece</span>
                </div>
                <button
                  onClick={() => alert(`"${item.name}" Karavan Otopark Parseliniz ayırtıldı!`)}
                  style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Parseli Ayırt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Bungalow */}
      {subTab === 'bungalow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>🏡 Eko-Bungalow & Glamping Evleri</div>

          {/* Şömine & Jakuzi Seçim Kutuları */}
          <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' }}>
              ✨ Özel Ekstra Donanım & Konfor Tercihleri:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setHasFireplace(!hasFireplace)}
                style={{ background: hasFireplace ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hasFireplace ? '#ef4444' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <input type="checkbox" checked={hasFireplace} onChange={() => {}} style={{ accentColor: '#ef4444', width: '16px', height: '16px', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: hasFireplace ? '#fca5a5' : '#cbd5e1' }}>🔥 Şömine Sobası</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>+₺350 (Meşe Odunu)</div>
                </div>
              </div>

              <div
                onClick={() => setHasJacuzzi(!hasJacuzzi)}
                style={{ background: hasJacuzzi ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hasJacuzzi ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <input type="checkbox" checked={hasJacuzzi} onChange={() => {}} style={{ accentColor: '#06b6d4', width: '16px', height: '16px', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: hasJacuzzi ? '#67e8f9' : '#cbd5e1' }}>🛁 Açık Jakuzi</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>+₺500 (Termal Su)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bungalow Listesi */}
          {[
            { id: 'bg1', name: 'Sedir Ağacı Verandalı Eko-Bungalow (B-01)', desc: 'Doğal ahşap, dağ manzaralı, 2-4 kişilik', basePrice: 3000, isLakeView: false, icon: '🏡' },
            { id: 'bg2', name: 'Olympos Panoramik Glamping Dome (B-04)', desc: 'Yıldız gözlem kubbesi, teras ve hamak', basePrice: 3500, isLakeView: true, icon: '🛖' },
            { id: 'bg3', name: 'Aile Tipi Dubleks Orman Villası (B-07)', desc: 'Dubleks 6 kişilik, taş barbekü, bahçe', basePrice: 3800, isLakeView: false, icon: '🏰' },
          ].map((item) => {
            const extraPrice = (hasFireplace ? 350 : 0) + (hasJacuzzi ? 500 : 0);
            const finalPrice = item.basePrice + extraPrice;
            return (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: item.isLakeView ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', position: 'relative' }}>
                {item.isLakeView && (
                  <div style={{ position: 'absolute', top: '-8px', right: '12px', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 242, 254, 0.4)' }}>
                    🌅 Göl Manzaralı
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '32px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: '#f59e0b' }}>{item.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                  <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '2px 6px', borderRadius: '6px', fontSize: '9px' }}>Organik Kahvaltı 🍳</span>
                  {item.isLakeView && <span style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>🌅 Göl Manzaralı</span>}
                  {hasFireplace && <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>🔥 Şömine (+₺350)</span>}
                  {hasJacuzzi && <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>🛁 Jakuzi (+₺500)</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fbbf24' }}>₺{finalPrice}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}> / Gece (2 Gece: ₺{finalPrice * 2})</span>
                  </div>
                  <button
                    onClick={() => alert(`"${item.name}" rezervasyonunuz onaylandı!`)}
                    style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Bungalow Rezerve Et
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
