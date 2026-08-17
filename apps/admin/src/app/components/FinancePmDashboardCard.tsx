'use client';

import React, { useState } from 'react';
import { runFinanceWorkflow, invoiceDueAlerts, posReconciliation, cashflowForecast, geminiFinanceStatus } from '../lib/finance/geminiFinanceAutomator';
import { extractActionItems, analyzeBottlenecks, agilePmStatus } from '../lib/pm/agileContextEngine';
import { buildSocialContent, HOOK_LIBRARY, hookLibraryStatus } from '../lib/marketing/hookLibrary60';

// ============================================================================
// 🎛️ FİNANS & PM HUD (koyu neon)
// Sekme 1: Gemini Finance Workflow • 2: Agile PM & Bottlenecks • 3: Viral Hook
// Kırılmasız: bağımsız bileşen; deterministik motorlar + nezaket filtresi.
// ============================================================================

type TabId = 'finance' | 'pm' | 'hooks';

export default function FinancePmDashboardCard() {
  const [tab, setTab] = useState<TabId>('finance');
  const [workflow] = useState(runFinanceWorkflow);
  const [hookIdx, setHookIdx] = useState(0);
  const [content, setContent] = useState(() => buildSocialContent(0, 'Likya Kampüsü'));

  const invoices = invoiceDueAlerts();
  const recon = posReconciliation();
  const forecast = cashflowForecast();
  const bottlenecks = analyzeBottlenecks([{ text: 'Kort bakımı tamamlayalım, pazaryeri siparişlerini önceliklendirelim, mutfak kapasitesini planlayalım!', attendees: ['CEO', 'Tesis Müdürü'] }]);
  const actions = extractActionItems({ text: 'Kort bakımı tamamlayalım. Pazaryeri siparişlerini önceliklendirelim. Mutfak kapasitesini planlayalım.', attendees: ['CEO', 'Daze Crew', 'Şef'] });

  const nextHook = () => {
    const n = (hookIdx + 1) % HOOK_LIBRARY.length;
    setHookIdx(n);
    setContent(buildSocialContent(n, 'Likya Kampüsü'));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(245,158,11,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>💰 Finans & Proje Motoru</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{geminiFinanceStatus()} · {agilePmStatus()} · {hookLibraryStatus()}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['finance', '💰 Finance Workflow'], ['pm', '📊 Agile PM'], ['hooks', '🎣 Viral Hooks']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
              border: tab === id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
              background: tab === id ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === id ? '#fbbf24' : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sekme 1: Finance */}
      {tab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>VADESİ GELEN</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f87171' }}>{invoices.filter((i) => i.status === 'vadesi-geldi').length}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>MUTABAKAT FARKI</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>{recon.gap.toLocaleString('tr-TR')}₺</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>7 GÜN NET AKIŞ</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>{forecast.net7d.toLocaleString('tr-TR')}₺</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {workflow.map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ width: '18px', textAlign: 'center', fontWeight: 800, color: s.status === 'tamam' ? '#4ade80' : s.status === 'aktif' ? '#fbbf24' : '#64748b' }}>{s.step}</span>
                <span style={{ color: '#e2e8f0', flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8', maxWidth: '55%', textAlign: 'right' }}>{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sekme 2: Agile PM */}
      {tab === 'pm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>AKSİYON MADDELERİ (toplantıdan)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {actions.map((a, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <b>{a.task}</b> · <span style={{ color: '#67e8f9' }}>{a.assignee}</span> · {a.dueDate} · <span style={{ color: a.priority === 'yuksek' ? '#f87171' : a.priority === 'orta' ? '#fbbf24' : '#94a3b8' }}>{a.priority}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '6px' }}>DARBOĞAZ ANALİZİ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {bottlenecks.map((b) => (
              <div key={b.area} style={{ padding: '7px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '11px', color: '#e2e8f0' }}>
                ⚠️ <b>{b.area}</b> — {b.severity}/100 · <span style={{ color: '#94a3b8' }}>{b.recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sekme 3: Viral Hooks */}
      {tab === 'hooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#c4b5fd' }}>🎣 {content.hook}</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>{content.body}</div>
            <div style={{ fontSize: '11px', color: '#67e8f9', marginTop: '6px' }}>{content.cta}</div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '6px' }}>Hook #{hookIdx + 1}/{HOOK_LIBRARY.length} · {content.tone}</div>
          </div>
          <button onClick={nextHook} style={{ padding: '9px 0', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.4)', cursor: 'pointer', background: 'rgba(167,139,250,0.08)', color: '#c4b5fd', fontWeight: 800, fontSize: '12px' }}>
            🎲 Sonraki Hook
          </button>
          <div style={{ fontSize: '10px', color: '#64748b' }}>60 hook · 6 kategori (merak/sosyal-kanıt/fayda/duygu/korku-fırsat/topluluk) · nezaket filtresi aktif</div>
        </div>
      )}
    </div>
  );
}

