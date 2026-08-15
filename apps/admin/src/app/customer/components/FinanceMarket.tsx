'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// 🪙 LİKYA FİNANS & BORSA EKRANI (CoinGecko — ücretsiz, anahtar gerektirmez)
// Canlı kripto fiyatları + 24s değişim + piyasa nabzı
// ============================================================================

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
}

const COINS: { id: string; symbol: string; name: string; icon: string }[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', icon: '✕' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: '◆' },
];

export default function FinanceMarket() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [error, setError] = useState('');

  const fetchPrices = async () => {
    try {
      const ids = COINS.map((c) => c.id).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const next: CoinData[] = COINS.map((c) => ({
        ...c,
        price: data[c.id]?.usd ?? 0,
        change24h: data[c.id]?.usd_24h_change ?? 0,
      }));
      setCoins(next);
      setLastUpdate(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setError('');
    } catch {
      setError('Piyasa verisi alınamadı (çevrimdışı)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPrices();
    const interval = setInterval(() => void fetchPrices(), 60000); // 60 sn
    return () => clearInterval(interval);
  }, []);

  // Piyasa nabzı: 24s değişimlerin ortalaması
  const marketPulse = coins.length
    ? coins.reduce((a, c) => a + c.change24h, 0) / coins.length
    : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>🪙 Finans & Borsa</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Canlı piyasa akışı • CoinGecko</div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
          color: marketPulse >= 0 ? '#4ade80' : '#f87171',
          background: marketPulse >= 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${marketPulse >= 0 ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
        }}>
          {loading ? '⏳' : marketPulse >= 0 ? `📈 +%${marketPulse.toFixed(1)}` : `📉 %${marketPulse.toFixed(1)}`}
        </span>
      </div>

      {error && (
        <div style={{ fontSize: '10px', color: '#f87171', padding: '8px 12px', borderRadius: '10px', background: 'rgba(248,113,113,0.08)' }}>{error}</div>
      )}

      {/* Piyasa kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading && coins.length === 0
          ? [0, 1, 2].map((i) => (
              <div key={i} style={{ height: '52px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))
          : coins.map((c) => {
              const up = c.change24h >= 0;
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    background: up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${up ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: up ? '#4ade80' : '#f87171', fontSize: '16px', fontWeight: 'bold',
                  }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{c.symbol}/USD</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e2e8f0' }}>
                      ${c.price >= 100 ? c.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : c.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: '700', color: up ? '#4ade80' : '#f87171' }}>
                      {up ? '▲' : '▼'} %{Math.abs(c.change24h).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Alt bilgi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#475569' }}>
        <span>Güncelleme: {lastUpdate || '—'}</span>
        <button
          onClick={() => { setLoading(true); void fetchPrices(); }}
          style={{ padding: '6px 12px', borderRadius: '14px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '9px', fontWeight: '700' }}
        >
          🔄 Yenile
        </button>
      </div>
    </div>
  );
}

