'use client';

import React from 'react';
import AthletePortal from '../components/customer/AthletePortal';
import RoleGate, { useCustomerRole } from '../components/RoleGate';
import { RoleSwitcher } from '../components/RoleSwitcher';
import NotificationCenter from '../components/NotificationCenter';

export default function AthletePage() {
  const role = useCustomerRole();
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
        <RoleSwitcher current={role} />
        <NotificationCenter />
      </div>
      <RoleGate allowed={['athlete', 'coach', 'parent', 'staff', 'manager', 'ceo']} role={role}>
        <AthletePortal />
      </RoleGate>
    </>
  );
}
