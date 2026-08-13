'use client';

import React from 'react';
import CEOCommandCenter from './components/CEOCommandCenter';

// ============================================================================
// LİKYA CEO COMMAND CENTER - TEK ÇALIŞMA ALANI (SINGLE WORKSPACE)
// Sol menü + Dinamik sağ panel mimarisi
// ============================================================================

export default function LikyaCampusCommandSystem() {
  return (
    <main style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 🤖 LİKYA CEO COMMAND CENTER - TEK ÇALIŞMA ALANI */}
      <CEOCommandCenter />
    </main>
  );
}
