// ============================================================================
// ⚙️ DAZE HİBRİT MOTOR — GÖRSEL + TELEMETRİ EKİPMAN TEŞHİSİ
// Görsel analiz (çatlak/aşınma görsel skoru) + Telemetri (Titreşim, RPM,
// Sıcaklık) birleşimiyle arıza teşhisi: Kayış Aşınması, Aşırı Isınma,
// Titreşim Anomalisi → acil bakım görevi tetikleme. Deterministik; Plan Z.
// ============================================================================

import { staffTaskDispatched } from './dazeHubEventBus';
import { criticalFacilityPush } from '../pwa/notificationEngine';

export type FaultKind = 'BELT_WEAR' | 'OVERHEATING' | 'VIBRATION_ANOMALY' | 'NOMINAL';

export interface TelemetrySample {
  vibrationMmS: number;   // mm/s RMS titreşim
  rpm: number;
  tempC: number;
}

export interface VisualSample {
  wearScore: number;      // 0-1 görsel aşınma skoru (YOLO segmentasyon)
  crackScore: number;     // 0-1 çatlak skoru
}

export interface EquipmentDiagnosis {
  equipmentId: string;
  equipmentName: string;
  fault: FaultKind;
  confidence: number;     // 0-1
  details: string[];
  telemetry: TelemetrySample;
  visual: VisualSample;
  maintenanceTaskId: string | null;
  ts: string;
}

const THRESHOLDS = { vibration: 7.1, temp: 78, wear: 0.65, crack: 0.4 };

/** Görsel + telemetri sentezi — öncelik sırası: Belt → Heat → Vibration. */
export function diagnoseEquipment(equipmentId: string, equipmentName: string, telemetry: TelemetrySample, visual: VisualSample): EquipmentDiagnosis {
  const details: string[] = [];
  let fault: FaultKind = 'NOMINAL';
  let confidence = 0.5;

  if (visual.wearScore >= THRESHOLDS.wear || visual.crackScore >= THRESHOLDS.crack) {
    fault = 'BELT_WEAR';
    confidence = Math.min(0.98, 0.72 + visual.wearScore * 0.2 + visual.crackScore * 0.1);
    details.push(`Görsel aşınma %${(visual.wearScore * 100).toFixed(0)} / çatlak %${(visual.crackScore * 100).toFixed(0)} — kayış değişimi önerilir`);
  } else if (telemetry.tempC >= THRESHOLDS.temp) {
    fault = 'OVERHEATING';
    confidence = Math.min(0.97, 0.6 + (telemetry.tempC - THRESHOLDS.temp) / 100);
    details.push(`Sıcaklık ${telemetry.tempC}°C (eşik ${THRESHOLDS.temp}°C) — soğutma/yağlama kontrolü`);
  } else if (telemetry.vibrationMmS >= THRESHOLDS.vibration) {
    fault = 'VIBRATION_ANOMALY';
    confidence = Math.min(0.96, 0.55 + (telemetry.vibrationMmS - THRESHOLDS.vibration) / 20);
    details.push(`Titreşim ${telemetry.vibrationMmS.toFixed(1)} mm/s (eşik ${THRESHOLDS.vibration}) — yatak/dengeleme anomalisi`);
  } else {
    details.push(`Nominal: titreşim ${telemetry.vibrationMmS.toFixed(1)} mm/s • sıcaklık ${telemetry.tempC}°C • RPM ${telemetry.rpm}`);
  }

  // Acil bakım görevi tetikleme (arıza varsa)
  let maintenanceTaskId: string | null = null;
  if (fault !== 'NOMINAL') {
    maintenanceTaskId = `MT-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    staffTaskDispatched(maintenanceTaskId, `ACİL BAKIM: ${equipmentName} — ${fault}`, 0, 15);
    void criticalFacilityPush(`${equipmentName} — ${fault}`);
    details.push(`Acil bakım görevi ${maintenanceTaskId} tetiklendi + kritik tesis bildirimi`);
  }

  return { equipmentId, equipmentName, fault, confidence: Math.round(confidence * 100) / 100, details, telemetry, visual, maintenanceTaskId, ts: new Date().toISOString() };
}

export function equipmentDiagnosticEngineStatus(): string {
  return `Hibrit Teşhis Motoru [görsel+telemetri • ${Object.keys(THRESHOLDS).length} eşik • Belt/Heat/Vibration • otomatik bakım görevi]`;
}
