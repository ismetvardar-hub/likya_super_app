'use client';

import React, { useState } from 'react';
import {
  createDashboardLayout, toggleWidget, resizeWidget, reorderWidgets, persistLayout,
  loadLayout, PRESET_LAYOUTS, type DashboardLayout, type WidgetSize,
} from '../../app/lib/ui/dashboardLayoutEngine.ts';

// ============================================================================
// 🧩 ÖZELLEŞTİRİLEBİLİR DASHBOARD WIDGET GRID (Adım 66)
// Widget aç/kapat, sırala, boyutlandır (1x1/2x1/2x2) + localStorage kalıcılık
// Coach/Parent/CEO preset'leri. layout motoru: dashboardLayoutEngine.ts
// ============================================================================

const SIZE_PANEL: Record<WidgetSize, { col: number; row: number }> = { '1x1': { col: 1, row: 1 }, '2x1': { col: 2, row: 1 }, '2x2': { col: 2, row: 2 } };

export default function DashboardWidgetGrid({ preset = 'COACH' }: { preset?: keyof typeof PRESET_LAYOUTS }) {
  const [layout, setLayout] = useState<DashboardLayout>(() => loadLayout(preset));
  const [open, setOpen] = useState(true);

  const commit = (next: DashboardLayout) => {
    setLayout(next);
    persistLayout(next);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 10, color: '#94a3b8' }}>
        <button onClick={() => setOpen((v) => !v)} style={{ fontSize: 10, fontWeight: 800, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', cursor: 'pointer' }}>🧩 Widget Panel</button>
        <span>{layout.name} · {layout.widgets.filter((w) => w.visible).length} widget</span>
        {Object.keys(PRESET_LAYOUTS).map((p) => (
          <button key={p} onClick={() => commit(createDashboardLayout(p as keyof typeof PRESET_LAYOUTS))} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{p}</button>
        ))}
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {layout.widgets.map((w, i) => (
            <div key={w.id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'rgba(255,255,255,0.03)', fontSize: 10, color: w.visible ? '#e2e8f0' : '#64748b' }}>
              <span>{w.title}</span>
              <button onClick={() => commit(toggleWidget(layout, w.id))} style={{ fontSize: 9, border: 'none', background: 'transparent', color: '#00f2fe', cursor: 'pointer' }}>{w.visible ? '✕' : '✓'}</button>
              <select value={w.size} onChange={(e) => commit(resizeWidget(layout, w.id, e.target.value as WidgetSize))} style={{ fontSize: 9, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4 }}>
                {(['1x1', '2x1', '2x2'] as WidgetSize[]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => commit(reorderWidgets(layout, i, Math.max(0, i - 1)))} style={{ fontSize: 9, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>←</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(4, 1fr)', gridAutoFlow: 'dense' }}>
        {layout.widgets.filter((w) => w.visible).map((w) => {
          const p = SIZE_PANEL[w.size];
          return (
            <div key={w.id} style={{ gridColumn: `span ${p.col}`, gridRow: `span ${p.row}`, minHeight: p.row * 90, borderRadius: 12, border: '1px solid rgba(0,242,254,0.15)', background: 'rgba(2,6,23,0.6)', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
              {w.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
