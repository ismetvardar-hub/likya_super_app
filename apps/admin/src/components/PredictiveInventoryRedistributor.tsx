'use client';

import React, { useState } from 'react';

interface PredictiveInventoryItem {
  id: string;
  category: string;
  itemName: string;
  currentStock: string;
  predictedDemand: string;
  recommendedAction: string;
  confidenceScore: number;
  preventedWasteKg: number;
}

export default function PredictiveInventoryRedistributor() {
  const [items, setItems] = useState<PredictiveInventoryItem[]>([
    {
      id: 'INV-101',
      category: 'Gıda & Yemekhane',
      itemName: 'Organik Ege Enginarı & Sebze Stoku',
      currentStock: '140 Porsiyon',
      predictedDemand: '85 Porsiyon (Yarın Yağışlı)',
      recommendedAction: 'Kalan 55 porsiyon bu akşam "Askıda Yemek" büfesine %40 indirimli tahsis edilsin.',
      confidenceScore: 97.4,
      preventedWasteKg: 28,
    },
    {
      id: 'INV-102',
      category: 'Adil Masa & Hasat',
      itemName: 'Toros Çam Balı & Keçiboynuzu Pekmezi',
      currentStock: '45 Kavanoz',
      predictedDemand: '90 Kavanoz (Bahar Konseri Nedeniyle Talep Artışı)',
      recommendedAction: 'Fethiye kooperatifinden 45 kavanoz ilave otonom kargo rover ile sevk edilsin.',
      confidenceScore: 98.1,
      preventedWasteKg: 0,
    },
    {
      id: 'INV-103',
      category: 'Maker Lab & Yedek Parça',
      itemName: '18650 Li-Ion E-Bisiklet Batarya Hücreleri',
      currentStock: '32 Adet',
      predictedDemand: '60 Adet (Hafta Sonu Bisiklet Bakım Kampanyası)',
      recommendedAction: 'Geri dönüşüm atölyesindeki test edilmiş hücreler montaj hattına yönlendirilsin.',
      confidenceScore: 95.8,
      preventedWasteKg: 14,
    },
  ]);

  const executeAutoRedistribution = () => {
    alert('Yapay zeka otonom stok yeniden dağıtımını başlattı. Kargo roverları ve askıda yemek bildirimleri otomatik olarak tetiklendi! 📦');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Bilgi Başlığı */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(224, 122, 95, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(224, 122, 95, 0.4)',
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
            <span style={{ fontSize: '28px' }}>📈</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              AI TAHMİNSEL TALEP & DÖNGÜSEL STOK YÖNETİMİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Hava durumu, konser etkinlik takvimi ve tüketim alışkanlıklarını analiz ederek israfı oluşmadan önce sıfırlayan yapay zeka.
          </p>
        </div>

        <button
          onClick={executeAutoRedistribution}
          style={{
            background: 'linear-gradient(135deg, var(--accent-orange), var(--primary-blue))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(224, 122, 95, 0.35)',
          }}
        >
          ⚡ Otonom Dağıtımı Onayla & Başlat
        </button>
      </div>

      {/* Tahmin Kartları Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{item.id}</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>{item.itemName}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {item.category}
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(72, 187, 120, 0.15)',
                  color: 'var(--accent-green)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                AI Güven: %{item.confidenceScore}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mevcut Stok</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '2px' }}>{item.currentStock}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Tahmini Talep</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-orange)', marginTop: '2px' }}>{item.predictedDemand}</div>
              </div>
              {item.preventedWasteKg > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Önlenen İsraf</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-green)', marginTop: '2px' }}>+{item.preventedWasteKg} kg Gıda/Malzeme</div>
                </div>
              )}
            </div>

            <div
              style={{
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#cbd5e1',
              }}
            >
              💡 <strong>AI Otonom Aksiyon Önerisi:</strong> {item.recommendedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
