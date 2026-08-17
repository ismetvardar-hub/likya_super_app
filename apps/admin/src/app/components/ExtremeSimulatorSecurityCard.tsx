'use client';

import React, { useState } from 'react';
import { SIMULATOR_UNITS, simulateSession, simulatorsStatus, type SimulatorKind } from '../lib/simulators/extremeSportsSimulator';
import { generateInstantApp, type InstantApp } from '../lib/ai/base44AppEngine';
import { sanitizeInput, shieldScore } from '../lib/security/zeroTrustShield';

// ============================================================================
// 🎛️ SIMULATOR & SECURITY HUD (koyu neon)
// Sekme 1: Extreme Sports & Dry-Ski • Sekme 2: Instant App Generator • 3: Shield
// Kırılmasız: bağımsız bileşen; deterministik simülasyon.
// ============================================================================

type TabId = 'sim' | 'builder' | 'shield';

export default function ExtremeSimulatorSecurityCard() {
  const [tab, setTab] = useState<TabId>('sim');
  const [sessions, setSessions] = useState<ReturnType<typeof simulateSession>[]>([]);
  const [builderPrompt, setBuilderPrompt] = useState('');
  const [app, setApp] = useState<InstantApp | null>(null);
  const [shield, setShield] = useState(() => shieldScore());
  const [scan, setScan] = useState('');
  const [scanResult, setScanResult] = useState<{ clean: string; flagged: string[]; action: string } | null>(null);

  const runSim = (kind: SimulatorKind) => {
    setSessions((s) => [simulateSession(kind, 'Demo Sporcu', 30), ...s].slice(0, 4));
  };

  const buildApp = () => {
    if (!builderPrompt.trim()) return;
    setApp(generateInstantApp(builderPrompt));
  };

  const runScan = () => {
    if (!scan.trim()) return;
    const r = sanitizeInput(scan);
    setScanResult({ clean: r.clean, flagged: r.verdict.flagged, action: r.verdict.action });
  };

  const UNIT_ICON: Record<SimulatorKind, string> = { 'dry-ski': '⛷️', rowing: '🚣', 'wave-pool': '🌊', 'wind-tunnel': '🌬️' };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(0,242,254,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🎿 Ekstrem Spor & Güvenlik Motoru</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{simulatorsStatus()}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, color: '#4ade80', padding: '3px 9px', borderRadius: '999px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)' }}>
          KALKAN {shield.score}/100
        </span>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['sim', '🎿 Extreme Sports'], ['builder', '🚀 App Builder'], ['shield', '🛡️ Security']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
              border: tab === id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)',
              background: tab === id ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === id ? '#67e8f9' : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sekme 1: Simülatörler */}
      {tab === 'sim' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {SIMULATOR_UNITS.map((u) => (
              <div key={u.id} style={{ padding: '11px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${u.equipmentStatus === 'hazir' ? 'rgba(34,197,94,0.3)' : u.equipmentStatus === 'bakim' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{UNIT_ICON[u.kind]} {u.name}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', color: u.equipmentStatus === 'hazir' ? '#4ade80' : u.equipmentStatus === 'bakim' ? '#fbbf24' : '#f87171', background: 'rgba(255,255,255,0.04)' }}>
                    {u.equipmentStatus}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', margin: '4px 0' }}>Kapasite {u.capacity} · {u.hourlyRate}₺/saat · güvenlik {u.safetyScore}/100</div>
                <button onClick={() => runSim(u.kind)} style={{ width: '100%', padding: '7px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '11px' }}>
                  ▶ Seans Başlat
                </button>
              </div>
            ))}
          </div>

          {sessions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>SON SEANSLAR</div>
              {sessions.map((s, i) => (
                <div key={`${s.id}-${i}`} style={{ fontSize: '11px', color: '#cbd5e1', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {UNIT_ICON[s.kind]} {s.athlete} — {s.durationMin} dk · <b style={{ color: s.performanceScore >= 85 ? '#4ade80' : '#fbbf24' }}>{s.performanceScore}/100</b>
                  {' '}· {Object.entries(s.metrics).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sekme 2: App Builder */}
      {tab === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={builderPrompt}
              onChange={(e) => setBuilderPrompt(e.target.value)}
              placeholder="Bana kayak pisti rezervasyon uygulaması kodla…"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') buildApp(); }}
            />
            <button onClick={buildApp} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>Üret</button>
          </div>
          {app && (
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#c4b5fd' }}>🚀 {app.title} <span style={{ fontSize: '9px', color: '#64748b' }}>({app.kind})</span></div>
              <pre style={{ margin: '8px 0 0', fontSize: '9px', color: '#a5f3fc', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '8px', maxHeight: '110px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({ schema: app.schema, auth: app.auth }, null, 1).slice(0, 500)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Sekme 3: Security */}
      {tab === 'shield' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              placeholder="Tarama: <script>… UNION SELECT…"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') runScan(); }}
            />
            <button onClick={runScan} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f87171,#dc2626)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>Tara</button>
          </div>
          {scanResult && (
            <div style={{ fontSize: '11px', color: scanResult.action === 'block' ? '#f87171' : scanResult.action === 'sanitize' ? '#fbbf24' : '#4ade80', padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {scanResult.action === 'block' ? '⛔ Anahtar sızıntısı engellendi' : scanResult.action === 'sanitize' ? `⚠️ ${scanResult.flagged.length} kalıp temizlendi` : '✅ Temiz — meşru girdi'}
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            🛡️ OWASP Top 10: SQLi sanitize · XSS payload filtresi · CSRF token · API key koruma — sessiz/fail-safe.
          </div>
        </div>
      )}
    </div>
  );
}

