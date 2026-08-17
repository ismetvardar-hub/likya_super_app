'use client';

import React, { useState } from 'react';
import { generateInstantApp, type InstantApp } from '../lib/ai/base44AppEngine';
import { sanitizeInput, shieldScore, zeroTrustStatus } from '../lib/security/zeroTrustShield';

// ============================================================================
// 🎛️ SİBER GÜVENLİK & UYGULAMA ÜRETİCİ HUD (koyu neon)
// Sekme 1: Instant App Generator (Base44/Replit) • Sekme 2: Security Shield
// Kırılmasız: bağımsız bileşen; tüm kontroller sessiz/fail-safe.
// ============================================================================

type TabId = 'builder' | 'shield';

export default function SecurityAppBuilderCard() {
  const [tab, setTab] = useState<TabId>('builder');
  const [prompt, setPrompt] = useState('');
  const [app, setApp] = useState<InstantApp | null>(null);
  const [shield, setShield] = useState(() => shieldScore());
  const [scanText, setScanText] = useState('');
  const [scanResult, setScanResult] = useState<{ clean: string; flagged: string[]; action: string } | null>(null);

  const buildApp = () => {
    if (!prompt.trim()) return;
    const generated = generateInstantApp(prompt);
    setApp(generated);
  };

  const runScan = () => {
    if (!scanText.trim()) return;
    const res = sanitizeInput(scanText);
    setScanResult({ clean: res.clean, flagged: res.verdict.flagged, action: res.verdict.action });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(239,68,68,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🛡️ Güvenlik & Uygulama Motoru</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{zeroTrustStatus()}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, color: shield.score >= 90 ? '#4ade80' : '#fbbf24', padding: '3px 9px', borderRadius: '999px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)' }}>
          KALKAN SKORU {shield.score}/100
        </span>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => setTab('builder')} style={{ padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, border: tab === 'builder' ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)', background: tab === 'builder' ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)', color: tab === 'builder' ? '#c4b5fd' : '#94a3b8' }}>
          🚀 Instant App Generator
        </button>
        <button onClick={() => setTab('shield')} style={{ padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, border: tab === 'shield' ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.12)', background: tab === 'shield' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)', color: tab === 'shield' ? '#fca5a5' : '#94a3b8' }}>
          🛡️ Shield Live Monitor
        </button>
      </div>

      {/* Sekme 1: App Builder */}
      {tab === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bana padel rezervasyon uygulaması kodla…"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') buildApp(); }}
            />
            <button onClick={buildApp} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>
              Üret
            </button>
          </div>

          {app && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#c4b5fd' }}>🚀 {app.title} <span style={{ fontSize: '9px', color: '#64748b' }}>({app.kind})</span></div>

              {/* JSON şema */}
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>SCHEMA JSON</div>
              <pre style={{ margin: 0, fontSize: '10px', color: '#a5f3fc', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({ schema: app.schema, auth: app.auth }, null, 1).slice(0, 600)}
              </pre>

              {/* Auth kuralları */}
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>AUTH RULES</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {app.auth.roles.map((r) => (
                  <span key={r} style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '999px', color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>{r}</span>
                ))}
                <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '999px', color: '#67e8f9', background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)' }}>{app.auth.permission}</span>
              </div>

              {/* React UI kodu */}
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>REACT UI (sandbox çalıştırılabilir)</div>
              <pre style={{ margin: 0, fontSize: '9px', color: '#a5f3fc', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '8px', maxHeight: '120px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {app.uiCode.slice(0, 700)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Sekme 2: Shield Live Monitor */}
      {tab === 'shield' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={scanText}
              onChange={(e) => setScanText(e.target.value)}
              placeholder="Tarama metni: 'SELECT * FROM users; <script>…'"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') runScan(); }}
            />
            <button onClick={runScan} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f87171,#dc2626)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>
              Tara
            </button>
          </div>

          {scanResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${scanResult.action === 'block' ? 'rgba(239,68,68,0.4)' : scanResult.action === 'sanitize' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: scanResult.action === 'block' ? '#f87171' : scanResult.action === 'sanitize' ? '#fbbf24' : '#4ade80' }}>
                {scanResult.action === 'block' ? '⛔ BLOKLANDI (anahtar sızıntısı)' : scanResult.action === 'sanitize' ? `⚠️ TEMİZLENDİ (${scanResult.flagged.length} kalıp)` : '✅ TEMİZ — meşru girdi'}
              </div>
              {scanResult.flagged.length > 0 && (
                <div style={{ fontSize: '10px', color: '#cbd5e1' }}>Tespit: {scanResult.flagged.join(', ')}</div>
              )}
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Sanitize edilmiş: <span style={{ color: '#e2e8f0' }}>{scanResult.clean.slice(0, 120)}</span></div>
            </div>
          )}

          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            🛡️ 30 katman: SQLi sanitize • XSS payload temizliği • API anahtar sızıntı engeli • session hijacking flag • CSRF token kontrolü — TÜM kontroller sessiz/fail-safe (meşru trafik asla engellenmez).
          </div>
        </div>
      )}
    </div>
  );
}

