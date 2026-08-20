'use client';

import React, { useState } from 'react';
import {
  evaluateTriage,
  buildMedicalIncidentReport,
  EmergencyTriageCoordinator,
  type TelemetryFrameSnapshot,
  type TriageResult,
  type MedicalIncidentReport,
} from '../../app/lib/medical/emergencyTriageEngine.ts';

// ============================================================================
// 🚑 ACİL SAKATLIK TRİYAJ MODALI (Adım 134)
// Kort içi tıbbi olay koordinatörü: akut deselerasyon / asimetrik yük / ani
// kinetik duruş tetikleyicileri → PEACE & LOVE / RICE protokolü + zaman damgalı
// GRF-kinematik tıbbi olay raporu. Motor: emergencyTriageEngine.ts
// ============================================================================

export interface EmergencyTriageModalProps {
  open: boolean;
  onClose: () => void;
  athleteId?: string;
  snapshot?: TelemetryFrameSnapshot;
}

function demoSnapshot(tsMs: number, overrides: Partial<TelemetryFrameSnapshot>): TelemetryFrameSnapshot {
  return { tsMs, grfBw: 2.1, decelAccel: 4.2, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 4.0, ...overrides };
}

export default function EmergencyTriageModal({ open, onClose, athleteId = 'at_u14_01', snapshot }: EmergencyTriageModalProps) {
  const [coordinator] = useState<EmergencyTriageCoordinator>(() => new EmergencyTriageCoordinator());
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [report, setReport] = useState<MedicalIncidentReport | null>(null);
  const [incidentCount, setIncidentCount] = useState(0);

  if (!open) return null;

  function evaluate(snap: TelemetryFrameSnapshot) {
    const { triage: t, report: r } = coordinator.ingest(snap, athleteId);
    setTriage(t);
    setReport(r);
    setIncidentCount(coordinator.history().length);
  }

  function demoDecel() {
    evaluate(demoSnapshot(Date.now(), { decelAccel: 7.8, grfBw: 2.9 }));
  }
  function demoAsymmetry() {
    evaluate(demoSnapshot(Date.now(), { leftLoadPct: 68, rightLoadPct: 32 }));
  }
  function demoCessation() {
    evaluate(demoSnapshot(Date.now(), { velocityZ: 0.2, decelAccel: 9.1 }));
  }

  const severityColor = { info: '#94a3b8', warning: '#F27A1A', emergency: '#F43F5E' } as const;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: 440, maxWidth: '92vw', background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#F43F5E' }}>🚑 Acil Tıbbi Triyaj</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Demo tetikleyiciler */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={demoDecel} style={mini}>💥 Desel 7.8 m/s²</button>
          <button onClick={demoAsymmetry} style={mini}>⚖️ Asimetri %36</button>
          <button onClick={demoCessation} style={mini}>⏹ Ani Duruş</button>
        </div>

        {triage && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: severityColor[triage.severity] }}>
              {triage.triage === 'NONE' ? '✅ Tetikleyici yok' : `${triage.triage} · ${triage.severity.toUpperCase()}`}
            </div>
            {triage.triggers.map((t, i) => (
              <div key={i} style={{ fontSize: 9, color: '#F27A1A', marginTop: 3 }}>⚠️ {t}</div>
            ))}
          </div>
        )}

        {report && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>📋 Tıbbi Olay Raporu — {report.reportId}</div>
            <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4 }}>
              Sporcu {report.athleteId} · t={report.tsMs}ms · GRF {report.impact.grfBw} BW · desel {report.impact.decelAccel} m/s² · asimetri %{report.impact.asymmetryPct}
            </div>
            <div style={{ fontSize: 8, fontWeight: 800, color: report.protocol.protocol === 'PEACE_LOVE' ? '#10B981' : '#00f2fe', marginBottom: 2 }}>
              Protokol: {report.protocol.protocol}
            </div>
            {report.protocol.steps.slice(0, 5).map((s, i) => (
              <div key={i} style={{ fontSize: 8, color: '#64748b' }}>• {s}</div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 8, color: '#64748b' }}>Kayıtlı olay sayısı: {incidentCount} · Triyaj geçmişi koordinatörde tutulur.</div>
      </div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
const closeBtn: React.CSSProperties = { fontSize: 12, fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' };
