// ============================================================================
// 🔗 MULTİMODAL 3'LÜ FÜZYON KÖPRÜSÜ — SportVisionX x Pazu Bandı x Akıllı Tabanlık
// Tepe Kamerası (Mekânsal Konum) + Pazu Bandı (Kol/Gövde İvmesi) + Tabanlık
// (Zemin Temas & Ayak Basıncı) tek bir güvenilir sporcu durum modeline birleşir.
// - Fuzyon skoru: 3 sensör aynı anda doğrularsa güven maksimize edilir
// - Yorgunluk zonu: GCT + ivme + konum sapması çapraz doğrulanır
// ============================================================================

import { matchPlayerToBeacon } from './armbandCoachingBridge';
import { classifyGait, gaitLabel, insoleRiskRadar, type InsoleTelemetry, type InsoleAlert } from './smartInsoleEngine';
import type { ArmbandDevice } from '../hardware/smartArmbandEngine';

export interface CameraObservation {
  trackingId: string;
  court: string;
  speedMps: number;        // mekânsal hız (m/s)
  displacementM: number;   // toplam yer değiştirme
}

export interface FusionSnapshot {
  athleteId: string;
  camera: CameraObservation;
  armband: { matched: boolean; confidencePct: number };
  insole: InsoleTelemetry;
  fusionScore: number;         // 0-100 (3 sensör doğrulama yüzdesi)
  fatigueZone: 'GREEN' | 'YELLOW' | 'RED';
  alerts: InsoleAlert[];
  summary: string;
}

// ---------------------------------------------------------------------------
// 1. 3'lü füzyon — kamera + BLE + tabanlık çapraz doğrulaması
// ---------------------------------------------------------------------------
export function fuseSensorStream(
  athleteId: string,
  camera: CameraObservation,
  bleUuid: string,
  bands: ArmbandDevice[],
  insole: InsoleTelemetry,
): FusionSnapshot {
  const beacon = matchPlayerToBeacon(camera.trackingId, bleUuid, bands);
  const alerts = insoleRiskRadar(insole);

  // Füzyon skoru: kamera+BLE eşleşmesi (%60) + tabanlık verisi (%40)
  const identityScore = beacon.matched ? 60 : 20;
  const gaitOk = insole.gaitType === 'NEUTRAL' ? 20 : insole.gaitType === 'PRONATION' ? 10 : 10;
  const gctOk = insole.gctMs <= 220 ? 20 : 5;
  const fusionScore = Math.min(100, identityScore + gaitOk + gctOk);

  // Yorgunluk zonu: GCT + hız düşüşü + asimetri çapraz doğrulama
  let fatigueZone: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  let crossed = 0;
  if (insole.gctMs > 220) crossed += 1;
  if (insole.stepAsymmetry > 10) crossed += 1;
  if (camera.speedMps < 3.0 && camera.displacementM > 50) crossed += 1;
  if (insole.loadingRate > 150) crossed += 2;
  fatigueZone = crossed >= 3 ? 'RED' : crossed >= 1 ? 'YELLOW' : 'GREEN';

  const summary =
    `🎯 ${athleteId}: ${gaitLabel(insole.gaitType)} • GCT ${insole.gctMs}ms (${insole.gctMs < 185 ? 'Elit' : insole.gctMs < 220 ? 'İyi' : 'Yorgun'}) • ` +
    `RSI ${insole.rsi} • Asimetri %${insole.stepAsymmetry} • ${beacon.matched ? `BLE doğrulandı (%${beacon.confidencePct})` : 'BLE eşleşme yok'}`;

  return { athleteId, camera, armband: { matched: beacon.matched, confidencePct: beacon.confidencePct }, insole, fusionScore, fatigueZone, alerts, summary };
}

// ---------------------------------------------------------------------------
// 2. Zon ağırlıklı koçluk kararı
// ---------------------------------------------------------------------------
export function coachGuidance(zone: 'GREEN' | 'YELLOW' | 'RED', alerts: InsoleAlert[]): string {
  if (zone === 'RED') return '⛔ Kırmızı Zon: Seansı durdur, sakatlık riski kritik — değerlendirme için fizyoterapiste yönlendir';
  if (zone === 'YELLOW') return `⚠️ Sarı Zon: Yoğunluğu %30 azalt + molayı uzat (${alerts.map((a) => a.code).join(', ')})`;
  return '✅ Yeşil Zon: Formda — teknik çalışma hacmini artırabilirsin';
}

export function multimodalFusionStatus(): string {
  return 'Füzyon Köprüsü: Tepe Kamerası + Pazu Bandı + Akıllı Tabanlık senkron';
}
