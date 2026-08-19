'use client';

import React, { useState } from 'react';
import { buildCameraMatrix, createPpeCheck, sentinelVisionEngineStatus, type MultiCamStreamMatrix, type PPESafetyCompliance, type CamState, type CamChannel } from '../lib/security/sentinelVisionEngine';
import { diagnoseEquipment, equipmentDiagnosticEngineStatus, type EquipmentDiagnosis } from '../lib/ops/equipmentDiagnosticEngine';
import { detectFire, simulateFireFrame, fireDetectionEngineStatus, type FireDetection, type FireZone } from '../lib/security/fireDetectionEngine';
import { orchestrateFireEvacuation, emergencyEvacuationStatus, type EvacuationResult } from '../lib/security/emergencyEvacuationOrchestrator';

// ============================================================================
// 👁️ SENTINEL VISION GRID — Sanal Kamera Matrisi + İSG Denetim Izgarası
// + Görsel/Telemetri hibrit ekipman teşhisi + 🔥 Alev/Yangın tespit + tatbikat.
// DazeSentinelHud (monitor view) ile birlikte render edilir. Plan Z güvenli.
// ============================================================================

export default function SentinelVisionGrid() {
  const [matrix, setMatrix] = useState<MultiCamStreamMatrix>(() => buildCameraMatrix());
  const [ppe, setPpe] = useState<PPESafetyCompliance[]>(() => [
    createPpeCheck({ workerId: 'W-01', helmetDetected: true, vestDetected: true }),
    createPpeCheck({ workerId: 'W-02', helmetDetected: false, vestDetected: true }),
    createPpeCheck({ workerId: 'W-03', helmetDetected: true, vestDetected: true }),
  ]);
  const [diagnosis, setDiagnosis] = useState<EquipmentDiagnosis | null>(null);
  const [fire, setFire] = useState<FireDetection | null>(null);
  const [evacuation, setEvacuation] = useState<EvacuationResult | null>(null);
  const [drillBusy, setDrillBusy] = useState(false);

  const simulateAlerts = () => {
    setPpe((prev) => [createPpeCheck({ workerId: 'W-04', helmetDetected: Math.random() > 0.4, vestDetected: Math.random() > 0.3 }), ...prev].slice(0, 4));
    const states: Partial<Record<CamChannel, CamState>> = {};
    (['CAM-1', 'CAM-2', 'CAM-3', 'CAM-4'] as CamChannel[]).forEach((c) => {
      const r = Math.random();
      states[c] = r > 0.9 ? 'NOISE' : r > 0.97 ? 'OFFLINE' : 'STREAMING';
    });
    setMatrix(buildCameraMatrix(states));
    setDiagnosis(diagnoseEquipment('EQ-07', 'Jeneratör B', { vibrationMmS: 8.6, rpm: 1450, tempC: 72 }, { wearScore: 0.82, crackScore: 0.1 }));
  };

  const runFireDrill = async () => {
    setDrillBusy(true);
    const zone: FireZone = (['Mutfak', 'Glamping', 'Otopark', 'Kort', 'Depo'] as FireZone[])[Math.floor(Math.random() * 5)];
    const frame = simulateFireFrame(zone, 'blaze');
    const detection = detectFire(frame, 0.65);
    setFire(detection);
    if (detection.verified) {
      const evc = await orchestrateFireEvacuation(detection);
      setEvacuation(evc);
    } else {
      setEvacuation(null);
    }
    setDrillBusy(false);
  };

  const overallColor = matrix.overall === 'NOMINAL' ? '#4ade80' : matrix.overall === 'DEGRADED' ? '#fbbf24' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '16px', padding: '14px', fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8', letterSpacing: '1px' }}>👁️ SENTINEL VISION — SANAL KAMERA GRID</div>
          <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>{sentinelVisionEngineStatus()} • {equipmentDiagnosticEngineStatus()} • {fireDetectionEngineStatus()}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, color: overallColor }}>MATRİS: {matrix.overall}</span>
          <button onClick={simulateAlerts} style={{ fontSize: '10px', fontWeight: 800, padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.5)', cursor: 'pointer', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontFamily: 'inherit' }}>🎥 TARAMA</button>
          <button onClick={() => void runFireDrill()} disabled={drillBusy} style={{ fontSize: '10px', fontWeight: 900, padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.6)', cursor: drillBusy ? 'wait' : 'pointer', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontFamily: 'inherit' }}>🔥 SANAL YANGIN TATBİKATI</button>
        </div>
      </div>

      {/* 4 KANALLI KAMERA MATRİSİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
        {matrix.channels.map((c) => (
          <div key={c.channel} style={{ background: c.state === 'OFFLINE' ? 'rgba(239,68,68,0.08)' : c.state === 'NOISE' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${c.state === 'OFFLINE' ? 'rgba(239,68,68,0.4)' : c.state === 'NOISE' ? 'rgba(245,158,11,0.4)' : 'rgba(56,189,248,0.25)'}`, borderRadius: '12px', padding: '10px', minHeight: 96 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: '#38bdf8' }}>{c.channel}</span>
              <span style={{ fontSize: '8px', color: c.state === 'STREAMING' ? '#4ade80' : c.state === 'NOISE' ? '#fbbf24' : '#f87171', fontWeight: 800 }}>{c.state === 'STREAMING' ? '● CANLI' : c.state}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#e2e8f0', margin: '6px 0' }}>{c.name}</div>
            <div style={{ fontSize: '8px', color: '#475569' }}>{c.fps} fps • {c.lastEvent}</div>
            <div style={{ marginTop: '8px', height: 34, borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '30%', top: '20%', width: '22%', height: '60%', border: '1px solid rgba(56,189,248,0.7)', borderRadius: '4px' }} />
              <div style={{ position: 'absolute', left: '58%', top: '35%', width: '18%', height: '45%', border: '1px solid rgba(74,222,128,0.6)', borderRadius: '4px' }} />
              <div style={{ position: 'absolute', left: '38%', top: '12%', fontSize: '7px', color: '#38bdf8' }}>HUMAN 0.94</div>
            </div>
          </div>
        ))}
      </div>

      {/* İSG DENETİM IZGARASI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#7dd3fc', letterSpacing: '1px' }}>İSG KASK/YELEK DENETİMİ</div>
        {ppe.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.status === 'Compliant' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.4)'}` }}>
            <span style={{ color: '#e2e8f0' }}>{p.workerId} • {p.cameraId}</span>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>Kask {p.helmetDetected ? '✅' : '❌'} Yelek {p.vestDetected ? '✅' : '❌'}</span>
              <b style={{ color: p.status === 'Compliant' ? '#4ade80' : '#f87171' }}>{p.status === 'Compliant' ? 'UYUMLU' : `İHLAL: ${p.violationType}`}</b>
            </span>
          </div>
        ))}
      </div>

      {/* EKİPMAN TEŞHİSİ */}
      {diagnosis && (
        <div style={{ background: diagnosis.fault === 'NOMINAL' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.08)', border: `1px solid ${diagnosis.fault === 'NOMINAL' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.4)'}`, borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.6 }}>
          <b style={{ color: '#f87171' }}>⚙️ {diagnosis.equipmentName} → {diagnosis.fault}</b> (güven {Math.round(diagnosis.confidence * 100)}%) • titr {diagnosis.telemetry.vibrationMmS.toFixed(1)}mm/s • {diagnosis.telemetry.tempC}°C • aşınma %{(diagnosis.visual.wearScore * 100).toFixed(0)}
          <br />
          {diagnosis.details.map((d) => <span key={d}>• {d}<br /></span>)}
          {diagnosis.maintenanceTaskId && <span style={{ color: '#fbbf24' }}>🧰 Görev: {diagnosis.maintenanceTaskId}</span>}
        </div>
      )}

      {/* 🔥 ALEV/YANGIN TESPİT + TAHLİYE */}
      {fire && (
        <div style={{ background: fire.verified ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.08)', border: `1px solid ${fire.verified ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.4)'}`, borderRadius: '12px', padding: '10px', fontSize: '10px', color: '#e2e8f0', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 90, height: 64, borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', position: 'relative', overflow: 'hidden' }}>
              {/* Alev bbox görseli */}
              <div style={{ position: 'absolute', left: `${fire.bbox.x1 * 0.4}%`, top: `${fire.bbox.y1 * 0.4}%`, width: '38%', height: '52%', border: fire.verified ? '2px solid #ef4444' : '2px solid #fbbf24', borderRadius: '4px', boxShadow: fire.verified ? '0 0 12px rgba(239,68,68,0.7)' : 'none' }}>
                <span style={{ position: 'absolute', top: -12, left: 0, fontSize: '7px', color: '#f87171', fontWeight: 800 }}>FIRE {Math.round(fire.confidence * 100)}%</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <b style={{ color: fire.verified ? '#f87171' : '#fbbf24' }}>🔥 {fire.verified ? 'YANGIN DOĞRULANDI' : 'SİNYAL (eşik altı)'} — {fire.zone}</b> • kamera {fire.cameraId}<br />
              Güven: <b>{fire.confidence.toFixed(2)}</b> (eşik ≥0.65) • bbox [{fire.bbox.x1},{fire.bbox.y1},{fire.bbox.x2},{fire.bbox.y2}] • frame #{fire.frameIndex}
              <br />
              {fire.verified && evacuation && (
                <>
                  <span style={{ color: '#fbbf24' }}>🚨 {evacuation.evacuationId} — {emergencyEvacuationStatus()}</span><br />
                  {evacuation.steps.map((s) => <span key={s.step}>• {s.step}: {s.detail}<br /></span>)}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

