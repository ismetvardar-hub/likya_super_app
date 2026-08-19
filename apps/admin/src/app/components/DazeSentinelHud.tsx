'use client';

import React, { useState } from 'react';
import { diagnose, autoRemediate, holmesStatus, type RcaResult } from '../lib/ops/holmesDiagnosticEngine';
import { runStrixAudit, strixStatus } from '../lib/security/strixSecurityAudit';
import SentinelVisionGrid from './SentinelVisionGrid';

// ============================================================================
// 📊 DAZE SENTINEL HUD — AI Olay İnceleme + Tek Tıkla Auto-Remediate
// MonitoringPanel (monitor view) ile birlikte render edilir (kırılmasız).
// Holmes RCA + Strix anahtar tarayıcı entegrasyonu. Deterministik.
// ============================================================================

const SAMPLE_LOGS = [
  'Error: POST /api/v1/ceo/execute returned 500 Internal Server Error',
  'Request timed out after 60000ms while calling Gemini',
  'Supabase connection failed: connect ECONNREFUSED db.likya.supabase.co',
  'Unauthorized: invalid API key (401)',
];

export default function DazeSentinelHud() {
  const [logInput, setLogInput] = useState('');
  const [rca, setRca] = useState<RcaResult | null>(null);
  const [remedied, setRemedied] = useState<{ ok: boolean; action: string } | null>(null);

  const audit = runStrixAudit([
    { name: 'src/app/layout.tsx', content: `import './globals.css';\nconst NEXT_PUBLIC_GEMINI_API_KEY = 'AIzaSyFAKE1234567890FAKE1234567890FAKE';\nexport const x = 1;` },
    { name: 'src/app/api/route.ts', content: 'export const KEY = "sk-fake1234567890abcdef1234567890abcdef";' },
    { name: 'src/app/page.tsx', content: 'export default function Page(){return <div/>;}' },
  ]);

  const runDiagnose = (raw: string) => {
    if (!raw.trim()) return;
    setRca(diagnose(raw));
    setRemedied(null);
  };

  const remediate = () => {
    if (rca) setRemedied(autoRemediate(rca));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(239,68,68,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📊 Daze Sentinel — AI Olay İnceleme</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{holmesStatus()} · {strixStatus()}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, color: audit.clean ? '#4ade80' : '#f87171', padding: '3px 9px', borderRadius: '999px', background: audit.clean ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${audit.clean ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}` }}>
          STRIX SKOR {audit.score}/100
        </span>
      </div>

      {/* AI Olay İnceleme */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
          placeholder="Log/hata metni yapıştır (500, timeout, db fail…)"
          style={{ flex: 1, minWidth: '200px', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
          onKeyDown={(e) => { if (e.key === 'Enter') runDiagnose(logInput); }}
        />
        <button onClick={() => runDiagnose(logInput)} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f87171,#dc2626)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>🔍 İncele</button>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {SAMPLE_LOGS.map((s) => (
          <button key={s} onClick={() => { setLogInput(s); runDiagnose(s); }} style={{ padding: '4px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>
            {s.slice(0, 34)}…
          </button>
        ))}
      </div>

      {/* RCA sonucu */}
      {rca && (
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${rca.severity === 'kritik' ? 'rgba(239,68,68,0.4)' : rca.severity === 'yuksek' ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.3)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>🔍 {rca.incident.type.toUpperCase()}</span>
            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 9px', borderRadius: '999px', color: rca.severity === 'kritik' ? '#f87171' : rca.severity === 'yuksek' ? '#fbbf24' : '#60a5fa', background: 'rgba(255,255,255,0.05)' }}>
              {rca.severity} · güven %{Math.round(rca.confidence * 100)}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>
            <b style={{ color: '#f87171' }}>Kök neden:</b> {rca.rootCause}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
            <b style={{ color: '#4ade80' }}>Çözüm:</b> {rca.fix}
          </div>
          <button
            onClick={remediate}
            style={{ marginTop: '10px', padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: rca.autoRemediable ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.08)', color: rca.autoRemediable ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: '12px' }}
          >
            {rca.autoRemediable ? '⚡ Tek Tıkla Auto-Remediate' : '⛔ İnsan Onayı Gerekli'}
          </button>
          {remedied && (
            <div style={{ fontSize: '11px', color: remedied.ok ? '#4ade80' : '#fbbf24', marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
              {remedied.action}
            </div>
          )}
        </div>
      )}

      {/* Strix tarayıcı özeti */}
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>STRIX ANAHTAR TARAMASI ({audit.scannedFiles} dosya)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {audit.findings.length === 0 && <div style={{ fontSize: '11px', color: '#4ade80' }}>✅ Hassas anahtar bulunamadı</div>}
        {audit.findings.map((f, i) => (
          <div key={i} style={{ fontSize: '11px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${f.severity === 'kritik' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            <b style={{ color: f.severity === 'kritik' ? '#f87171' : '#fbbf24' }}>{f.category}</b> · {f.match} · {f.location}
            <div style={{ color: '#94a3b8', marginTop: '3px' }}>💡 {f.recommendation}</div>
          </div>
        ))}
      </div>

      {/* 👁️ Bilgisayarlı Görü / İSG Denetim Izgarası (Sentinel Vision) */}
      <SentinelVisionGrid />
    </div>
  );
}

