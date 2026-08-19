'use client';

import React, { useState } from 'react';
import { getBuiltinTemplates, deployTemplateToN8n, builtinTemplatesStatus, type BuiltinTemplate } from '../lib/ops/dazeBuiltinTemplates';
import { checkN8nLiveStatus } from '../lib/ops/n8nApiClient';

// ============================================================================
// 📦 YERLEŞİK n8n OTOMASYON ŞABLON MAĞAZASI — 5 ÜCRETSİZ MOTOR
// Tek tıkla "İş Akışını Otonom Başlat" → proxy üzerinden deploy + aktifleştir.
// n8n env yoksa mock-first (sıfır maliyet, asla çökme). Monitor view'da.
// ============================================================================

export default function BuiltinTemplateStoreCard() {
  const [templates] = useState<BuiltinTemplate[]>(() => getBuiltinTemplates());
  const [live, setLive] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ ok: boolean; template: string; mode: string; message: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void checkN8nLiveStatus().then((s) => { if (!cancelled) setLive(s.live); });
    return () => { cancelled = true; };
  }, []);

  const deploy = async (t: BuiltinTemplate) => {
    setDeploying(t.id);
    const r = await deployTemplateToN8n(t.id);
    setLastResult({ ok: r.ok, template: t.name, mode: r.mode, message: r.message });
    setDeploying(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(251,191,36,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📦 Yerleşik n8n Otomasyon Şablonları — 5 Ücretsiz Motor</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{builtinTemplatesStatus()}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: live ? '#4ade80' : '#fbbf24', background: live ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)', border: `1px solid ${live ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)'}` }}>
          {live ? '🟢 n8n CANLI' : '🟡 MOCK-FIRST'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '10px' }}>
        {templates.map((t) => (
          <div key={t.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{t.icon} {t.name}</div>
            <div style={{ fontSize: '9.5px', color: '#94a3b8', lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ fontSize: '8px', color: '#fbbf24' }}>⚡ {t.trigger}</div>
            <div style={{ fontSize: '8px', color: '#7dd3fc', lineHeight: 1.5 }}>{t.steps.join(' → ')}</div>
            <button onClick={() => void deploy(t)} disabled={deploying === t.id} style={{ marginTop: 'auto', fontSize: '10px', fontWeight: 800, padding: '8px 10px', borderRadius: '10px', border: 'none', cursor: deploying === t.id ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#0d1322' }}>
              {deploying === t.id ? '⏳ Dağıtılıyor...' : '🚀 İş Akışını Otonom Başlat'}
            </button>
          </div>
        ))}
      </div>

      {lastResult && (
        <div style={{ background: lastResult.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${lastResult.ok ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`, borderRadius: '12px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
          <b>{lastResult.template}</b> — [{lastResult.mode.toUpperCase()}] {lastResult.message}
        </div>
      )}
    </div>
  );
}
