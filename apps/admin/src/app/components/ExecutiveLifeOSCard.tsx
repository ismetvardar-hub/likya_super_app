'use client';

import React, { useState } from 'react';
import {
  loadContext, saveContext, updateGoal, addTravel,
  type ExecutiveContext,
} from '../lib/lifeos/executiveContextEngine';

// ============================================================================
// 🎛️ LIFEOS HUD — Executive Context & Trajectory kartı (koyu neon)
// Habits • Travel • Deep Work • VIP Relationships • App Builder sekmeleri.
// Kırılmasız: bağımsız bileşen; localStorage kalıcılığı.
// ============================================================================

type TabId = 'habits' | 'travel' | 'deepwork' | 'vip' | 'builder';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'habits', label: 'Habits', icon: '🔥' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'deepwork', label: 'Deep Work', icon: '🧠' },
  { id: 'vip', label: 'VIP Relations', icon: '🤝' },
  { id: 'builder', label: 'App Builder', icon: '🧩' },
];

export default function ExecutiveLifeOSCard() {
  const [ctx, setCtx] = useState<ExecutiveContext>(() => loadContext());
  const [tab, setTab] = useState<TabId>('habits');
  const [newGoal, setNewGoal] = useState('');

  const commit = (next: ExecutiveContext) => {
    saveContext(next);
    setCtx(next);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(167,139,250,0.35)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 28px rgba(167,139,250,0.1)',
    }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🧬 LifeOS — Executive Context</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            Hedef: {ctx.trajectory.currentGoal.slice(0, 44)}{ctx.trajectory.currentGoal.length > 44 ? '…' : ''} · odak %{ctx.trajectory.focusPercent}
          </div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#a78bfa', padding: '3px 9px', borderRadius: '999px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.4)' }}>
          FAZ: {ctx.trajectory.phase.toUpperCase()}
        </span>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '5px 11px', borderRadius: '999px', cursor: 'pointer', fontSize: '10px', fontWeight: 700,
              border: tab === t.id ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)',
              background: tab === t.id ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#c4b5fd' : '#94a3b8',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Sekme içerikleri */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tab === 'habits' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>GÜNLÜK RİTİMLER</div>
            {ctx.habits.map((h) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '12px', color: '#e2e8f0' }}>{h.emoji} {h.name}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>🔥 {h.streak} gün</span>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Ritim: uyanış {ctx.routine.wakeUp} · derin çalışma {ctx.routine.deepWorkBlock} · kadans: {ctx.routine.cadence}
            </div>
          </>
        )}

        {tab === 'travel' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>KAMPÜS SEYAHATLERİ</div>
            {ctx.travel.map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#e2e8f0' }}>✈️ {t.destination}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{t.purpose} · {t.date}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: t.status === 'aktif' ? '#4ade80' : t.status === 'planlandi' ? '#67e8f9' : '#94a3b8' }}>{t.status}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'deepwork' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>DERİN ÇALIŞMA BLOKLARI</div>
            {ctx.routine.focusBlocks.map((b) => (
              <div key={b} style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', fontSize: '12px', color: '#e2e8f0' }}>
                🧠 {b}
              </div>
            ))}
            <div style={{ fontSize: '10px', color: '#64748b' }}>Bugünkü odak: {ctx.trajectory.focusPercent}% · amaç: {ctx.trajectory.currentGoal}</div>
          </>
        )}

        {tab === 'vip' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>VIP İLİŞKİLER</div>
            {ctx.vipRelationships.map((v) => (
              <div key={v.id} style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#e2e8f0' }}>
                  <span>🤝 {v.name} <span style={{ color: '#64748b' }}>· {v.role}</span></span>
                  <span style={{ fontWeight: 800, color: '#fbbf24' }}>{v.strength}/100</span>
                </div>
                <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v.strength}%`, borderRadius: '999px', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>temas: {v.touchpoint}</div>
              </div>
            ))}
          </>
        )}

        {tab === 'builder' && (
          <>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>HEDEF / YOL HARİTASI</div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#c4b5fd' }}>🎯 {ctx.trajectory.currentGoal}</div>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ctx.trajectory.milestones.map((m, i) => (
                  <div key={m} style={{ fontSize: '11px', color: '#cbd5e1' }}>📍 {i + 1}. {m}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Yeni hedef yaz…"
                style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
              />
              <button
                onClick={() => { if (newGoal.trim()) { commit(updateGoal(ctx, newGoal.trim())); setNewGoal(''); } }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: '12px' }}
              >
                Güncelle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

