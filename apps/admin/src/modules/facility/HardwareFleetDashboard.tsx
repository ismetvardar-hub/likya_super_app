'use client';

import React, { useState } from 'react';
import {
  fleetMaintenanceAlerts,
  fleetSummary,
  buildOtaRolloutSchedule,
  approveAcademyRollout,
  canApproveAcademyRollout,
  classifyBatterySoc,
  type FleetDevice,
  type FleetSeverity,
} from '../../app/lib/hardware/hardwareFleetManager.ts';

// ============================================================================
// 🔧 DONANIM FİLO SAĞLIĞI PANOSU (Adım 116)
// 50+ BLE cihazın pil SoC, şarj döngüsü, firmware drift ve membran bozulma
// indekslerini merkezden izler; bakım uyarıları üretir ve Canary → Akademi
// kademeli OTA rollout zamanlamasını gösterir. Motor: hardwareFleetManager.ts
// ============================================================================

const severityColor: Record<FleetSeverity, string> = {
  info: '#94a3b8',
  warning: '#F27A1A',
  critical: '#F43F5E',
};

function sampleFleet(): FleetDevice[] {
  const mk = (i: number, kind: FleetDevice['kind'], setTag: string, soc: number, membrane: number, fw: string, deg: number): FleetDevice => ({
    deviceId: `dev-${i}`,
    kind,
    setTag,
    batterySoC: soc,
    charging: i % 9 === 0,
    chargingCycles: 20 + i * 7,
    firmwareVersion: fw,
    targetFirmwareVersion: 'v2.4.1',
    membraneDegradationPct: membrane,
    degradationIndex: deg,
    lastSeenAt: new Date().toISOString(),
  });
  return [
    mk(1, 'insole', 'Insole Set #01', 82, 6, 'v2.4.1', 0.12),
    mk(2, 'insole', 'Insole Set #02', 58, 11, 'v2.4.1', 0.2),
    mk(3, 'insole', 'Insole Set #03', 91, 4, 'v2.4.1', 0.08),
    mk(4, 'insole', 'Insole Set #04', 12, 9, 'v2.4.1', 0.15),
    mk(5, 'insole', 'Insole Set #05', 74, 7, 'v2.3.0', 0.18),
    mk(6, 'insole', 'Insole Set #06', 88, 5, 'v2.4.1', 0.1),
    mk(7, 'insole', 'Insole Set #07', 43, 13, 'v2.4.1', 0.22),
    mk(8, 'insole', 'Insole Set #08', 67, 22, 'v2.3.0', 0.35),
    mk(9, 'insole', 'Insole Set #09', 4, 18, 'v2.3.0', 0.85),
    mk(10, 'hrm', 'HRM #A', 79, 0, 'v2.4.1', 0.05),
    mk(11, 'hrm', 'HRM #B', 6, 0, 'v2.4.1', 0.06),
    mk(12, 'armband', 'Armband #1', 71, 0, 'v2.4.1', 0.09),
  ];
}

export default function HardwareFleetDashboard() {
  const [devices] = useState<FleetDevice[]>(sampleFleet);
  const [otaDeployed, setOtaDeployed] = useState(false);

  const alerts = fleetMaintenanceAlerts(devices);
  const summary = fleetSummary(devices);
  const schedule = buildOtaRolloutSchedule(devices);
  const canaryHealthy = canApproveAcademyRollout({ successRatePct: 98 });
  const academyPlan = otaDeployed ? { ...schedule.academy, status: 'deployed' as const, gated: false } : approveAcademyRollout(schedule.academy, { successRatePct: 98 });

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe', marginBottom: 8 }}>🔧 Donanım Filosu Sağlığı ({summary.total} cihaz)</div>

      {/* Özet */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, fontSize: 9, color: '#94a3b8' }}>
        <span>Ort. SoC: <b style={{ color: '#e2e8f0' }}>%{summary.avgSocPct}</b></span>
        <span>Düşük pil: <b style={{ color: '#F27A1A' }}>{summary.lowBatteryCount}</b></span>
        <span>Firmware eski: <b style={{ color: '#8B5CF6' }}>{summary.outOfDateFirmwareCount}</b></span>
        <span>Bozulmuş: <b style={{ color: '#F43F5E' }}>{summary.degradedCount}</b></span>
        <span>Sağlıklı: <b style={{ color: '#10B981' }}>{summary.healthyCount}</b></span>
      </div>

      {/* Cihaz ızgarası */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6, marginBottom: 10 }}>
        {devices.map((d) => {
          const soc = classifyBatterySoc(d.batterySoC, d.charging);
          return (
            <div key={d.deviceId} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 6, fontSize: 8 }}>
              <div style={{ fontWeight: 800, color: '#e2e8f0' }}>{d.setTag}</div>
              <div style={{ color: soc === 'normal' ? '#10B981' : '#F27A1A' }}>
                Pil %{d.batterySoC} · {d.chargingCycles} döngü{d.charging ? ' · ⚡' : ''}
              </div>
              <div style={{ color: '#64748b' }}>FW {d.firmwareVersion} · Membran %{d.membraneDegradationPct}</div>
            </div>
          );
        })}
      </div>

      {/* Uyarılar */}
      <div style={{ fontSize: 9, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>🚨 Bakım Uyarıları ({alerts.length})</div>
      {alerts.slice(0, 8).map((a, i) => (
        <div key={i} style={{ fontSize: 8, color: severityColor[a.severity], marginBottom: 3 }}>• {a.message}</div>
      ))}

      {/* OTA rollout */}
      <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8, marginTop: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#8B5CF6', marginBottom: 4 }}>📦 OTA Rollout — hedef {schedule.canary.targetFirmwareVersion}</div>
        <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>
          Canary ({schedule.canary.deviceIds.length}): {schedule.canary.status} · Akademi ({schedule.academy.deviceIds.length}): {academyPlan.status} {academyPlan.gated ? '🔒 (Canary başarısı bekleniyor)' : '✓ (onaylı)'}
        </div>
        <button onClick={() => setOtaDeployed((v) => !v)} style={mini}>
          {otaDeployed ? '↩️ Rollout Sıfırla' : `🚀 Akademi Rollout'unu ${canaryHealthy ? 'Yayınla' : 'Beklet'} (Canary %98)`}
        </button>
      </div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
