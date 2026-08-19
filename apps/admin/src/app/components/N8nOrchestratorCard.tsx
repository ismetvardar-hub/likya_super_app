'use client';

import React, { useEffect, useState } from 'react';
import { generateN8nWorkflow, validateN8nWorkflow, n8nAutonomousGeneratorStatus, type N8nScenario } from '../lib/ops/n8nAutonomousGenerator';
import { checkN8nLiveStatus, n8nApiClientStatus } from '../lib/ops/n8nApiClient';
import { runAgenticLoop, agenticLoopEngineStatus, type AgentLoopResult } from '../lib/agents/agenticLoopEngine';

// ============================================================================
// ⚡ OTONOM n8n SENARYO MOTORU KARTI — tek tıkla akış üret + n8n'e fırlat
// 9 adımlı ajan döngüsü (Plan→Act→Verify) + mock fallback. Monitor view'da.
// ============================================================================

const SCENARIOS: { id: N8nScenario; icon: string; label: string }[] = [
  { id: 'fire-emergency', icon: '🔥', label: 'Yangın Acil (Görsel 76)' },
  { id: 'quality-conveyor', icon: '🏭', label: 'Konveyör Kalite (77)' },
  { id: 'daze-reminder', icon: '⏰', label: 'Daze Reminder 120s' },
  { id: 'master-styling', icon: '🎩', label: 'Master Üslup Filtresi' },
  { id: 'social-dm-lead', icon: '📱', label: 'Sosyal DM Lead' },
  { id: 'voice-to-task', icon: '🎤', label: 'Ses → Görev' },
  { id: 'doc-rag', icon: '📄', label: 'Sözleşme RAG' },
  { id: 'executive-digest', icon: '📊', label: 'CEO Günlük Digest' },
  { id: 'churn-recovery', icon: '🧲', label: 'Churn Kurtarma' },
];

export default function N8nOrchestratorCard() {
  const [result, setResult] = useState<AgentLoopResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);

  // Sunucu proxy üzerinden n8n canlı sağlık durumu (HTTP 200 / env kontrolü)
  useEffect(() => {
    let cancelled = false;
    void checkN8nLiveStatus().then((s) => { if (!cancelled) setLive(s.live); });
    return () => { cancelled = true; };
  }, []);

  const run = (scenario: N8nScenario) => {
    setBusy(true);
    const intent = SCENARIOS.find((s) => s.id === scenario)?.label ?? scenario;
    const r = runAgenticLoop(intent, { intent, state: { scenario, source: 'ceo-monitor' } });
    setResult(r);
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(168,85,247,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>⚡ Otonom n8n Senaryo Motoru</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{n8nAutonomousGeneratorStatus()} • {agenticLoopEngineStatus()}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: live ? '#4ade80' : '#fbbf24', background: live ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)', border: `1px solid ${live ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)'}` }}>
          {live ? '🟢 n8n CANLI' : '🟡 MOCK'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => run(s.id)} disabled={busy} style={{ fontSize: '10px', fontWeight: 800, padding: '12px 10px', borderRadius: '12px', cursor: busy ? 'wait' : 'pointer', border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.1)', color: '#f0abfc' }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {result && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#e2e8f0' }}>
          {result.steps.map((st) => (
            <div key={st.step} style={{ display: 'flex', gap: '8px', lineHeight: 1.5 }}>
              <span style={{ color: '#f0abfc', fontWeight: 800, minWidth: 90 }}>{st.step}. {st.name.toUpperCase()}</span>
              <span style={{ color: '#94a3b8' }}>{st.detail}</span>
            </div>
          ))}
          <div style={{ marginTop: '4px', fontWeight: 800, color: result.ok ? '#4ade80' : '#f87171' }}>
            {result.ok ? '✅ ' : '❌ '}{result.finalAction}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>
            {n8nApiClientStatus()} • workflow: {result.workflowJson?.name} ({result.workflowJson?.nodes.length} düğüm)
          </div>
        </div>
      )}
    </div>
  );
}
