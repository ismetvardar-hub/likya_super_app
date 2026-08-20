// ============================================================================
// 🗺️ KORT POZİSYON ISITMA & BÖLGE KAPSAMA ANALİZÖRÜ (Adım 83)
// Taktik bölgelerde geçirilen süre: Baseline Defense, Transition, Net Attack,
// Lateral Alley. Toplam kat edilen mesafe (m) + L/R yön hareketi önyargısı.
// Kort 0-1 normalize (x: kenar çizgiden çizgiye, y: baz çizgiden file).
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface CourtZone {
  id: string;
  name: string;
}

export const COURT_ZONES: CourtZone[] = [
  { id: 'baseline-defense', name: 'Baz Çizgi Savunması' },
  { id: 'transition', name: 'Geçiş Orta Kort' },
  { id: 'net-attack', name: 'File Atak' },
  { id: 'lateral-alley', name: 'Yan Koridor' },
];

export interface PositionSample {
  x: number; // 0-1
  y: number; // 0-1 (1 = baz çizgi, 0 = file)
  tMs: number;
}

export interface CourtDimensions {
  widthM: number;  // 10.97
  lengthM: number; // 23.77
}

export const DEFAULT_COURT_DIMS: CourtDimensions = { widthM: 10.97, lengthM: 23.77 };

/** Noktanın taktik bölgesini döndürür. */
export function zoneForPoint(x: number, y: number): string {
  if (Math.abs(x - 0.5) > 0.4) return 'lateral-alley';
  if (y <= 0.3) return 'net-attack';
  if (y <= 0.6) return 'transition';
  return 'baseline-defense';
}

export interface CoverageAnalysis {
  zonePcts: Record<string, number>;
  totalDistanceM: number;
  leftM: number;
  rightM: number;
  leftPct: number;
  rightPct: number;
  bias: 'left' | 'right' | 'balanced';
}

/** Bölge süre yüzdeleri + toplam mesafe + L/R yön önyargısı. */
export function analyzeCoverage(samples: PositionSample[], dims: CourtDimensions = DEFAULT_COURT_DIMS): CoverageAnalysis {
  if (samples.length === 0) {
    return { zonePcts: {}, totalDistanceM: 0, leftM: 0, rightM: 0, leftPct: 50, rightPct: 50, bias: 'balanced' };
  }
  const zoneCount: Record<string, number> = {};
  for (const s of samples) {
    const z = zoneForPoint(s.x, s.y);
    zoneCount[z] = (zoneCount[z] ?? 0) + 1;
  }
  const zonePcts: Record<string, number> = {};
  for (const z of COURT_ZONES) {
    zonePcts[z.id] = Math.round(((zoneCount[z.id] ?? 0) / samples.length) * 100);
  }

  let totalDistanceM = 0;
  let leftM = 0;
  let rightM = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    const dx = (b.x - a.x) * dims.widthM;
    const dy = (b.y - a.y) * dims.lengthM;
    totalDistanceM += Math.hypot(dx, dy);
    if (dx < 0) leftM += Math.abs(dx); else rightM += Math.abs(dx);
  }
  const lateralTotal = leftM + rightM;
  const leftPct = lateralTotal > 0 ? Math.round((leftM / lateralTotal) * 100) : 50;
  const rightPct = 100 - leftPct;
  const bias = Math.abs(leftPct - 50) < 5 ? 'balanced' : leftPct > 50 ? 'left' : 'right';

  return { zonePcts, totalDistanceM: Number(totalDistanceM.toFixed(1)), leftM: Number(leftM.toFixed(1)), rightM: Number(rightM.toFixed(1)), leftPct, rightPct, bias };
}

export function courtCoverageStatus(): string {
  return `Kort Kapsama: 4 bölge % • mesafe m • L/R önyargı (${DEFAULT_COURT_DIMS.widthM}×${DEFAULT_COURT_DIMS.lengthM}m)`;
}
