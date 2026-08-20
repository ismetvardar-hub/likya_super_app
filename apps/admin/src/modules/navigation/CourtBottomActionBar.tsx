'use client';

import React from 'react';
import { BOTTOM_ACTIONS, type BottomActionId } from '../../app/lib/ui/courtActionBarConfig.ts';

// ============================================================================
// 🎛️ MOBİL & TABLET HIZLI AKSİYON ALT NAVİGASYONU (Adım 74)
// Tek elle/başparmak dostu yapışkan alt çubuk — kortta:
// Drill Başlat/Durdur • Sporcu Değiştir • Sesli Not • Sakatlık Durdur • Teşhis HUD
// Portrait & landscape için optimize. Konfig: courtActionBarConfig.ts
// ============================================================================

export interface CourtBottomActionBarProps {
  onAction?: (id: BottomActionId) => void;
  orientation?: 'portrait' | 'landscape';
  disabled?: BottomActionId[];
  drillActive?: boolean;
}

export default function CourtBottomActionBar({ onAction, orientation = 'portrait', disabled = [], drillActive = false }: CourtBottomActionBarProps) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 40, display: 'flex', gap: 6,
      padding: '8px 10px', borderRadius: '16px 16px 0 0',
      background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(0,242,254,0.15)',
      borderBottom: 'none', backdropFilter: 'blur(10px)', justifyContent: 'center',
    }}>
      {BOTTOM_ACTIONS.map((a) => {
        const isDisabled = disabled.includes(a.id);
        const isDrill = a.id === 'start-stop-drill' && drillActive;
        return (
          <button
            key={a.id}
            onClick={() => !isDisabled && onAction?.(a.id)}
            disabled={isDisabled}
            aria-label={a.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              minWidth: orientation === 'landscape' ? 92 : 64, padding: '8px 6px',
              borderRadius: 12, border: `1px solid ${isDrill ? '#facc15' : a.color}55`,
              background: isDrill ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)',
              color: isDisabled ? '#475569' : '#e2e8f0', cursor: isDisabled ? 'not-allowed' : 'pointer',
              fontSize: orientation === 'landscape' ? 10 : 9, fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 16 }}>{isDrill ? '⏹️' : a.emoji}</span>
            <span>{isDrill ? 'Durdur' : a.label}</span>
          </button>
        );
      })}
    </div>
  );
}
