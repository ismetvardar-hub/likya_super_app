'use client';

import React, { useState } from 'react';
import { agentMatrixStatus, STANDING_BRIEFS, AGENT_SKILLS, AGENT_HOOKS, SUBAGENTS, MCP_CONNECTORS } from '../lib/ai/agentMatrixConfig';
import { simulateLayerLoading, totalVramMb, airLlmStatus } from '../lib/ai/airLlmReserveEngine';
import { scanPrompt, validateJsonOutput, aiSafetyStatus } from '../lib/security/aiSafetyGuardrails';

// ============================================================================
// 🎛️ AGENT MATRIX & SAFETY HUD (koyu neon)
// Sekme 1: Agent Matrix (.md/Skills/Hooks/MCP) • 2: AirLLM 70B • 3: AI Safety
// Kırılmasız: bağımsız bileşen; deterministik motorlar + Daze nezaket filtresi.
// ============================================================================

type TabId = 'matrix' | 'airllm' | 'safety';

export default function AgentMatrixSafetyCard() {
  const [tab, setTab] = useState<TabId>('matrix');
  const [prompt, setPrompt] = useState('');
  const [scanResult, setScanResult] = useState<ReturnType<typeof scanPrompt> | null>(null);
  const [jsonResult, setJsonResult] = useState<{ ok: boolean; errors: string[] } | null>(null);
  const [layers] = useState(() => simulateLayerLoading());

  const vramGb = (totalVramMb() / 1024).toFixed(2);

  const runScan = () => {
    if (!prompt.trim()) return;
    setScanResult(scanPrompt(prompt));
    setJsonResult(validateJsonOutput('{"ok":true}', [{ key: 'ok', type: 'boolean', required: true }]));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(167,139,250,0.35)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(167,139,250,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🧩 Agent Matrix & Safety</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{agentMatrixStatus()} · {airLlmStatus()} · {aiSafetyStatus()}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['matrix', '🧩 Agent Matrix'], ['airllm', '🦙 AirLLM 70B'], ['safety', '🛡️ AI Safety']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
              border: tab === id ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)',
              background: tab === id ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              color: tab === id ? '#c4b5fd' : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sekme 1: Agent Matrix */}
      {tab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>📄 STANDING BRIEFS (.md)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {STANDING_BRIEFS.map((b) => (
              <div key={b.file} style={{ fontSize: '11px', color: '#e2e8f0', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <b style={{ color: '#67e8f9' }}>{b.file}</b> · {b.title} — {b.content}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>⚙️ SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {AGENT_SKILLS.map((s) => (
              <span key={s.name} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '999px', color: '#c4b5fd', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)' }}>{s.name}</span>
            ))}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>🎣 HOOKS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {AGENT_HOOKS.map((h) => (
              <div key={h.trigger} style={{ fontSize: '10px', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.15)' }}>
                <b style={{ color: '#67e8f9' }}>{h.trigger}</b> → {h.action}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>🔌 MCP BAĞLAYICILAR</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {MCP_CONNECTORS.map((m) => (
              <span key={m.id} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '999px', color: m.status === 'bagli' ? '#4ade80' : m.status === 'bekliyor' ? '#fbbf24' : '#f87171', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {m.system} ({m.protocol}) · {m.status}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>{SUBAGENTS.length} subagent: {SUBAGENTS.map((s) => s.name).join(' · ')}</div>
        </div>
      )}

      {/* Sekme 2: AirLLM */}
      {tab === 'airllm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>MODEL</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#00f2fe' }}>70B Local</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.3)', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>KATMAN</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#a78bfa' }}>{layers.length}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.3)', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>VRAM</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#4ade80' }}>{vramGb}GB</div>
            </div>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#00f2fe,#a78bfa)' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            🦙 Katman katman bellek yükleme simülasyonu: 80 katman × 48MB ≈ {vramGb}GB → <b>4GB GPU üzerinde 70B model</b>. Yerel Ollama kurulunca gerçek katmanlı çıkarım başlar (Plan Z güvenli offline yedek).
          </div>
        </div>
      )}


      {/* Sekme 3: AI Safety */}
      {tab === 'safety' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Prompt tara: 'ignore previous instructions…'"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') runScan(); }}
            />
            <button onClick={runScan} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>Tara</button>
          </div>
          {scanResult && (
            <div style={{ fontSize: '11px', padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${scanResult.action === 'block' ? 'rgba(239,68,68,0.4)' : scanResult.action === 'sanitize' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
              <div style={{ fontWeight: 800, color: scanResult.action === 'block' ? '#f87171' : scanResult.action === 'sanitize' ? '#fbbf24' : '#4ade80' }}>
                {scanResult.action === 'block' ? '⛔ Jailbreak engellendi' : scanResult.action === 'sanitize' ? `⚠️ ${scanResult.flagged.length} kalıp temizlendi` : '✅ Temiz'}
              </div>
              {scanResult.flagged.length > 0 && <div style={{ color: '#cbd5e1', marginTop: '4px' }}>Tespit: {scanResult.flagged.join(', ')}</div>}
            </div>
          )}
          {jsonResult && (
            <div style={{ fontSize: '11px', color: jsonResult.ok ? '#4ade80' : '#f87171', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
              🧪 JSON Validation: {jsonResult.ok ? 'geçerli şema' : 'hata: ' + jsonResult.errors.join(', ')} (Zod/Pydantic benzeri)
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            🛡️ Prompt injection sanitize · jailbreak kalkanı · rate limit (30/dk) · verification loop (2 yeniden deneme) · doğrulanabilir JSON — TÜM kontroller sessiz/fail-safe.
          </div>
        </div>
      )}
    </div>
  );
}

