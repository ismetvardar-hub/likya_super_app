'use client';

import React, { useState } from 'react';
import ExtremeSCustomerPortal from '../components/ExtremeSCustomerPortal';
import { generateLikyaPass, verifyLikyaPass, passRefreshCountdown, antiScreenshotOverlay, likyaPassEngineStatus, type LikyaPass, type PassZone } from '../lib/security/likyaPassEngine';
import { findOpenMatches, autoMatchPlayer, joinMatch, matchmakingEngineStatus, type PlayerLevel, type OpenMatch } from '../lib/sports/matchmakingEngine';
import { STAY_UNITS, reserveStay, MARKET_PRODUCTS, buyMarketProduct, CAFE_MENU, orderCafeItem, extremeHoldingRoutesStatus } from '../lib/ops/extremeHoldingRoutes';

// ============================================================================
// 📱 EXTREMES — GLOBAL SPOR & YAŞAM TARZI SÜPER-APP (PWA)
// /extremes & /app: Likya Pass QR • Canlı Maç • Stay • Market • Daze Cafe
// 5 tablı alt navigasyon. Plan Z güvenli; deterministik.
// ============================================================================

type Tab = 'home' | 'play' | 'pass' | 'market' | 'profile';

const NAV_TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Ana Sayfa' },
  { id: 'play', icon: '🎾', label: 'Oyna' },
  { id: 'pass', icon: '📲', label: 'QR Pass' },
  { id: 'market', icon: '🛍️', label: 'Pazar & Stay' },
  { id: 'profile', icon: '👤', label: 'Profil' },
];

const STORIES = [
  { icon: '🏆', label: 'Turnuva: Final' },
  { icon: '🎾', label: 'Haftanın Vuruşu' },
  { icon: '🥗', label: 'Günün Menüsü' },
  { icon: '📣', label: 'Antrenör Duyuru' },
  { icon: '🏕️', label: 'Glamping Fırsatı' },
];

