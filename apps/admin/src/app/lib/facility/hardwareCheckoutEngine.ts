// ============================================================================
// 🔒 AKILLI DOLAP & DONANIM TESLİM TAKİP MOTORU (Adım 91)
// Varlık yaşam döngüsü: Tabanlık çifti • Decathlon HRM • Akıllı Dolaplar (1-40)
// Durumlar: AVAILABLE • CHECKED_OUT • IN_USE_ON_COURT • CHARGING • NEEDS_INSPECTION
// Kort seansına girişte sporcuya otomatik dolap + seri atama.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type HardwareKind = 'insole' | 'hrm' | 'locker';
export type HardwareState = 'AVAILABLE' | 'CHECKED_OUT' | 'IN_USE_ON_COURT' | 'CHARGING' | 'NEEDS_INSPECTION';

export interface HardwareAsset {
  id: string;
  kind: HardwareKind;
  serial: string;
  state: HardwareState;
  assignedTo?: string;
}

export const HARDWARE_STATE_LABEL: Record<HardwareState, string> = {
  AVAILABLE: 'Müsait',
  CHECKED_OUT: 'Teslim Alındı',
  IN_USE_ON_COURT: 'Kortta Kullanımda',
  CHARGING: 'Şarjda',
  NEEDS_INSPECTION: 'Denetim Gerekli',
};

/** 1-40 akıllı dolap envanteri üretir. */
export function createLockerInventory(count = 40): HardwareAsset[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `locker-${i + 1}`,
    kind: 'locker' as const,
    serial: `LK-${String(i + 1).padStart(3, '0')}`,
    state: 'AVAILABLE' as const,
  }));
}

/** Tabanlık + HRM sensör envanteri üretir (çift + tek). */
export function createSensorInventory(insolePairs = 8, hrms = 8): HardwareAsset[] {
  const insoles: HardwareAsset[] = Array.from({ length: insolePairs * 2 }, (_, i) => ({
    id: `insole-${i + 1}`,
    kind: 'insole' as const,
    serial: `FSR-${String(i + 1).padStart(3, '0')}`,
    state: 'AVAILABLE' as const,
  }));
  const hrs: HardwareAsset[] = Array.from({ length: hrms }, (_, i) => ({
    id: `hrm-${i + 1}`,
    kind: 'hrm' as const,
    serial: `HRM-${String(i + 1).padStart(3, '0')}`,
    state: 'AVAILABLE' as const,
  }));
  return [...insoles, ...hrs];
}

export function setAssetState(assets: HardwareAsset[], assetId: string, state: HardwareState): HardwareAsset[] {
  return assets.map((a) => (a.id === assetId ? { ...a, state } : a));
}

/** Sporcuya teslim eder (CHECKED_OUT). */
export function checkoutToAthlete(assets: HardwareAsset[], assetId: string, athleteId: string): HardwareAsset[] {
  return assets.map((a) => (a.id === assetId ? { ...a, state: 'CHECKED_OUT', assignedTo: athleteId } : a));
}

/** Kortta kullanıma işaretler. */
export function markInUse(assets: HardwareAsset[], assetId: string): HardwareAsset[] {
  return assets.map((a) => (a.id === assetId ? { ...a, state: 'IN_USE_ON_COURT' } : a));
}

/** İade: şarja alınır. */
export function returnAsset(assets: HardwareAsset[], assetId: string): HardwareAsset[] {
  return assets.map((a) => (a.id === assetId ? { ...a, state: 'CHARGING', assignedTo: undefined } : a));
}

/** Denetim gerektiren olarak işaretler. */
export function markNeedsInspection(assets: HardwareAsset[], assetId: string): HardwareAsset[] {
  return assets.map((a) => (a.id === assetId ? { ...a, state: 'NEEDS_INSPECTION' } : a));
}

/** Seans check-in'inde sporcuya otomatik ilk müsait donanım + dolap atar. */
export function autoAssignForSession(assets: HardwareAsset[], athleteId: string, kind: HardwareKind): { asset: HardwareAsset | null; assets: HardwareAsset[] } {
  const idx = assets.findIndex((a) => a.kind === kind && a.state === 'AVAILABLE');
  if (idx < 0) return { asset: null, assets };
  const assigned: HardwareAsset = { ...assets[idx], state: 'CHECKED_OUT', assignedTo: athleteId };
  const next = assets.map((a, i) => (i === idx ? assigned : a));
  return { asset: assigned, assets: next };
}

export function inventorySummary(assets: HardwareAsset[]): Record<HardwareState, number> {
  const summary: Record<HardwareState, number> = { AVAILABLE: 0, CHECKED_OUT: 0, IN_USE_ON_COURT: 0, CHARGING: 0, NEEDS_INSPECTION: 0 };
  for (const a of assets) summary[a.state]++;
  return summary;
}

export function hardwareCheckoutStatus(): string {
  return 'Donanım Teslim: dolap/tabanlık/HRM • 5 durum • otomatik seans atama';
}
