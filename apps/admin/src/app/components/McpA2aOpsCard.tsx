'use client';

import React, { useState } from 'react';
import { MCP_TOOLS, A2A_AGENTS, routeHybrid, hybridOrchestratorStatus } from '../lib/ai/mcpA2aOrchestrator';
import { taskCounts, AUTO_TASKS, automatedTasksStatus } from '../lib/ops/automatedTasks546';
import { rankByAeo, buildContentPlan, seoPipelineStatus } from '../lib/marketing/seoKeywordPipeline';

// ============================================================================
// 🎛️ ORCHESTRATION & OPS HUD (koyu neon)
// Sekme 1: MCP vs A2A Protocol Matrix • 2: 546 Automated Tasks • 3: SEO/AEO
// Kırılmasız: bağımsız bileşen; deterministik motorlar + nezaket filtresi.
// ============================================================================

type TabId = 'protocol' | 'tasks' | 'seo';

export default function McpA2aOpsCard() {
  const [tab, setTab] = useState<TabId>('protocol');
  const [taskInput, setTaskInput] = useState('');
  const [routed, setRouted] = useState<ReturnType<typeof routeHybrid> | null>(null);
  const [plan, setPlan] = useState(() => buildContentPlan(KEYWORDS_TOP()));

  const counts = taskCounts();
  const topKeywords = rankByAeo();

  function KEYWORDS_TOP(): string {
    return rankByAeo()[0]?.keyword ?? 'padel kort kiralama';
  }

  const routeTask = () => {
    if (!taskInput.trim()) return;
    setRouted(routeHybrid(taskInput));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(0,242,254,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🔌 Orkestrasyon & Ops Motoru</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{hybridOrchestratorStatus()} · {automatedTasksStatus()} · {seoPipelineStatus()}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['protocol', '🔌 MCP vs A2A'], ['tasks', '⚙️ 546 Tasks'], ['seo', '🚀 SEO/AEO']] as [TabId, string][]).map(([id, label]) => (
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

      {/* Sekme 1: MCP vs A2A */}
      {tab === 'protocol' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.25)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#67e8f9' }}>🔌 MCP ARAÇLARI</div>
              {MCP_TOOLS.map((t) => (
                <div key={t.id} style={{ fontSize: '10px', color: '#cbd5e1', padding: '3px 0' }}>
                  {t.name} <span style={{ color: t.status === 'bagli' ? '#4ade80' : '#fbbf24' }}>({t.status})</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#c4b5fd' }}>🤝 A2A AJANLARI</div>
              {A2A_AGENTS.map((a) => (
                <div key={a.id} style={{ fontSize: '10px', color: '#cbd5e1', padding: '3px 0' }}>
                  {a.name} · {a.specialty} <span style={{ color: a.status === 'hazir' ? '#4ade80' : '#fbbf24' }}>({a.status})</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Görev: 'veritabanına kaydet' veya 'finans ajanına delege et'"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '11px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') routeTask(); }}
            />
            <button onClick={routeTask} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '12px' }}>Yönlendir</button>
          </div>
          {routed && (
            <div style={{ fontSize: '11px', color: '#e2e8f0', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <b style={{ color: routed.protocol === 'mcp' ? '#67e8f9' : '#c4b5fd' }}>{routed.protocol === 'mcp' ? '🔌' : '🤝'}</b> {routed.result}
            </div>
          )}
        </div>
      )}

      {/* Sekme 2: 546 Tasks */}
      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '6px' }}>
            {Object.entries(counts).map(([domain, count]) => (
              <div key={domain} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f2fe' }}>{count}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{domain}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>
            Toplam: <b style={{ color: '#67e8f9' }}>{AUTO_TASKS.length}</b> görev · {AUTO_TASKS.filter((t) => t.enabled).length} aktif — 5 süreç (operasyon/finans/İK/satış/destek) × 10 şablon × 10 varyant + 46 özel
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            ⚙️ Örnek görevler: {AUTO_TASKS.slice(0, 4).map((t) => t.title).join(' · ')}…
          </div>
        </div>
      )}

      {/* Sekme 3: SEO/AEO */}
      {tab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>AEO SIRALAMASI (AI bot görünürlük)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {topKeywords.slice(0, 5).map((k) => (
              <div key={k.keyword} style={{ fontSize: '11px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <b style={{ color: '#e2e8f0' }}>{k.keyword}</b> · hacim {k.searchVolume.toLocaleString('tr-TR')} · <span style={{ color: k.aeoScore >= 70 ? '#4ade80' : '#fbbf24' }}>AEO {k.aeoScore}</span> · AI atıf {k.aiCitations}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>İÇERİK PLANI</div>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(167,139,250,0.25)', fontSize: '11px', color: '#cbd5e1' }}>
            <b style={{ color: '#c4b5fd' }}>{plan.title}</b>
            <div style={{ marginTop: '6px' }}>{plan.sections.map((s) => `📍 ${s}`).join(' · ')}</div>
            <div style={{ color: '#67e8f9', marginTop: '6px' }}>{plan.structuredData}</div>
          </div>
        </div>
      )}
    </div>
  );
}

