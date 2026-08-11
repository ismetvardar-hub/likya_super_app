'use client';

import React, { useState } from 'react';

interface EnergyTradeTransaction {
  id: string;
  sellerCampus: string;
  buyerCampus: string;
  amountKwh: number;
  pricePerKwh: string;
  totalLkyCoin: number;
  gridStatus: 'settled' | 'transferring';
  time: string;
}

export default function MicroGridP2PTrading() {
  const [trades, setTrades] = useState<EnergyTradeTransaction[]>([
    {
      id: 'TRD-701',
      sellerCampus: 'Kaş / Kalkan Eko-Kampüs (Fazla GES Üretimi)',
      buyerCampus: 'Antalya Merkez Kampüs (Yüksek Akşam Yükü)',
      amountKwh: 450,
      pricePerKwh: '₺1.80 (0.4 LKY)',
      totalLkyCoin: 180,
      gridStatus: 'settled',
      time: '14:40:12',
    },
    {
      id: 'TRD-702',
      sellerCampus: 'Phaselis Rüzgar & Güneş Hibrit',
      buyerCampus: 'Fethiye Kültür Havzası (Konser Aydınlatması)',
      amountKwh: 320,
      pricePerKwh: '₺1.75 (0.38 LKY)',
      totalLkyCoin: 121.6,
      gridStatus: 'transferring',
      time: '14:42:05',
    },
  ]);

  const executeAutoArbitrage = () => {
    const newTrade: EnergyTradeTransaction = {
      id: `TRD-${Math.floor(700 + Math.random() * 200)}`,
      sellerCampus: 'Antalya Merkez GES Batarya Depolama',
      buyerCampus: 'Maker Lab & Şarj İstasyonları',
      amountKwh: 200,
      pricePerKwh: '₺1.70 (0.35 LKY)',
      totalLkyCoin: 70,
      gridStatus: 'transferring',
      time: new Date().toLocaleTimeString('tr-TR'),
    };
    setTrades([newTrade, ...trades]);
    alert('⚡ Otonom P2P Enerji Arbitrajı tetiklendi. Fazla güneş enerjisi anında şarj istasyonlarına aktarıldı!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık & İstatistik */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(0, 242, 254, 0.4)',
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
            <span style={{ fontSize: '28px' }}>⚡</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              BÖLGESEL KAMPÜSLER ARASI P2P ENERJİ VE ARBİTRAJ BORSASI
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Bölgesel mikro-şebekeler arası fazla güneş enerjisini anlık akıllı sözleşmeler ve Likya Coin ile takas eden otonom borsa.
          </p>
        </div>

        <button
          onClick={executeAutoArbitrage}
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0, 242, 254, 0.35)',
          }}
        >
          ⚡ Otonom Enerji Arbitrajı Tetikle
        </button>
      </div>

      {/* Canlı Mikro-Şebeke Durum Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Takas Edilen Enerji</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '4px' }}>18,420 kWh</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Önlenen Şebeke Kaybı</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-green)', marginTop: '4px' }}>%98.6 Verimlilik</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Holding Enerji Fonu</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-orange)', marginTop: '4px' }}>4,250 LKY Coin</div>
        </div>
      </div>

      {/* Canlı İşlem Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {trades.map((trd) => (
          <div
            key={trd.id}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{trd.id}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: trd.gridStatus === 'settled' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                    color: trd.gridStatus === 'settled' ? 'var(--accent-green)' : 'var(--accent-cyan)',
                    fontWeight: 'bold',
                  }}
                >
                  {trd.gridStatus === 'settled' ? 'TAKAS TAMAMLANDI ✅' : 'ENERCİ AKIYOR ⚡'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trd.time}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>📤 <strong>Satıcı:</strong> {trd.sellerCampus}</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>📥 <strong>Alıcı:</strong> {trd.buyerCampus}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{trd.amountKwh} kWh</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>+{trd.totalLkyCoin} LKY Coin ({trd.pricePerKwh})</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
