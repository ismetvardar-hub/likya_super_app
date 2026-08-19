'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import type { RbacRole } from '../lib/auth/rbacGuard';
import { CUSTOMER_ROLES } from './RoleSwitcher';

// ============================================================================
// 🚪 ROLE GATE — korumalı müşteri rotası sarmalayıcısı.
// Demo modunda localStorage rolü; gerçek oturumda JWT role kullanılır.
// Yetkisiz erişimde diğer portal seçeneklerine yönlendirir.
// ============================================================================

export function useCustomerRole(): RbacRole {
  const [role, setRole] = useState<RbacRole>('athlete');
  useEffect(() => {
    const r = (localStorage.getItem('likya_demo_role') as RbacRole) || 'athlete';
    setRole(r);
  }, []);
  return role;
}

export default function RoleGate({ allowed, role, children }: { allowed: RbacRole[]; role: RbacRole; children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) return <div style={{ padding: 20, color: '#64748b', fontSize: 12 }}>Portal yükleniyor…</div>;
  if (!allowed.includes(role)) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#e2e8f0', background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', minHeight: '100vh' }}>
        <div style={{ fontSize: 20 }}>🚫</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>Bu portal, {CUSTOMER_ROLES.find((c) => c.id === role)?.label ?? role} rolü için açık değil.</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Üstteki 🎭 Demo Rol seçicisinden geçiş yapın.</div>
      </div>
    );
  }
  return <>{children}</>;
}