export default function ExtremeSSuperApp() {
  const [tab, setTab] = useState<Tab>('home');
  const [passZone, setPassZone] = useState<PassZone>('gate');
  const [pass, setPass] = useState<LikyaPass>(() => generateLikyaPass('VELI_V1_38', 'gate'));
  const [passVisible, setPassVisible] = useState(false);
  const [player] = useState<PlayerLevel>({ playerId: 'Efe', name: 'Efe K.', level: 3.2, xp: 1420, streakDays: 12, tier: 'Altın' });
  const [matches, setMatches] = useState<OpenMatch[]>(() => findOpenMatches(3.2));
  const [actionMsg, setActionMsg] = useState('');

  const refreshPass = () => setPass(generateLikyaPass('VELI_V1_38', passZone));

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100dvh', background: 'linear-gradient(180deg,#0f172a,#1e1b4b)', boxShadow: '0 0 50px rgba(124,58,237,0.25)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        {/* ÜST BAR */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: 'env(safe-area-inset-top, 12px) 16px 12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>ExtremeS</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 6, alignItems: 'center' }}>🔥 12 Günlük Seri • <b>{player.tier} L{player.level.toFixed(1)}</b> • {player.xp.toLocaleString()} XP</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => { refreshPass(); setPassVisible(true); }} style={{ fontSize: 9, fontWeight: 900, padding: '7px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}>📲 Likya Pass QR</button>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#fbbf24,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', cursor: 'pointer' }}>A</div>
          </div>
        </div>

        {/* GÖVDE */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px calc(82px + env(safe-area-inset-bottom, 0px))' }}>
          {tab === 'home' && (
            <>
              {/* HİKAYE ŞERİDİ */}
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                {STORIES.map((s) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 999, border: '3px solid #8b5cf6', padding: 3, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: 999, background: 'linear-gradient(135deg,#4f46e5,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                    </div>
                    <span style={{ fontSize: 8, color: '#a5b4fc', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* 4 TEMEL EYLEM KARTI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                {[
                  { icon: '🎾', label: 'Kort Kirala & Maç Bul', sub: `${matches.length} açık maç`, color: '#22d3ee', go: () => setTab('play') },
                  { icon: '🏕️', label: 'Glamping & Stay', sub: `${STAY_UNITS.filter((u) => u.available).length} müsait`, color: '#34d399', go: () => setTab('market') },
                  { icon: '🛍️', label: 'Kulüp Pazaryeri', sub: `${MARKET_PRODUCTS.length} ürün • korta teslim`, color: '#fbbf24', go: () => setTab('market') },
                  { icon: '🥗', label: 'Daze Cafe Sipariş', sub: '120s geri sayım', color: '#f87171', go: () => setTab('market') },
                ].map((c) => (
                  <button key={c.label} onClick={c.go} style={{ padding: '14px 10px', borderRadius: 14, border: `1px solid ${c.color}44`, background: `${c.color}11`, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: 22 }}>{c.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginTop: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 9, color: c.color }}>{c.sub}</div>
                  </button>
                ))}
              </div>

              {/* KULÜP FİNANS & SADAKAT PANELİ */}
              <div style={{ marginTop: 12 }}>
                <ExtremeSCustomerPortal />
              </div>
            </>
          )}


          {tab === 'play' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>🎾 Oyna & Eşleş — {matchmakingEngineStatus()}</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 14, padding: 12, fontSize: 10, color: '#e2e8f0', lineHeight: 1.7 }}>
                <b style={{ color: '#22d3ee' }}>{player.name}</b> — Seviye <b>L{player.level.toFixed(1)}</b> • {player.tier} • 🔥 {player.streakDays} gün seri • {player.xp} XP
                <div style={{ marginTop: 4, fontSize: 9, color: '#a5b4fc' }}>{autoMatchPlayer(3.2).note}</div>
              </div>
              {matches.map((m) => (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{m.sport === 'padel' ? '🏓' : '🎾'} {m.court}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{m.time} • Seviye {m.levelRange} • Ev sahibi: {m.host}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: m.players === m.capacity ? '#f87171' : '#4ade80' }}>{m.players}/{m.capacity}</span>
                    <button onClick={() => { const r = joinMatch(m, 'Efe K.'); setActionMsg(r.message); }} disabled={m.players >= m.capacity} style={{ fontSize: 9, fontWeight: 800, padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22d3ee,#4facfe)', color: '#0d1322' }}>Katıl</button>
                  </div>
                </div>
              ))}
              {actionMsg && <div style={{ fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: 8 }}>{actionMsg}</div>}
            </div>
          )}

          {tab === 'pass' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', paddingTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>📲 Likya Pass — {likyaPassEngineStatus()}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {(['gate', 'court-light', 'locker', 'facility'] as PassZone[]).map((z) => (
                  <button key={z} onClick={() => { setPassZone(z); setPass(generateLikyaPass('VELI_V1_38', z)); }} style={{ fontSize: 9, padding: '7px 12px', borderRadius: 999, border: `1px solid ${passZone === z ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}`, background: passZone === z ? 'rgba(139,92,246,0.25)' : 'transparent', color: passZone === z ? '#c4b5fd' : '#94a3b8', cursor: 'pointer' }}>{z.replace('-', ' ')}</button>
                ))}
              </div>
              {/* QR GÖRSELİ (simülasyon) */}
              <div style={{ width: 210, height: 210, borderRadius: 20, background: '#fff', padding: 16, position: 'relative' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {Array.from({ length: 400 }, (_, i) => {
                    const x = i % 20, y = Math.floor(i / 20);
                    const on = (x * 7 + y * 13 + (pass.token.charCodeAt(i % pass.token.length))) % 3 === 0;
                    return on ? <rect key={i} x={x * 5} y={y * 5} width="4.4" height="4.4" fill="#111827" /> : null;
                  })}
                </svg>
                <div style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontWeight: 800, color: '#f87171', letterSpacing: 1 }}>{antiScreenshotOverlay()}</div>
              </div>
              <div style={{ fontSize: 10, color: '#a5b4fc' }}>Token: {pass.token} • yenilenme: <b style={{ color: '#fbbf24' }}>{passRefreshCountdown(pass)}s</b></div>
              <div style={{ fontSize: 10, color: verifyLikyaPass(pass).ok ? '#4ade80' : '#f87171' }}>{verifyLikyaPass(pass).note}</div>
              <button onClick={refreshPass} style={{ fontSize: 10, fontWeight: 800, padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', color: '#fff' }}>🔄 QR'ı Yenile (30s)</button>
            </div>
          )}


          {tab === 'market' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>🛍️ Likya Holding — {extremeHoldingRoutesStatus()}</div>

              {/* LİKYA STAY */}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>🏕️ Likya Stay — Konaklama</div>
              {STAY_UNITS.map((u) => (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{u.type === 'glamping' ? '⛺' : u.type === 'bungalow' ? '🏡' : '🛋️'} {u.name} {u.courtSide && <span style={{ color: '#34d399', fontSize: 8 }}>• kort kenarı</span>}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>₺{u.priceTl} / gece</div>
                  </div>
                  <button onClick={() => { const r = reserveStay(u.id, 1); setActionMsg(r.message); }} disabled={!u.available} style={{ fontSize: 9, fontWeight: 800, padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: u.available ? 'linear-gradient(135deg,#34d399,#22d3ee)' : '#334155', color: u.available ? '#0d1322' : '#94a3b8' }}>{u.available ? 'Rezerve' : 'Dolu'}</button>
                </div>
              ))}

              {/* LİKYA MARKET */}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', marginTop: 6 }}>🛍️ Likya Market — Korta Teslimat</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MARKET_PRODUCTS.map((p) => (
                  <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>₺{p.priceTl} {p.deliverToCourt ? '• 🎾 korta teslim' : ''}</div>
                    <button onClick={() => { const r = buyMarketProduct(p.id, true); setActionMsg(r.message); }} style={{ marginTop: 8, fontSize: 9, fontWeight: 800, padding: '7px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#0d1322' }}>Satın Al</button>
                  </div>
                ))}
              </div>

              {/* DAZE MIND CAFE */}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#f87171', marginTop: 6 }}>🥗 Daze Mind Cafe — 120s</div>
              {CAFE_MENU.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>₺{c.priceTl} • ⏱️ {c.prepSec}s</div>
                  </div>
                  <button onClick={() => { const r = orderCafeItem(c.id, 'court'); setActionMsg(r.message); }} style={{ fontSize: 9, fontWeight: 800, padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f87171,#fb923c)', color: '#0d1322' }}>Sipariş</button>
                </div>
              ))}

              {actionMsg && <div style={{ fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: 8 }}>{actionMsg}</div>}
            </div>
          )}

          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>👤 Profil & Ailem</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, padding: 12, fontSize: 10, color: '#e2e8f0', lineHeight: 1.8 }}>
                <b style={{ color: '#c4b5fd' }}>Efe K.</b> — Altın L3.2 • 1.420 XP • 🔥 12 gün seri<br />
                🎟️ 365 gün ders kredisi: <b style={{ color: '#4ade80' }}>3 kalan</b> • 👨👩👧👦 Aile: %30 indirim
              </div>
              <div style={{ fontSize: 10, color: '#a5b4fc' }}>🎯 Hedef: Seviye 4.0'a ulaş (580 XP kaldı) — antrenman sonrası otomatik XP kazanırsın.</div>
            </div>
          )}
        </div>


        {/* ALT SABİT BOTTOM NAV */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(139,92,246,0.3)', display: 'flex', justifyContent: 'space-around', padding: '6px 4px calc(6px + env(safe-area-inset-bottom, 0px))', zIndex: 30 }}>
          {NAV_TABS.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 12, color: tab === n.id ? '#c4b5fd' : '#64748b' }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 8, fontWeight: tab === n.id ? 800 : 500 }}>{n.label}</span>
              {tab === n.id && <span style={{ width: 16, height: 3, borderRadius: 99, background: '#8b5cf6' }} />}
            </button>
          ))}
        </div>

        {/* LİKYA PASS MODAL */}
        {passVisible && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPassVisible(false)}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 20, width: 260, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#111827' }}>📲 Likya Pass — {passZone.replace('-', ' ')}</div>
              <div style={{ width: 180, height: 180, margin: '12px auto', position: 'relative' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {Array.from({ length: 400 }, (_, i) => {
                    const x = i % 20, y = Math.floor(i / 20);
                    const on = (x * 7 + y * 13 + (pass.token.charCodeAt(i % pass.token.length))) % 3 === 0;
                    return on ? <rect key={i} x={x * 5} y={y * 5} width="4.4" height="4.4" fill="#111827" /> : null;
                  })}
                </svg>
              </div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Token {pass.token} • {passRefreshCountdown(pass)}s kaldı</div>
              <button onClick={refreshPass} style={{ marginTop: 8, fontSize: 10, fontWeight: 800, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', color: '#fff' }}>🔄 Yenile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

