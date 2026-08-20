// ============================================================================
// 📈 BANISTER EXP-TRIMP MOTORU (Adım 38) — bilimsel antrenman yükü
// TRIMP = D × ΔHR × 0.64 × e^(y × ΔHR)
//   ΔHR = (HR_mean − HR_rest) / (HR_max − HR_rest)
//   y = 1.92 (erkek) veya 1.67 (kadın), D = süre (dk)
// Kategoriler: Recovery <50 • Maintenance 50-120 • Overload 120-250 • Extreme >250
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type TrimpCategory = 'Recovery' | 'Maintenance' | 'Overload' | 'Extreme';
export type TrimpSex = 'M' | 'F';

export const TRIMP_Y_MALE = 1.92;
export const TRIMP_Y_FEMALE = 1.67;
export const TRIMP_SCALE = 0.64;

export interface TrimpInput {
  durationMin: number;
  avgHr: number;
  restHr: number;
  maxHr: number;
  sex?: TrimpSex;
}

export interface TrimpResult {
  trimp: number;
  deltaHr: number;
  category: TrimpCategory;
  label: string;
  note: string;
}

/** Banister TRIMP: TRIMP = D × ΔHR × 0.64 × e^(y × ΔHR). */
export function computeBanisterTrimp(input: TrimpInput): TrimpResult {
  const { durationMin, avgHr, restHr, maxHr, sex = 'M' } = input;
  const hrRange = Math.max(1, maxHr - restHr);
  const deltaHr = Math.max(0, Math.min(1, (avgHr - restHr) / hrRange));
  const y = sex === 'F' ? TRIMP_Y_FEMALE : TRIMP_Y_MALE;
  const trimp = Math.round(durationMin * deltaHr * TRIMP_SCALE * Math.exp(y * deltaHr));

  let category: TrimpCategory;
  if (trimp > 250) category = 'Extreme';
  else if (trimp >= 120) category = 'Overload';
  else if (trimp >= 50) category = 'Maintenance';
  else category = 'Recovery';

  const label: Record<TrimpCategory, string> = {
    Recovery: 'Toparlanma',
    Maintenance: 'Koruma',
    Overload: 'Yüklenme',
    Extreme: 'Aşırı Yük',
  };
  const note =
    category === 'Extreme'
      ? `🚨 TRIMP ${trimp} — aşırı yük; 72h toparlanma + yük azaltımı şart`
      : category === 'Overload'
        ? `⚠️ TRIMP ${trimp} — belirgin yüklenme; 48h toparlanma planla`
        : category === 'Maintenance'
          ? `✅ TRIMP ${trimp} — kondisyon koruma bandında (50-120)`
          : `ℹ️ TRIMP ${trimp} — hafif/aktif toparlanma seansı`;
  return { trimp, deltaHr: Number(deltaHr.toFixed(3)), category, label: label[category], note };
}

export function trimpEngineStatus(): string {
  return `Banister TRIMP: D·ΔHR·${TRIMP_SCALE}·e^(y·ΔHR) • y M=1.92/F=1.67 • <50/50-120/120-250/>250`;
}
