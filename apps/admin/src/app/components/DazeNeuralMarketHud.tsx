'use client';

import React, { useState } from 'react';
import { quoteCatalog, quoteProduct, computePnlSummary, marketTick, dazeMarketMakerEngineStatus, type PriceQuote, type Trade } from '../lib/ops/dazeMarketMakerEngine';

// ============================================================================
// 🧠 DAZE NEURAL MARKET HUD — Fütüristik Terminal Arayüzü
// • Cüzdan/PnL Özeti (Net PnL, Win Rate, Set Edge)
// • Neural Core Akış Şeması (Market Ingest → Feature Nodes → Probability Core)
// • Arz-Talep Sankey/Hedge akış göstergesi
// Finance görünümüne alt kart olarak bağlanır. Saf state; Plan Z güvenli.
// ============================================================================

export default function DazeNeuralMarketHud() {
  const [quotes, setQuotes] = useState<PriceQuote[]>(() => quoteCatalog());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tickCount, setTickCount] = useState(0);

  const pnl = computePnlSummary(trades);

  const runTick = () => {
    const lead = quotes[Math.floor(Math.random() * quotes.length)];
    const fresh = quoteProduct(MARKET_INPUT(lead.symbol));
    const fill = Math.round(fresh.dynamicPrice * (0.95 + Math.random() * 0.1) * 100) / 100;
    const nextTrades = marketTick(trades, lead.symbol, 1, fill, fresh.dynamicPrice, Math.random() > 0.4 ? 'BUY' : 'SELL');
    setTrades(nextTrades);
    setQuotes(quoteCatalog().map((c) => (c.symbol === lead.symbol ? fresh : c)));
    setTickCount((t) => t + 1);
  };

  const pnlColor = pnl.netPnlTl >= 0 ? '#4ade80' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, #020617, #0b1120)', border: '1px solid rgba(0,242,254,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 34px rgba(0,242,254,0.12)', fontFamily: "'Courier New', monospace" }}>
      {/* BAŞLIK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#00f2fe', letterSpacing: '1px' }}>🧠 DAZE NEURAL MARKET TERMINAL</div>
          <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>{dazeMarketMakerEngineStatus()} • tick #{tickCount}</div>
        </div>
        <button onClick={runTick} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.5)', cursor: 'pointer', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontFamily: 'inherit' }}>
          ⚡ MARKET TICK
        </button>
      </div>

      {/* 1. CÜZDAN / PNL ÖZETİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '8px' }}>
        {[
          { label: 'NET PNL', value: `₺${pnl.netPnlTl.toFixed(2)}`, color: pnlColor },
          { label: 'WIN RATE', value: `${(pnl.winRate * 100).toFixed(1)}%`, color: '#e2e8f0' },
          { label: 'SET EDGE', value: `₺${pnl.setEdge.toFixed(2)}`, color: pnl.setEdge >= 0 ? '#4ade80' : '#f87171' },
          { label: 'İŞLEM', value: String(pnl.totalTrades), color: '#94a3b8' },
          { label: 'W/L', value: `${pnl.wins}/${pnl.losses}`, color: '#f0abfc' },
        ].map((m) => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: m.color, letterSpacing: '0.5px' }}>{m.value}</div>
            <div style={{ fontSize: '8px', color: '#475569', marginTop: '2px', letterSpacing: '1px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* 2. NEURAL CORE AKIŞ ŞEMASI */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc', letterSpacing: '1px' }}>NEURAL CORE — AKIŞ ŞEMASI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <FlowNode label="MARKET INGEST" detail="Occupancy + Velocity" color="#00f2fe" />
          <FlowArrow />
          <FlowNode label="FEATURE NODES" detail="13 fiyat özelliği" color="#f0abfc" />
          <FlowArrow />
          <FlowNode label="PROBABILITY CORE" detail="P(fill) • P(edge)" color="#4ade80" />
          <FlowArrow />
          <FlowNode label="HEDGE OUTPUT" detail="risk katsayısı" color="#fbbf24" />
        </div>
      </div>

      {/* 3. KATALOG SİNYALLERİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
        {quotes.map((q) => (
          <div key={q.symbol} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${q.side === 'RAISE' ? 'rgba(74,222,128,0.4)' : q.side === 'DISCOUNT' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '12px', padding: '10px' }}>
            <div style={{ fontSize: '8px', color: '#64748b', letterSpacing: '0.5px' }}>{q.symbol} • {q.productClass.toUpperCase()}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#e2e8f0', margin: '4px 0' }}>{q.name}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: q.side === 'RAISE' ? '#4ade80' : q.side === 'DISCOUNT' ? '#fbbf24' : '#e2e8f0' }}>
              ₺{q.dynamicPrice.toFixed(0)} <span style={{ fontSize: '9px', color: '#475569' }}>({q.marginPct >= 0 ? '+' : ''}{q.marginPct}%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b', marginTop: '6px' }}>
              <span>EDGE {q.edgeScore >= 0 ? '+' : ''}{q.edgeScore}</span>
              <span>HEDGE {(q.riskHedgeCoeff * 100).toFixed(0)}%</span>
              <span>{q.side}</span>
            </div>
            <div style={{ marginTop: '6px', height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ height: '100%', width: `${q.riskHedgeCoeff * 100}%`, background: q.riskHedgeCoeff > 0.5 ? '#f87171' : q.riskHedgeCoeff > 0.3 ? '#fbbf24' : '#4ade80', borderRadius: '99px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 4. ARZ-TALEP SANKEY / HEDGE AKIŞI */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc', letterSpacing: '1px' }}>ARZ ⇄ TALEP SANKEY / HEDGE AKIŞI</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, fontSize: '10px', color: '#e2e8f0' }}>
            TALEP <b style={{ color: '#4ade80' }}>{quotes.reduce((a, q) => a + q.demandVelocity, 0)}/sa</b> → FİYAT KATMANLARI
          </div>
          <div style={{ flex: 2, minWidth: 180, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {['RAISE', 'MARK', 'DISCOUNT'].map((s) => {
              const count = quotes.filter((q) => q.side === s).length;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '8px', color: '#64748b', width: 56 }}>{s}</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ width: `${(count / quotes.length) * 100}%`, height: '100%', borderRadius: '4px', background: s === 'RAISE' ? 'rgba(74,222,128,0.7)' : s === 'MARK' ? 'rgba(0,242,254,0.6)' : 'rgba(251,191,36,0.7)' }} />
                  </div>
                  <span style={{ fontSize: '8px', color: '#94a3b8' }}>{count}</span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, minWidth: 120, fontSize: '10px', color: '#e2e8f0' }}>
            HEDGE <b style={{ color: '#fbbf24' }}>{((quotes.reduce((a, q) => a + q.riskHedgeCoeff, 0) / quotes.length) * 100).toFixed(0)}%</b> havuz
          </div>
        </div>
      </div>
    </div>
  );
}

// --- yardımcılar (saf) ---
function MARKET_INPUT(symbol: string) {
  return { productClass: 'restoran' as const, symbol, name: symbol, basePrice: 100, occupancy: 0.5, stockRisk: 0.3, demandVelocity: 8 };
}

function FlowNode({ label, detail, color }: { label: string; detail: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 10px', borderRadius: '10px', border: `1px solid ${color}44`, background: `${color}11` }}>
      <div style={{ fontSize: '9px', fontWeight: 900, color, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '8px', color: '#64748b' }}>{detail}</div>
    </div>
  );
}

function FlowArrow() {
  return <span style={{ color: '#334155', fontSize: '14px' }}>→</span>;
}

