// ============================================================================
// 🎿 EKSTREM SPOR SİMÜLATÖR ADAPTÖRÜ — Dry-Ski • Indoor Rowing • Wave Pool
// Seansları, ekipman durumunu ve sporcu performansını yöneten simülatör.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type SimulatorKind = 'dry-ski' | 'rowing' | 'wave-pool';

export interface SimulatorUnit {
  id: string;
  kind: SimulatorKind;
  name: string;
  capacity: number;
  equipmentStatus: 'hazir' | 'bakim' | 'dolu';
  hourlyRate: number;
  safetyScore: number; // 0-100
}

export interface SimSession {
  id: string;
  kind: SimulatorKind;
  athlete: string;
  durationMin: number;
  performanceScore: number;
  metrics: Record<string, number>;
}

export const SIMULATOR_UNITS: SimulatorUnit[] = [
  { id: 'dry-ski-1', kind: 'dry-ski', name: 'Sentetik Kayak Pisti (Dry-Ski)', capacity: 8, equipmentStatus: 'hazir', hourlyRate: 250, safetyScore: 96 },
  { id: 'rowing-1', kind: 'rowing', name: 'Kapalı Kürek Havuzu (Indoor Rowing)', capacity: 12, equipmentStatus: 'hazir', hourlyRate: 180, safetyScore: 94 },
  { id: 'wave-1', kind: 'wave-pool', name: 'Dalga Havuzu (Wave Pool)', capacity: 24, equipmentStatus: 'bakim', hourlyRate: 300, safetyScore: 88 },
];

// Deterministik seans simülasyonu (tür bazlı metrikler)
export function simulateSession(kind: SimulatorKind, athlete: string, durationMin = 30): SimSession {
  const seed = kind.length + athlete.length + durationMin;
  let metrics: Record<string, number>;
  switch (kind) {
    case 'dry-ski':
      metrics = { maxSlopeDeg: 22 + (seed % 8), turnsPerMin: 6 + (seed % 6), balanceScore: 70 + (seed % 25) };
      break;
    case 'rowing':
      metrics = { splitPer500m: 108 + (seed % 14), strokesPerMin: 26 + (seed % 6), powerWatts: 180 + (seed % 90) };
      break;
    default:
      metrics = { waveHeightM: 1.2 + (seed % 6) / 10, rideSeconds: 8 + (seed % 9), aerialScore: 55 + (seed % 30) };
  }
  const performanceScore = Math.min(100, Math.round(62 + (seed % 35)));
  return {
    id: `sim_${Date.now().toString(36)}`,
    kind,
    athlete,
    durationMin,
    performanceScore,
    metrics,
  };
}

// Ekipman durumu güncelle (deterministik state)
export function setEquipmentStatus(id: string, status: SimulatorUnit['equipmentStatus']): { ok: boolean; unit?: SimulatorUnit; message: string } {
  const unit = SIMULATOR_UNITS.find((u) => u.id === id);
  if (!unit) return { ok: false, message: 'Birim bulunamadı' };
  unit.equipmentStatus = status;
  return { ok: true, unit, message: `${unit.name} → ${status}` };
}

export function simulatorsStatus(): string {
  return `Ekstrem Simülatör [Dry-Ski • Rowing • Wave Pool • 3 ünite, ${SIMULATOR_UNITS.filter((u) => u.equipmentStatus === 'hazir').length} hazır]`;
}
