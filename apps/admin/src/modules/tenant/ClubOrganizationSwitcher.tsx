'use client';

import React, { useState } from 'react';
import { createMultiTenantEngine, CLUB_TENANTS, type ClubTenant } from '../../app/lib/tenant/multiTenantEngine.ts';

// ============================================================================
// 🏛️ ÇOK KİRACILI KULÜP & TESİS ORGANİZASYON DEĞİŞTİRİCİ (Adım 93)
// Hızlı kulüp değiştirici + kiracı veri kapsamı görselleştirmesi.
// Motor: multiTenantEngine.ts
// ============================================================================

export default function ClubOrganizationSwitcher() {
  const [engine, setEngine] = useState(() => createMultiTenantEngine('antalya-tenis'));
  const [current, setCurrent] = useState<ClubTenant>(engine.getCurrentClub());
  const scoped = engine.scopeData([
    { clubId: 'antalya-tenis', label: 'Sporcu Efe (ATK)' },
    { clubId: 'lara-akademi', label: 'Sporcu Zeynep (Lara)' },
    { clubId: 'belek-performance', label: 'Sporcu Arda (Belek)' },
    { clubId: 'antalya-tenis', label: 'Sporcu Elif (ATK)' },
  ]);

  return (
    <div style={{ width: '100%', maxWidth: 460, background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {CLUB_TENANTS.map((c) => (
          <button
            key={c.id}
            onClick={() => { engine.switchClub(c.id); setCurrent(engine.getCurrentClub()); setEngine(new (Object.getPrototypeOf(engine).constructor)(CLUB_TENANTS, c.id)); }}
            style={{ fontSize: 10, fontWeight: 800, padding: '7px 12px', borderRadius: 8, border: current.id === c.id ? '1px solid #00f2fe' : '1px solid #334155', background: current.id === c.id ? 'rgba(0,242,254,0.1)' : 'transparent', color: '#e2e8f0', cursor: 'pointer' }}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>
        Aktif: <b style={{ color: '#00f2fe' }}>{current.name}</b> · {current.city} · {current.facilityCount} tesis
      </div>
      {/* Kiracı kapsamlı veri */}
      <div style={{ border: '1px solid #1e293b', borderRadius: 10, padding: 8, fontSize: 10 }}>
        <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>Bu kiracıya kapsanan veri ({scoped.length}):</div>
        {scoped.map((s) => <div key={s.label} style={{ color: '#10B981', padding: '2px 0' }}>✓ {s.label}</div>)}
        <div style={{ color: '#64748b', marginTop: 6 }}>Diğer kulüplerin verileri izole — erişim engelli</div>
      </div>
    </div>
  );
}
