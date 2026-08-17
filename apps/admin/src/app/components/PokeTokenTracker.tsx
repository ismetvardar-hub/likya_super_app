'use client';

import React, { useEffect, useState } from 'react';

// ============================================================================
// 🎮 OYUNLAŞTIRILMIŞ TOKEN TAKİP ROZETİ (PokeTokenBar Modeli)
// Günlük harcanan Gemini/LLM token'ları + bütçe + seviye atlayan Sci-Fi rozeti.
// Kırılmasız: bağımsız bileşen; localStorage kalıcılığı.
// ============================================================================

const LS_KEY = 'likya_token_tracker_v1';

interface TokenState {
  spentToday: number;
  budget: number;
  level: number;
  xp: number;
}

const LEVEL_XP = 500; // her seviye 500 XP

function defaultState(): TokenState {
  return { spentToday: 0, budget: 40000, level: 1, xp: 0 };
}

function loadState(): TokenState {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) { const p = JSON.parse(raw) as TokenState; if (typeof p.spentToday === 'number') return p; }
  } catch { /* ignore */ }
  return defaultState();
}

const LEVEL_EMOJI: Record<number, string> = { 1: '🥉', 2: '🥈', 3: '🥇', 4: '💎', 5: '👑' };
const LEVEL_COLOR: Record<number, string> = { 1: '#a78bfa', 2: '#67e8f9', 3: '#fbbf24', 4: '#f472b6', 5: '#f59e0b' };

export default function PokeTokenTracker() {
  const [state, setState] = useState<TokenState>(defaultState);

  // localStorage'dan yükle (client-only)
  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = (next: TokenState) => {
    setState(next);
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Simülasyon: LLM çağrısı token harcatır
  const burnTokens = () => {
    const spend = 800 + Math.floor(Math.random() * 700);
    let next: TokenState = { ...state, spentToday: state.spentToday + spend, xp: state.xp + Math.round(spend / 4) };
    let lvl = next.level;
    while (next.xp >= lvl * LEVEL_XP && lvl < 5) { next.xp -= lvl * LEVEL_XP; lvl += 1; }
    next = { ...next, level: lvl };
    persist(next);
  };

  const resetDay = () => {
    const base = defaultState();
    persist({ ...base, level: state.level, xp: state.xp });
  };

  const pct = Math.min(100, Math.round((state.spentToday / state.budget) * 100));
  const xpPct = Math.min(100, Math.round((state.xp / (state.level * LEVEL_XP)) * 100));
  const color = pct > 90 ? '#f87171' : pct > 60 ? '#fbbf24' : '#00f2fe';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: `1px solid ${LEVEL_COLOR[state.level] ?? '#a78bfa'}44`, borderRadius: '16px', padding: '16px',
      boxShadow: `0 0 24px ${LEVEL_COLOR[state.level] ?? '#a78bfa'}22`,
    }}>
      {/* Rozet + seviye */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', background: `radial-gradient(circle at 35% 30%, ${LEVEL_COLOR[state.level] ?? '#a78bfa'}33, rgba(13,19,34,0.9))`,
          border: `2px solid ${LEVEL_COLOR[state.level] ?? '#a78bfa'}66`, boxShadow: `0 0 16px ${LEVEL_COLOR[state.level] ?? '#a78bfa'}44`,
        }}>
          {LEVEL_EMOJI[state.level] ?? '🎮'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🎮 Token Rozeti — Level {state.level}</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>PokeTokenBar · günlük LLM harcaması</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: LEVEL_COLOR[state.level] ?? '#a78bfa', padding: '3px 9px', borderRadius: '999px', background: `${LEVEL_COLOR[state.level] ?? '#a78bfa'}1a`, border: `1px solid ${LEVEL_COLOR[state.level] ?? '#a78bfa'}44` }}>
          LV {state.level}
        </span>
      </div>

      {/* Token sayaçları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
        <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b' }}>BUGÜN</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color }}>{state.spentToday.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>token</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.25)' }}>
          <div style={{ fontSize: '9px', color: '#64748b' }}>BÜTÇE</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#a78bfa' }}>{state.budget.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>token/gün</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ fontSize: '9px', color: '#64748b' }}>XP</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24' }}>{state.xp}</div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>/ {state.level * LEVEL_XP}</div>
        </div>
      </div>

      {/* İlerleme çubukları */}
      <div>
        <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>GÜNLÜK BÜTÇE KULLANIMI — %{pct}</div>
        <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>SEVİYE İLERLEMESİ — %{xpPct}</div>
        <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${xpPct}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${LEVEL_COLOR[state.level] ?? '#a78bfa'}, ${LEVEL_COLOR[state.level] ?? '#a78bfa'}66)` }} />
        </div>
      </div>

      {/* Aksiyonlar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={burnTokens} style={{ flex: 1, padding: '9px 0', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '12px' }}>
          ⚡ Token Harca (sim)
        </button>
        <button onClick={resetDay} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 700, fontSize: '12px' }}>
          Günü Sıfırla
        </button>
      </div>
    </div>
  );
}

