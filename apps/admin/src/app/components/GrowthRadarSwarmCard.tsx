'use client';

import React, { useState } from 'react';
import { runB2bRadarCampaign, gropectorB2bRadarStatus, type B2bPitch } from '../lib/ops/gropectorB2BRadar';
import { orchestrateSwarm, cavemanCompressPrompt, swarmOrchestratorStatus, type SwarmTask } from '../lib/ai/swarmOrchestratorEngine';

// ============================================================================
// 🗺️ GROPECTOR B2B BÜYÜME RADARI + SWARM AI TELEMETRİSİ
// CEO Komuta Merkezine bağlı. Harita/Gemini API yoksa mock-first. Plan Z.
// ============================================================================

export default function GrowthRadarSwarmCard() {
  const [pitches, setPitches] = useState<B2bPitch[] | null>(null);
  const [campaignRef, setCampaignRef] = useState('');
  const [mode, setMode] = useState('mock');
  const [compressed, setCompressed] = useState(() => cavemanCompressPrompt('Lütfen bu haftaki satış verilerini analiz ederek detaylı bir özet çıkar'));

  const task: SwarmTask = { id: 'swarm-1', title: 'Günlük ekosistem taraması', microAgents: ['chef', 'sentinel', 'market-maker', 'analytics'], parallel: true, complexity: 'medium' };
  const swarm = orchestrateSwarm(task, 1000);

  const runRadar = () => {
    const r = runB2bRadarCampaign({ lat: 36.2001, lng: 29.6419 }, 5, 3);
    setPitches(r.pitches);
    setCampaignRef(r.campaignRef);
    setMode(r.mode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(74,222,128,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🗺️ Gropector B2B + 🐟 Swarm AI</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>{gropectorB2bRadarStatus()} • {swarmOrchestratorStatus()}</div>
        </div>
        <button onClick={runRadar} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4ade80,#22d3ee)', color: '#0d1322' }}>🛰️ B2B Radar Tara</button>
      </div>

      {/* SWARM TELEMETRİSİ */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.7 }}>
        <b style={{ color: '#4ade80' }}>🐟 Sürü Koordinatörü</b> — {task.title}
        {swarm.assignments.map((a) => <div key={a.agent} style={{ marginTop: '2px' }}>• {a.agent}: {a.output}</div>)}
        <div style={{ marginTop: '4px', color: '#fbbf24' }}>💾 Token: {swarm.tokensUsed} kullanıldı • {swarm.tokensSaved} tasarruf (%{swarm.savePct}) — RTK/Caveman: <b style={{ color: '#4ade80' }}>%{compressed.savePct}</b> sıkıştırma</div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Sıkıştırılmış prompt: "{compressed.compressed.slice(0, 80)}…"</div>
      </div>

      {/* B2B PITCHLER */}
      {pitches && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc' }}>📡 KAMPANYA {campaignRef} ({mode.toUpperCase()})</div>
          {pitches.map((p) => (
            <div key={p.businessId} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.6 }}>
              <b style={{ color: '#4ade80' }}>🏢 {p.businessName}</b> — {p.subject}<br />
              <span style={{ color: '#94a3b8' }}>{p.opening}</span><br />
              <span style={{ color: '#fbbf24' }}>💎 {p.valueProp} → {p.offer}</span><br />
              <span style={{ color: '#7dd3fc' }}>CTA: {p.cta}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
