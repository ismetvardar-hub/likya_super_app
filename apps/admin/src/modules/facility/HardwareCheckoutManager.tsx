'use client';

import React, { useState } from 'react';
import {
  createLockerInventory, createSensorInventory, autoAssignForSession, markInUse, returnAsset, markNeedsInspection, inventorySummary, HARDWARE_STATE_LABEL,
  type HardwareAsset, type HardwareState,
} from '../../app/lib/facility/hardwareCheckoutEngine.ts';

// ============================================================================
// 🔒 AKILLI DOLAP & DONANIM TESLİM YÖNETİCİSİ (Adım 91)
// Dolap (1-40) + tabanlık + HRM envanteri; sporcuya otomatik atama ve durum geçişleri.
// Motor: hardwareCheckoutEngine.ts
// ============================================================================

export default function HardwareCheckoutManager() {
  const [assets, setAssets] = useState<HardwareAsset[]>(() => [...createLockerInventory(12), ...createSensorInventory(4, 4)]);
  const [athleteId, setAthleteId] = useState('at-1');
  const summary = inventorySummary(assets);

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      {/* Özet */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, fontSize: 10, color: '#94a3b8' }}>
        {Object.entries(summary).map(([s, n]) => (
          <span key={s}>{HARDWARE_STATE_LABEL[s as HardwareState]}: <b style={{ color: '#e2e8f0' }}>{n}</b></span>
        ))}
      </div>

      {/* Otomatik atama */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <input value={athleteId} onChange={(e) => setAthleteId(e.target.value)} style={{ fontSize: 10, width: 70, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '6px 8px' }} />
        <button onClick={() => setAssets((prev) => autoAssignForSession(prev, athleteId, 'locker').assets)} style={mini}>🔑 Dolap Ata</button>
        <button onClick={() => setAssets((prev) => autoAssignForSession(prev, athleteId, 'hrm').assets)} style={mini}>❤️ HRM Ata</button>
        <button onClick={() => setAssets((prev) => autoAssignForSession(prev, athleteId, 'insole').assets)} style={mini}>👟 Tabanlık Ata</button>
      </div>

      {/* Envanter listesi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6 }}>
        {assets.slice(0, 24).map((a) => (
          <div key={a.id} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8, fontSize: 9 }}>
            <div style={{ fontWeight: 800, color: '#e2e8f0' }}>{a.serial} <span style={{ color: '#64748b', fontWeight: 500 }}>({a.kind})</span></div>
            <div style={{ color: a.state === 'AVAILABLE' ? '#10B981' : a.state === 'IN_USE_ON_COURT' ? '#00f2fe' : a.state === 'NEEDS_INSPECTION' ? '#F43F5E' : '#94a3b8' }}>{HARDWARE_STATE_LABEL[a.state]}</div>
            {a.assignedTo && <div style={{ color: '#facc15' }}>→ {a.assignedTo}</div>}
            <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
              <button onClick={() => setAssets(markInUse(assets, a.id))} style={tiny}>Kort</button>
              <button onClick={() => setAssets(returnAsset(assets, a.id))} style={tiny}>İade</button>
              <button onClick={() => setAssets(markNeedsInspection(assets, a.id))} style={tiny}>⚠</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
const tiny: React.CSSProperties = { fontSize: 8, fontWeight: 700, padding: '3px 6px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
