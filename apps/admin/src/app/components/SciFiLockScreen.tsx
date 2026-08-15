'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Fingerprint, KeyRound, Lock } from 'lucide-react';

// ============================================================================
// 🎛️ SCİ-Fİ HUD ACCESS NODE — Kuantum/Neon Grid Kilit Ekranı
// CEO paneli giriş kapısı: fütüristik terminal veri akışı + PIN + güvenlik
// jetonu onay animasyonu. Session Lock + 5 hatalı deneme → 30 sn kilit.
// ============================================================================

const DEFAULT_PIN = '1818';
const PIN_KEY = 'likya_ceo_pin';
const SESSION_KEY = 'likya_ceo_unlocked';

type Mode = 'locked' | 'changing' | 'newpin' | 'confirmpin';

// Terminal veri akışı satırları (döngüsel)
const TERMINAL_LINES = [
  '> ACCESS NODE: LIKYA-CEO-01 ......... BAĞLANDI',
  '> KRİPTOLOJİK ELDİVENE ................. AKTİF',
  '> KVKK SİNYAL ŞİFRESİ .................. DOĞRULANDI',
  '> OTONOM AJAN AĞI (21) ................. ÇEVRİMİÇİ',
  '> KANTİTUM ÇEKİRDEK .................... KARARLI',
  '> BİYOMETRİK KANAL ..................... HAZIR',
];

