'use client';

import React, { useState } from 'react';
import { glossaryFor } from './sportsScienceGlossary.ts';

// ============================================================================
// 🔍 SPOR BİLİMİ SÖZLÜĞÜ TOOLTIP (Adım 44)
// Metrik kartlarını saran hafif hover/tap tooltip — veliler ve genç sporcular
// için sade dilde açıklama. Erişilebilir: rol=button + aria-label.
// ============================================================================

export interface SportsScienceGlossaryTooltipProps {
  abbr: string;            // RSI, GCT, TRIMP, ACWR, EPOC, GRF, CDL, Pronation…
  children?: React.ReactNode;
  width?: number;
}

export default function SportsScienceGlossaryTooltip({ abbr, children, width = 230 }: SportsScienceGlossaryTooltipProps) {
  const [show, setShow] = useState(false);
  const entry = glossaryFor(abbr);
  if (!entry) return <>{children ?? <span>{abbr}</span>}</>;

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
      role="button"
      tabIndex={0}
      aria-label={`${entry.term} (${entry.abbr}) açıklaması`}
    >
      {children ?? (
        <span style={{ fontSize: 10, fontWeight: 800, color: '#00f2fe', borderBottom: '1px dashed rgba(0,242,254,0.5)', paddingBottom: 1 }}>
          {entry.emoji} {entry.abbr}
        </span>
      )}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '130%',
            left: 0,
            zIndex: 60,
            width,
            background: 'rgba(2,6,23,0.97)',
            border: '1px solid rgba(0,242,254,0.35)',
            borderRadius: 10,
            padding: '8px 10px',
            fontSize: 10,
            lineHeight: 1.45,
            color: '#e2e8f0',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <b style={{ color: '#00f2fe' }}>{entry.emoji} {entry.term} <span style={{ color: '#64748b' }}>({entry.abbr})</span></b>
          <div style={{ marginTop: 4 }}>{entry.plainLanguage}</div>
          {entry.forAudience === 'parent' && <div style={{ marginTop: 4, fontSize: 9, color: '#facc15' }}>👨‍👩‍👧 Veli notu</div>}
        </span>
      )}
    </span>
  );
}
