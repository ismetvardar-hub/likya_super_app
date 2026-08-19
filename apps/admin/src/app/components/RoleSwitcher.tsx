'use client';

import React, { useState } from 'react';
import type { RbacRole } from '../lib/auth/rbacGuard';

// ============================================================================
// 🔀 ROL DEĞİŞTİRİCİ (Demo/Dev) — Sporcu / Antrenör / Veli görünümlerini
// tek tıkla test etmek için üst bar seçici. localStorage'da rol tutar.
// ============================================================================

export const CUSTOMER_ROLES: { id: RbacRole; label: string; emoji: string; route: string }[] = [
  { id: 'athlete', label: 'Sporcu', emoji: '🏃', route: '/athlete' },
  { id: 'coach', label: 'Antrenör', emoji: '🧑‍🏫', route: '/coach' },
  { id: 'parent', label: 'Veli', emoji: '👨‍👩‍👧', route: '/parent' },
];

export function getDemoRole(): RbacRole {
  if (typeof window === 'undefined') return 'athlete';
  return (localStorage.getItem('likya_demo_role') as RbacRole) || 'athlete';
}

export function RoleSwitcher({ current }: { current: RbacRole }) {
  const [role, setRole] = useState<RbacRole>(() => getDemoRole());

  const switchRole = (r: RbacRole) => {
    setRole(r);
    localStorage.setItem('likya_demo_role', r);
    window.location.href = CUSTOMER_ROLES.find((c) => c.id === r)?.route ?? '/athlete';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(56,189,248,0.25)' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: 1 }}>🎭 DEMO ROL:</span>
      {CUSTOMER_ROLES.map((c) => (
        <button
          key={c.id}
          onClick={() => switchRole(c.id)}
          style={{
            fontSize: '9.5px', fontWeight: 800, padding: '6px 12px', borderRadius: '9px', cursor: 'pointer',
            border: current === c.id ? '1px solid rgba(56,189,248,0.6)' : '1px solid rgba(255,255,255,0.15)',
            background: current === c.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
            color: current === c.id ? '#38bdf8' : '#94a3b8',
          }}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  );
}
