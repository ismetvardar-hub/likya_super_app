'use client';

import React, { useMemo, useState } from 'react';

// ============================================================================
// 🕸️ NEON GRAPH VIEW — Master Vault notlarını node-edge grafik olarak render
// Kategori düğümleri + not yaprakları; tıklayınca not içeriği açılır.
// Kırılmasız: bağımsız bileşen; deterministik düzen (sabit koordinatlar).
// ============================================================================

export interface GraphNote {
  id: string;
  title: string;
  category: string;
  content: string;
}

interface Props {
  notes: GraphNote[];
}

const CATEGORY_COLORS = [
  '#00f2fe', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
];

export default function NeonGraphView({ notes }: Props) {
  const [selected, setSelected] = useState<GraphNote | null>(null);

  // Kategori kümeleme (deterministik)
  const clusters = useMemo(() => {
    const map = new Map<string, GraphNote[]>();
    notes.forEach((n) => {
      const list = map.get(n.category) ?? [];
      list.push(n);
      map.set(n.category, list);
    });
    return Array.from(map.entries()).map(([category, items], i) => ({
      category,
      items,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [notes]);

  if (!notes.length) {
    return <div style={{ fontSize: '12px', color: '#64748b', padding: '16px' }}>📭 Vault boş — not yükleyin.</div>;
  }

  return (
    <div style={{
      background: 'radial-gradient(circle at 30% 20%, rgba(0,242,254,0.08), rgba(13,19,34,0.97) 60%)',
      border: '1px solid rgba(0,242,254,0.25)', borderRadius: '16px', padding: '16px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
        🕸️ Vault Neon Graph — {notes.length} not
      </div>

      {/* Kategori düğümleri + not yaprakları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clusters.map((c) => (
          <div key={c.category} style={{
            border: `1px solid ${c.color}44`, borderRadius: '12px', padding: '10px',
            background: `linear-gradient(135deg, ${c.color}0d, rgba(13,19,34,0.6))`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: c.color, letterSpacing: '0.4px' }}>{c.category.toUpperCase()}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{c.items.length} not</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {c.items.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelected(n)}
                  style={{
                    padding: '4px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '10px',
                    border: `1px solid ${c.color}55`, background: 'rgba(0,0,0,0.3)', color: '#cbd5e1',
                  }}
                >
                  {n.title}
                </button>
              ))}
              {c.items.length > 8 && <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center' }}>+{c.items.length - 8}…</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Not içeriği */}
      {selected && (
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,242,254,0.3)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{selected.title}</div>
          <div style={{ fontSize: '10px', color: '#00f2fe', margin: '4px 0' }}>{selected.category}</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>{selected.content}</div>
          <button onClick={() => setSelected(null)} style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            Kapat
          </button>
        </div>
      )}
    </div>
  );
}
