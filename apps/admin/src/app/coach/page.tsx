'use client';

import React from 'react';
import CoachPortal from '../components/customer/CoachPortal';
import RoleGate, { useCustomerRole } from '../components/RoleGate';
import { RoleSwitcher } from '../components/RoleSwitcher';
import NotificationCenter from '../components/NotificationCenter';

export default function CoachPage() {
  const role = useCustomerRole();
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
        <RoleSwitcher current={role} />
        <NotificationCenter />
      </div>
      <RoleGate allowed={['coach', 'staff', 'manager', 'ceo']} role={role}>
        <CoachPortal />
      </RoleGate>
    </>
  );
}
