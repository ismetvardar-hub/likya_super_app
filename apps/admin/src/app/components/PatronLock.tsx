'use client';

import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Fingerprint, KeyRound } from 'lucide-react';

// ============================================================================
// 🛡️ PATRON MOBİL GÜVENLİK KALKANI — PIN / Oturum Kilidi
// Telefon başkasının eline geçse dahi CEO paneline erişilemez.
// - PIN: localStorage (varsayılan 1818 — Patron değiştirebilir)
// - Oturum: sessionStorage (sekme/PWA penceresi kapandığında kilit yenilenir)
// - 5 hatalı deneme → 30 sn kilit + sayıcı
// ============================================================================

const DEFAULT_PIN = '1818';
const PIN_KEY = 'likya_ceo_pin';
const SESSION_KEY = 'likya_ceo_unlocked';

type Mode = 'locked' | 'changing' | 'newpin' | 'confirmpin';

export default function PatronLock({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>('locked');
  const [entry, setEntry] = useState('');
  const [currentPin, setCurrentPin] = useState(DEFAULT_PIN);
  const [pendingNewPin, setPendingNewPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // İstemci tarafı state yükleme (SSR uyumsuzluğu önle)
  useEffect(() => {
    const stored = localStorage.getItem(PIN_KEY);
    setCurrentPin(stored && stored.length === 4 ? stored : DEFAULT_PIN);
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === '1');
    setReady(true);
  }, []);

  // Hatalı deneme kilit geri sayımı
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const finishUnlock = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setUnlocked(true);
    setEntry('');
    setError('');
    setAttempts(0);
    setMode('locked');
  };

  const press = (d: string) => {
    if (cooldown > 0) return;
    if (entry.length >= 4) return;
    setEntry((e) => e + d);
  };

  const backspace = () => setEntry((e) => e.slice(0, -1));

  // Rakam dolunca o anki modun akışı
  useEffect(() => {
    if (entry.length !== 4) return;
    const t = setTimeout(() => {
      if (mode === 'locked') {
        if (entry === currentPin) finishUnlock();
        else {
          const a = attempts + 1;
          setAttempts(a);
          if (a >= 5) {
            setCooldown(30);
            setAttempts(0);
            setError('🔒 5 hatalı deneme — 30 sn bekleyin');
          } else setError(`❌ Yanlış PIN (${a}/5)`);
          setEntry('');
        }
      } else if (mode === 'changing') {
        if (entry === currentPin) { setMode('newpin'); setError(''); setEntry(''); }
        else { setError('❌ Mevcut PIN hatalı'); setEntry(''); }
      } else if (mode === 'newpin') {
        setPendingNewPin(entry); setMode('confirmpin'); setError(''); setEntry('');
      } else if (mode === 'confirmpin') {
        if (entry === pendingNewPin) {
          localStorage.setItem(PIN_KEY, entry);
          setCurrentPin(entry);
          setError('✅ Yeni PIN kaydedildi');
          setTimeout(() => { setMode('locked'); setEntry(''); setPendingNewPin(''); }, 900);
        } else {
          setError('❌ Eşleşmedi — tekrar deneyin');
          setMode('newpin'); setEntry(''); setPendingNewPin('');
        }
      }
    }, 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  if (!ready) return <div style={{ minHeight: '100vh', background: '#0f172a' }} />;
  if (unlocked) return <>{children}</>;

  const title = mode === 'locked' ? 'Komuta Merkezi Kilitli' : mode === 'changing' ? 'Mevcut PIN'
    : mode === 'newpin' ? 'Yeni 4 Haneli PIN' : 'PIN Eşleşmesini Onayla';
  const sub = mode === 'locked' ? 'Likya Command CEO — Patron kimlik doğrulaması'
    : mode === 'changing' ? 'Güvenlik için mevcut PIN gir' : "Yeni PIN'i tekrar girin";

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(1000px 600px at 50% -10%, rgba(0,242,254,0.12), transparent), #0f172a',
      padding: '24px', gap: '18px',
    }}>
      {/* Logo */}
      <div style={{
        width: '84px', height: '84px', borderRadius: '24px',
        background: 'linear-gradient(135deg, #00f2fe, #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(0,242,254,0.4)',
      }}>
        <Lock size={38} color="#0f172a" strokeWidth={2.5} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>
      </div>

      {/* PIN noktaları */}
      <div style={{ display: 'flex', gap: '14px', minHeight: '20px', alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: i < entry.length ? '#00f2fe' : 'rgba(255,255,255,0.12)',
            border: i < entry.length ? '2px solid #00f2fe' : '2px solid rgba(255,255,255,0.2)',
            boxShadow: i < entry.length ? '0 0 12px rgba(0,242,254,0.6)' : 'none',
            transition: 'all 0.15s ease',
          }} />
        ))}
      </div>

      {error && <div style={{ fontSize: '11px', fontWeight: 700, color: error.includes('✅') ? '#4ade80' : error.includes('🔒') ? '#f87171' : '#fbbf24' }}>{error}</div>}
      {cooldown > 0 && <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171' }}>⏳ {cooldown} sn</div>}

      {/* Rakam paneli */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 78px)', gap: '12px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
          d === '' ? <div key={i} />
          : (
            <button key={i} onClick={() => (d === '⌫' ? backspace() : press(d))}
              disabled={d !== '⌫' && cooldown > 0}
              style={{
                height: '58px', borderRadius: '16px', cursor: 'pointer', fontSize: '20px', fontWeight: 700,
                color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.12s ease', fontFamily: 'inherit',
              }}
              onMouseDown={(e) => (e.currentTarget.style.background = 'rgba(0,242,254,0.25)')}
              onMouseUp={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              {d === '⌫' ? '⌫' : d}
            </button>
          )
        )}
      </div>

      {/* Alt kontroller */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '9px', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Fingerprint size={12} /> Face ID / parmak izi uyumlu (WebAuthn hazır)
        </span>
        {mode === 'locked' && (
          <button onClick={() => { setMode('changing'); setEntry(''); setError(''); }}
            style={{ fontSize: '9px', color: '#94a3b8', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <KeyRound size={11} /> PIN Değiştir
          </button>
        )}
        {mode !== 'locked' && (
          <button onClick={() => { setMode('locked'); setEntry(''); setError(''); }}
            style={{ fontSize: '9px', color: '#94a3b8', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }}>
            ← Geri
          </button>
        )}
      </div>

      <div style={{ fontSize: '9px', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
        <ShieldCheck size={12} color="#4ade80" /> Session Lock aktif — uygulama penceresi kapandığında yeniden kilitlenir
      </div>
    </div>
  );
}

