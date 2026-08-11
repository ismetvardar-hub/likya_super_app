'use client';

import React, { useState } from 'react';

interface WalletTabProps {
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  ecoPoints: number;
  setEcoPoints: React.Dispatch<React.SetStateAction<number>>;
}

export default function WalletTab({ walletBalance, setWalletBalance, ecoPoints, setEcoPoints }: WalletTabProps) {
  const [topUpAmount, setTopUpAmount] = useState('250');

  return (
    <>
      {/* Cüzdan Kartı */}
      <div style={{ background: 'linear-gradient(135deg, #0f4c81, #1e3a8a)', borderRadius: '20px', padding: '20px', color: '#fff', boxShadow: '0 10px 25px rgba(0, 242, 254, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', letterSpacing: '1px', opacity: 0.8 }}>LİKYA DİJİTAL CÜZDAN & PAY</span>
          <span style={{ fontSize: '18px' }}>💳</span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '10px' }}>₺{walletBalance.toFixed(2)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '12px' }}>
          <span style={{ color: '#00f2fe' }}>85.0 LKY Coin</span>
          <span style={{ color: '#48bb78' }}>🌱 {ecoPoints} Eko-Puan</span>
        </div>
      </div>

      {/* Hızlı Bakiye Yükleme */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.2), rgba(0, 242, 254, 0.05))', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>⚡ Bakiye Yükle (Kredi Kartı / FAST)</div>
          <span style={{ background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px' }}>+%10 Bonus Eko-Puan 🎁</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {['100', '250', '500', '1000', '2500'].map((amt) => (
            <button
              key={amt}
              onClick={() => setTopUpAmount(amt)}
              style={{ flex: 1, padding: '8px 2px', borderRadius: '10px', border: topUpAmount === amt ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)', background: topUpAmount === amt ? 'rgba(0, 242, 254, 0.25)' : 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ₺{amt}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            const add = parseFloat(topUpAmount);
            const bonusPts = Math.floor(add * 0.1);
            setWalletBalance(prev => prev + add);
            setEcoPoints(prev => prev + bonusPts);
            alert(`₺${add} bakiye ve ${bonusPts} Hediye Eko-Puan yüklendi!`);
          }}
          style={{ width: '100%', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', border: 'none', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ₺{topUpAmount} Yükle (Anında Geçerli + {Math.floor(parseFloat(topUpAmount || '0') * 0.1)} Puan)
        </button>
      </div>

      {/* Karbon Ayak İzi & Fidan Sertifikası */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>🌿 Eko-Etki & Karbon Tasarrufu</div>
          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px' }}>Sıfır Atık Kampüsü 🍃</span>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginTop: '6px' }}>
          14.2 kg <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'normal' }}>CO₂ Tasarrufu Sağlandı</span>
        </div>
        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
          Güneş Enerjisi (GES), E-Bike ve Sıfır Atık kullanarak doğaya katkı sağladınız.
        </div>

        <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>🌲 Likya Hatıra Ormanı Sertifikası</div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Parsel F-12 • Adınıza 1 Kızılçam Fidanı Dikildi</div>
          </div>
          <button
            onClick={() => alert('📜 Likya Hatıra Ormanı Sertifikanız: "Ahmet Y. adına 1 Kızılçam Fidanı dikilmiştir. Koordinat: 36.524°K, 30.456°D"')}
            style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📜 Sertifika Gör
          </button>
        </div>
      </div>
    </>
  );
}
