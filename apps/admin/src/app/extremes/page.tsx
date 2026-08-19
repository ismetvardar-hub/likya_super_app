'use client';

import React, { useState } from 'react';
import ExtremeSCustomerPortal from '../components/ExtremeSCustomerPortal';

// ============================================================================
// 📱 EXTREMES — BAĞIMSIZ MOBİL UYGULAMA SHELL (PWA, Android/iOS görünümlü)
// /extremes (ve /app) rotaları: sidebar/CEO menüsü YOK — saf mobil uygulama.
// Üst bar + portal gövde + alt sabit bottom nav (safe-area-inset uyumlu).
// ============================================================================

const NAV_TABS = [
  { id: 'home', icon: '🏠', label: 'Ana Sayfa' },
  { id: 'rezervasyon', icon: '🎾', label: 'Rezervasyon' },
  { id: 'krediler', icon: '🎟️', label: 'Kredilerim' },
  { id: 'aile', icon: '👨‍👩‍👧‍👦', label: 'Ailem' },
  { id: 'davet', icon: '🎁', label: 'Davet Et' },
] as const;

export default function ExtremeSMobileApp() {
  const [tab, setTab] = useState<(typeof NAV_TABS)[number]['id']>('home');
  const [notifCount] = useState(2);

  return (
    <div style={{ minHeight: '100dvh', background: '#eef2ff', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100dvh', background: 'linear-gradient(180deg,#eef2ff,#f8fafc)', boxShadow: '0 0 40px rgba(79,70,229,0.12)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        {/* ÜST BAR (iOS/Android status bar alanı) */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: 'env(safe-area-inset-top, 12px) 16px 12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>ExtremeS</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>Daze ExtremeS • Müşteri Portalı</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}>
              🔔
              {notifCount > 0 && <span style={{ position: 'absolute', top: -3, right: -3, background: '#f87171', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 999, padding: '1px 4px' }}>{notifCount}</span>}
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#fbbf24,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', cursor: 'pointer' }}>A</div>
          </div>
        </div>

        {/* GÖVDE — mobil portal (safe-area) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px calc(76px + env(safe-area-inset-bottom, 0px))' }}>
          <ExtremeSCustomerPortal />
        </div>

        {/* ALT SABİT BOTTOM NAV */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', padding: '6px 4px calc(6px + env(safe-area-inset-bottom, 0px))', zIndex: 30 }}>
          {NAV_TABS.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 12, color: tab === n.id ? '#4f46e5' : '#94a3b8' }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 8.5, fontWeight: tab === n.id ? 800 : 500 }}>{n.label}</span>
              {tab === n.id && <span style={{ width: 18, height: 3, borderRadius: 99, background: '#4f46e5' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
