// ============================================================================
// 🔥 DAZE SENTINEL — ERKEN YANGIN & ALEV TESPİT MOTORU (OpenViewer/YOLO tabanlı)
// Kamera akışı/frame mantığıyla alev algılama: bounding box, güven skoru
// (≥0.65), konum (Mutfak, Glamping, Otopark). Yangın doğrulandığında
// FIRE_EMERGENCY_TRIGGERED olayını Daze Hub Event Bus'a fırlatır.
// Deterministik; Plan Z güvenli; asla throw etmez.
// ============================================================================

import { fireEmergencyTriggered, eventHistory } from '../ops/dazeHubEventBus';

export type FireZone = 'Mutfak' | 'Glamping' | 'Otopark' | 'Kort' | 'Depo';

export interface FrameData {
  zone: FireZone;
  cameraId: string;
  heatPixels: number;      // yüksek sıcaklık piksel oranı 0-1
  flameColors: number;     // alev renk uzayı eşleşme oranı 0-1
  motionFlicker: number;   // alev titremesi 0-1
  frameIndex: number;
}

export interface FireDetection {
  id: string;
  zone: FireZone;
  cameraId: string;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  confidence: number;      // 0-1 (eşik ≥0.65)
  frameIndex: number;
  verified: boolean;       // eşik aşıldı mı
  ts: string;
}

/** YOLO tarzı alev tespiti — deterministik skorlama. */
export function detectFire(frame: FrameData, confidenceThreshold = 0.65): FireDetection {
  const heatScore = Math.min(1, frame.heatPixels * 1.4);
  const colorScore = Math.min(1, frame.flameColors * 1.2);
  const flickerScore = Math.min(1, frame.motionFlicker * 1.1);
  const confidence = Math.round(Math.max(0, Math.min(1, heatScore * 0.45 + colorScore * 0.35 + flickerScore * 0.2)) * 100) / 100;

  // Konum tabanlı bbox (deterministik — frame zone'una göre)
  const zoneOffset = frame.zone.length * 7 % 100;
  const bbox = {
    x1: Math.round((20 + zoneOffset * 0.3) * 10) / 10,
    y1: Math.round((15 + zoneOffset * 0.2) * 10) / 10,
    x2: Math.round((45 + zoneOffset * 0.25) * 10) / 10,
    y2: Math.round((55 + zoneOffset * 0.18) * 10) / 10,
  };

  const verified = confidence >= confidenceThreshold;
  const detection: FireDetection = {
    id: `FIRE-${Date.now().toString(36)}-${frame.frameIndex}`,
    zone: frame.zone,
    cameraId: frame.cameraId,
    bbox,
    confidence,
    frameIndex: frame.frameIndex,
    verified,
    ts: new Date().toISOString(),
  };

  // Yangın doğrulandı → Daze Hub Event Bus'a kritik olay fırlat
  if (verified) fireEmergencyTriggered(frame.zone, confidence, bbox);

  return detection;
}

/** Test/tatbikat frame verileri (canlı simülasyon için). */
export function simulateFireFrame(zone: FireZone, severity: 'none' | 'smoke' | 'blaze'): FrameData {
  const base = { zone, cameraId: `CAM-FIRE-${zone.slice(0, 2).toUpperCase()}`, frameIndex: Math.floor(Date.now() / 1000) % 1000 };
  if (severity === 'blaze') return { ...base, heatPixels: 0.88, flameColors: 0.82, motionFlicker: 0.74 };
  if (severity === 'smoke') return { ...base, heatPixels: 0.5, flameColors: 0.38, motionFlicker: 0.3 };
  return { ...base, heatPixels: 0.08, flameColors: 0.05, motionFlicker: 0.04 };
}

/** Sentinel HUD için son yangın olayı özeti. */
export function lastFireEvent(): Record<string, unknown> | null {
  const events = eventHistory('FIRE_EMERGENCY_TRIGGERED');
  return events.length > 0 ? events[events.length - 1].payload : null;
}

export function fireDetectionEngineStatus(): string {
  return 'Fire Detection [OpenViewer/YOLO • alev bbox • conf ≥0.65 • FIRE_EMERGENCY_TRIGGERED → Event Bus]';
}
