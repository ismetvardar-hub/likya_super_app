'use client';

import React, { useState } from 'react';
import { runResearch, researchStatus } from '../lib/ai/multiAgentResearch';
import { TEAM_STATS, planTraining, generateMatchReport, sportsManagerStatus, type SportBranch } from '../lib/sports/claudeSportsManager';
import { runSafetyAudit, safetyAuditStatus } from '../lib/simulators/facilitySafetyAudit';

// ============================================================================
// 🎛️ RESEARCH & SPORTS HUD (koyu neon)
// Sekme 1: Multi-Agent Research • 2: Claude Sports Manager • 3: Safety Checklist
// Kırılmasız: bağımsız bileşen; deterministik motorlar + nezaket filtresi.
// ============================================================================

type TabId = 'research' | 'sports' | 'safety';

export default function MultiAgentSportsCard() {
  const [tab, setTab] = useState<TabId>('research');
  const [researchTopic, setResearchTopic] = useState('');
  const [report, setReport] = useState<Awaited<ReturnType<typeof runResearch>> | null>(null);
  const [branch, setBranch] = useState<SportBranch>('padel');
  const [match, setMatch] = useState(() => generateMatchReport('padel', 'Rakip Kulüp'));

  const audit = runSafetyAudit();

  const startResearch = async () => {
    if (!researchTopic.trim()) return;
    const r = await runResearch({ topic: researchTopic, depth: 'standart' });
    setReport(r);
  };

  const switchBranch = (b: SportBranch) => {
    setBranch(b);
    setMatch(generateMatchReport(b, 'Rakip Kulüp'));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(34,197,94,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📊 Araştırma & Spor Direktörlüğü</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{researchStatus()} · {sportsManagerStatus()} · {safetyAuditStatus()}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['research', '📊 Multi-Agent Research'], ['sports', '🎾 Sports Manager'], ['safety', '🛡️ Safety Checklist']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
              border: tab === id ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              background: tab === id ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === id ? '#4ade80' : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sekme 1: Research */}
      {tab === 'research' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              placeholder="Araştırma konusu: 'padel pazarı 2026'"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') startResearch(); }}
            />
            <button onClick={startResearch} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e,#059669)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>Araştır</button>
          </div>
          {report && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {report.agents.map((a) => (
                <div key={a.agent} style={{ fontSize: '11px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <b style={{ color: '#4ade80' }}>{a.title}</b> · {a.summary}
                  <span style={{ color: '#64748b' }}> (güven %{Math.round(a.confidence * 100)})</span>
                </div>
              ))}
              <div style={{ fontSize: '11px', color: '#cbd5e1', padding: '8px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {report.conclusion}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sekme 2: Sports Manager */}
      {tab === 'sports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {TEAM_STATS.map((t) => (
              <button
                key={t.branch}
                onClick={() => switchBranch(t.branch)}
                style={{
                  padding: '5px 11px', borderRadius: '999px', cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                  border: branch === t.branch ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
                  background: branch === t.branch ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                  color: branch === t.branch ? '#4ade80' : '#94a3b8',
                }}
              >
                {t.branch}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>ÜYE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>{TEAM_STATS.find((t) => t.branch === branch)?.members}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>ORT. SKOR</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#00f2fe' }}>{TEAM_STATS.find((t) => t.branch === branch)?.avgScore}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>SIRADAKİ MAÇ</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa' }}>{TEAM_STATS.find((t) => t.branch === branch)?.nextMatch}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            🏋️ Haftalık plan: {planTraining(branch).sessions.map((s) => `${s.day}: ${s.focus}`).join(' · ')}
          </div>
          <div style={{ fontSize: '11px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            🏟️ {match.opponent} vs — {match.score} · <b>{match.verdict}</b>
          </div>
        </div>
      )}


      {/* Sekme 3: Safety */}
      {tab === 'safety' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.25)', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>GEÇİŞ ORANI</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>%{audit.passRate}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.25)', flex: 1, minWidth: '100px' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>KRİTİK</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f87171' }}>{audit.criticalCount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {audit.items.map((i) => (
              <div key={i.id} style={{ fontSize: '11px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${i.status === 'uygun' ? 'rgba(34,197,94,0.2)' : i.status === 'kritik' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                <b style={{ color: i.status === 'uygun' ? '#4ade80' : i.status === 'kritik' ? '#f87171' : '#fbbf24' }}>{i.name}</b> · {i.zone} · {i.standard} · skor {i.checkScore}/100 · <span style={{ color: '#64748b' }}>{i.status}</span>
              </div>
            ))}
          </div>
          {audit.sentinelTickets.length > 0 && (
            <div style={{ fontSize: '10px', color: '#cbd5e1', padding: '8px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {audit.sentinelTickets.map((t) => <div key={t}>{t}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