export default function SciFiLockScreen({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>('locked');
  const [entry, setEntry] = useState('');
  const [currentPin, setCurrentPin] = useState(DEFAULT_PIN);
  const [pendingNewPin, setPendingNewPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [approving, setApproving] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(PIN_KEY);
    setCurrentPin(stored && stored.length === 4 ? stored : DEFAULT_PIN);
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === '1');
    setReady(true);
  }, []);

  // Terminal veri akışı (2sn döngü)
  useEffect(() => {
    if (unlocked) return;
    const t = setInterval(() => setLineIndex((i) => (i + 1) % TERMINAL_LINES.length), 2200);
    return () => clearInterval(t);
  }, [unlocked]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const finishUnlock = () => {
    setApproving(true);
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
      setEntry('');
      setError('');
      setAttempts(0);
      setMode('locked');
      setApproving(false);
    }, 700);
  };

  const press = (d: string) => {
    if (cooldown > 0 || entry.length >= 4) return;
    setEntry((e) => e + d);
  };
  const backspace = () => setEntry((e) => e.slice(0, -1));

  useEffect(() => {
    if (entry.length !== 4) return;
    const t = setTimeout(() => {
      if (mode === 'locked') {
        if (entry === currentPin) finishUnlock();
        else {
          const a = attempts + 1;
          setAttempts(a);
          if (a >= 5) { setCooldown(30); setAttempts(0); setError('🔒 5 HATALI DENEME — 30 SN KİLİT'); }
          else setError(`❌ YANLIŞ TOKEN (${a}/5)`);
          setEntry('');
        }
      } else if (mode === 'changing') {
        if (entry === currentPin) { setMode('newpin'); setError(''); setEntry(''); }
        else { setError('❌ MEVCUT TOKEN HATALI'); setEntry(''); }
      } else if (mode === 'newpin') {
        setPendingNewPin(entry); setMode('confirmpin'); setError(''); setEntry('');
      } else if (mode === 'confirmpin') {
        if (entry === pendingNewPin) {
          localStorage.setItem(PIN_KEY, entry);
          setCurrentPin(entry);
          setError('✅ YENİ TOKEN KAYDEDİLDİ');
          setTimeout(() => { setMode('locked'); setEntry(''); setPendingNewPin(''); }, 900);
        } else { setError('❌ EŞLEŞMEDİ — TEKRAR DENEYİN'); setMode('newpin'); setEntry(''); setPendingNewPin(''); }
      }
    }, 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  if (!ready) return <div style={{ minHeight: '100vh', background: '#020617' }} />;
  if (unlocked) return <>{children}</>;

  const title = mode === 'locked' ? 'ACCESS NODE KİLİTLİ' : mode === 'changing' ? 'MEVCUT TOKEN' : mode === 'newpin' ? 'YENİ 4 HANELİ TOKEN' : 'TOKEN EŞLEŞMESİ';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(1200px 700px at 50% -10%, rgba(0,242,254,0.16), transparent 60%),
        radial-gradient(900px 500px at 85% 110%, rgba(167,139,250,0.14), transparent 60%),
        repeating-linear-gradient(0deg, rgba(0,242,254,0.05) 0 1px, transparent 1px 42px),
        repeating-linear-gradient(90deg, rgba(0,242,254,0.05) 0 1px, transparent 1px 42px),
        #020617`,
      padding: '24px', gap: '16px', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: '5%', width: '90%', height: '2px', background: 'linear-gradient(90deg, transparent, #00f2fe, transparent)', boxShadow: '0 0 20px #00f2fe', opacity: 0.7 }} />
      <div style={{ position: 'absolute', bottom: 0, left: '5%', width: '90%', height: '2px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)', boxShadow: '0 0 20px #a78bfa', opacity: 0.7 }} />

      {/* Terminal veri akışı */}
      <div style={{ position: 'absolute', top: 18, left: 18, fontSize: '9px', color: '#00f2fe', fontFamily: 'monospace', opacity: 0.85, lineHeight: 1.8 }}>
        {TERMINAL_LINES.slice(0, 4).map((l, i) => (
          <div key={i} style={{ opacity: i <= lineIndex % 4 ? 1 : 0.25 }}>{l}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 18, right: 18, fontSize: '9px', color: '#a78bfa', fontFamily: 'monospace', opacity: 0.85, lineHeight: 1.8, textAlign: 'right' }}>
        {TERMINAL_LINES.slice(4).map((l, i) => (
          <div key={i} style={{ opacity: i + 4 <= lineIndex % 6 ? 1 : 0.25 }}>{l}</div>
        ))}
      </div>

      {/* Çekirdek rozet */}
      <div style={{
        width: '92px', height: '92px', borderRadius: '50%',
        border: '2px solid #00f2fe', boxShadow: '0 0 40px rgba(0,242,254,0.5), inset 0 0 24px rgba(0,242,254,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        background: 'radial-gradient(circle, rgba(0,242,254,0.2), transparent 70%)',
      }}>
        {approving ? (
          <span style={{ fontSize: '34px', animation: 'pulse 0.5s ease-in-out infinite' }}>⛨</span>
        ) : (
          <Lock size={40} color="#00f2fe" strokeWidth={2} />
        )}
        <span style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px dashed rgba(0,242,254,0.4)', animation: 'spin 8s linear infinite' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#00f2fe', letterSpacing: '2px', textShadow: '0 0 18px rgba(0,242,254,0.6)' }}>{title}</div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
          {approving ? '⛨ GÜVENLİK JETONU ONAYLANIYOR...' : 'LIKYA-CEO // HUD ACCESS NODE'}
        </div>
      </div>

      {/* PIN noktaları */}
      <div style={{ display: 'flex', gap: '14px', minHeight: '20px', alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: i < entry.length ? '#00f2fe' : 'transparent',
            border: i < entry.length ? '2px solid #00f2fe' : '2px solid rgba(0,242,254,0.35)',
            boxShadow: i < entry.length ? '0 0 14px rgba(0,242,254,0.8)' : 'none',
            transition: 'all 0.15s ease',
          }} />
        ))}
      </div>

      {error && <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: error.includes('✅') ? '#4ade80' : error.includes('🔒') ? '#f87171' : '#fbbf24' }}>{error}</div>}
      {cooldown > 0 && <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#f87171' }}>⏳ {cooldown}s</div>}


      {/* Rakam paneli */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 78px)', gap: '12px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
          d === '' ? <div key={i} />
          : (
            <button key={i} onClick={() => (d === '⌫' ? backspace() : press(d))} disabled={d !== '⌫' && cooldown > 0}
              style={{
                height: '58px', borderRadius: '16px', cursor: 'pointer', fontSize: '20px', fontWeight: 700,
                color: '#00f2fe', background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.25)',
                fontFamily: 'monospace', textShadow: '0 0 10px rgba(0,242,254,0.5)',
              }}
              onMouseDown={(e) => (e.currentTarget.style.background = 'rgba(0,242,254,0.2)')}
              onMouseUp={(e) => (e.currentTarget.style.background = 'rgba(0,242,254,0.04)')}
            >
              {d === '⌫' ? '⌫' : d}
            </button>
          )
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Fingerprint size={12} /> BİYOMETRİK KANAL HAZIR
        </span>
        {mode === 'locked' && (
          <button onClick={() => { setMode('changing'); setEntry(''); setError(''); }} style={{ fontSize: '9px', color: '#94a3b8', background: 'none', border: '1px solid rgba(0,242,254,0.25)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <KeyRound size={11} /> TOKEN DEĞİŞTİR
          </button>
        )}
        {mode !== 'locked' && (
          <button onClick={() => { setMode('locked'); setEntry(''); setError(''); }} style={{ fontSize: '9px', color: '#94a3b8', background: 'none', border: '1px solid rgba(0,242,254,0.25)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'monospace' }}>← GERİ</button>
        )}
      </div>

      <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <ShieldCheck size={12} color="#4ade80" /> SESSION LOCK AKTİF — PENCERE KAPANINCA YENİDEN KİLİTLENİR
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

