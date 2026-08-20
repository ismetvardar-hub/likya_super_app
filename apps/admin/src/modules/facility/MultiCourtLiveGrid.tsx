'use client';

import React, { useState } from 'react';
import { createCourtGrid, setCourtStatus, emergencyLockout, reallocateCourt, gridSummary, statusBadge, countdownLabel, type CourtOccupancy, type CourtStatus } from '../../app/lib/facility/courtOccupancyEngine.ts';

// ============================================================================
// 🏟️ ÇOK KORTLU CANLI DOLULUK & DURUM IZGARASI (Adım 86)
// 12 kort • 4 durum rozeti • canlı koç/oyuncu/HR/geri sayım • acil kilit + yeniden atama
// Motor: courtOccupancyEngine.ts
// ============================================================================

export default function MultiCourtLiveGrid() {
  const [grid, setGrid] = useState<CourtOccupancy[]>(() => createCourtGrid(12));
  const summary = gridSummary(grid);

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      {/* Özet şeridi */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, fontSize: 10 }}>
        <span style={{ color: '#10B981' }}>● Aktif {summary.active}</span>
        <span style={{ color: '#00f2fe' }}>◻ Rezerve {summary.booked}</span>
        <span style={{ color: '#F27A1A' }}>⚠ Bakım {summary.maintenance}</span>
        <span style={{ color: '#64748b' }}>○ Boş {summary.vacant}</span>
        <span style={{ color: '#e2e8f0' }}>· {summary.totalPlayers} oyuncu · ort HR {summary.avgActiveHr}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
        {grid.map((c) => {
          const badge = statusBadge(c.status);
          return (
            <div key={c.id} style={{ border: `1px solid ${badge.color}44`, borderRadius: 10, padding: 10, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{c.name}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: badge.color }}>{badge.label}</span>
              </div>
              {c.status === 'ACTIVE_SESSION' ? (
                <>
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 6 }}>Koç: {c.coach} · {c.playerCount} oyuncu</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>HR {c.avgHr} bpm · ⏱ {countdownLabel(c.countdownSec)}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <button onClick={() => setGrid(emergencyLockout(grid, c.id))} style={mini}>🔒 Kilit</button>
                    <button onClick={() => setGrid(reallocateCourt(grid, c.id, `Antrenör ${c.id.split('-')[1]}`))} style={mini}>⇄ Atama</button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {(['ACTIVE_SESSION', 'BOOKED_PENDING', 'MAINTENANCE', 'VACANT'] as CourtStatus[]).map((s) => (
                    <button key={s} onClick={() => setGrid(setCourtStatus(grid, c.id, s))} style={{ ...mini, fontSize: 7 }}>{s === 'ACTIVE_SESSION' ? 'Aktif' : s === 'BOOKED_PENDING' ? 'Rez' : s === 'MAINTENANCE' ? 'Bakım' : 'Boş'}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 8, fontWeight: 800, padding: '4px 7px', borderRadius: 5, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
