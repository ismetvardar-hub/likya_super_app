'use client';

import React from 'react';
import { occupancySnapshot, footfallCounterEngineStatus } from '../lib/security/footfallCounterEngine';
import { fireEmergencyTriggered } from '../lib/ops/dazeHubEventBus';
import { triggerEmergencyLockdown, enterpriseSecuritySuiteStatus } from '../lib/security/enterpriseSecuritySuite';
import { emergencyEvacuationStatus } from '../lib/security/emergencyEvacuationOrchestrator';

// ============================================================================
// 👑 SADELEŞTİRİLMİŞ CEO KOMUTA MERKEZİ — Patron için 4 sütunlu yalın panel
// 1. Nakit & Finans • 2. Tesis Nabzı • 3. Onay Kuyruğu • 4. Hızlı Aksiyonlar
// Plan Z güvenli; deterministik.
// ============================================================================

const COLUMN: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' };

export default function ExecutiveSimplifiedHud() {
  const court = occupancySnapshot('PZ-KORT', 'Kort Zonu', 6, 5);
  const rest = occupancySnapshot('PZ-REST', 'Restoran', 40, 22);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(2,6,23,0.95), rgba(13,19,34,0.98))', border: '1px solid rgba(129,140,248,0.4)', borderRadius: '18px', padding: '18px', boxShadow: '0 0 34px rgba(129,140,248,0.12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>👑 Patron Paneli</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>{footfallCounterEngineStatus()} • {enterpriseSecuritySuiteStatus()}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)' }}>🟢 SİSTEM CANLI</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '12px' }}>
        {/* 1. NAKİT & FİNANS */}
        <div style={COLUMN}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#4ade80' }}>💰 NAKİT & FİNANS</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>₺24.680</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.7 }}>
            Günlük net ciro • Aidat tahsilat: <b style={{ color: '#4ade80' }}>%87</b><br />
            Geciken veli: <b style={{ color: '#f87171' }}>3</b> • Oto çekim: <b>12/14</b>
          </div>
        </div>

        {/* 2. TESİS NABZI */}
        <div style={COLUMN}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee' }}>🌡️ TESİS NABZI</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{court.current + rest.current} <span style={{ fontSize: '12px', color: '#64748b' }}>kişi içeride</span></div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.7 }}>
            Kort doluluk: <b style={{ color: court.over85 ? '#f87171' : '#4ade80' }}>%{court.occupancyPct}</b> • Restoran: %{rest.occupancyPct}<br />
            Güvenlik: <b style={{ color: '#4ade80' }}>NOMINAL</b> (YOLOv11)
          </div>
        </div>

        {/* 3. ONAY KUYRUĞU */}
        <div style={COLUMN}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>📥 ONAY KUYRUĞU</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>2 <span style={{ fontSize: '12px', color: '#64748b' }}>bekleyen</span></div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.7 }}>
            • <b>₺4.500</b> jeneratör bakımı<br />
            • <b>Kaş Deniz Otel</b> B2B teklifi
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button style={miniBtn('#4ade80')}>✓ Onayla</button>
              <button style={miniBtn('#f87171')}>✕ Reddet</button>
            </div>
          </div>
        </div>

        {/* 4. HIZLI AKSİYONLAR */}
        <div style={COLUMN}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#f0abfc' }}>⚡ HIZLI AKSİYONLAR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { fireEmergencyTriggered('Komut Merkezi', 1, { x1: 0, y1: 0, x2: 100, y2: 100 }); }} style={actBtn('#f87171')}>🔥 Yangın Tatbikatı</button>
            <button onClick={() => { void dailyDigestNote(); }} style={actBtn('#fbbf24')}>🌙 23:59 Gece Raporu</button>
            <button onClick={() => { triggerEmergencyLockdown('Patron manuel kilit'); }} style={actBtn('#a78bfa')}>🔒 Acil Kilitleme</button>
          </div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>{emergencyEvacuationStatus()}</div>
        </div>
      </div>
    </div>
  );
}

function dailyDigestNote(): string {
  return '🌙 Gece raporu (23:59) — ciro/doluluk/bakım markdown bülteni WhatsApp üzerinden iletilecek.';
}

const miniBtn = (color: string): React.CSSProperties => ({ fontSize: '9px', fontWeight: 800, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: `${color}22`, color });
const actBtn = (color: string): React.CSSProperties => ({ fontSize: '10px', fontWeight: 800, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${color}55`, background: `${color}11`, color, cursor: 'pointer' });
