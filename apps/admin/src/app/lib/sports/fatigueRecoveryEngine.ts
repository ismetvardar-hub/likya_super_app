// ============================================================================
// 😮💨 YORGUNLUK EĞRİSİ + EPOC TOPARLANMA MOTORU
// • İki bileşenli yorgunluk modeli: glikojen (üstel tükeniş) + mekanik (nöral)
// • EPOC tahmini: seans yoğunluğuna göre fazla oksijen tüketimi + toparlanma süresi
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export type SessionIntensity = 'low' | 'medium' | 'high';

export interface FatigueCurvePoint {
  tMin: number;
  glycogenPct: number;   // kas glikojen kalanı (üstel tükeniş)
  mechanicalPct: number; // nöral/mekanik kapasite (lineer + hızlanan düşüş)
  fatigueIndex: number;  // 0-100 birikmiş yorgunluk
}

/**
 * Seans boyunca iki bileşenli yorgunluk eğrisi üretir.
 * Glycogen: üstel tükeniş (yoğunluk sabitine göre). Mechanical: nöral yorgunluk.
 */
export function buildFatigueCurve(durationMin: number, intensity: SessionIntensity = 'medium', stepMin = 5): FatigueCurvePoint[] {
  const intensityCfg = {
    low: { glycogenHalf: 90, mechanicalPerMin: 0.25 },
    medium: { glycogenHalf: 55, mechanicalPerMin: 0.45 },
    high: { glycogenHalf: 32, mechanicalPerMin: 0.8 },
  } as const;
  const cfg = intensityCfg[intensity];
  const points: FatigueCurvePoint[] = [];

  for (let t = 0; t <= durationMin; t += stepMin) {
    // Glikojen: yarı ömre göre üstel (base 50% -> ~%5-20 bitiş)
    const glycogenPct = Math.max(0, Math.round(100 * Math.pow(0.5, t / cfg.glycogenHalf)));
    // Mekanik: lineer + geç fazda hızlanan nöral düşüş
    const linear = 100 - cfg.mechanicalPerMin * t;
    const latePenalty = t > durationMin * 0.6 ? (t - durationMin * 0.6) * cfg.mechanicalPerMin * 0.8 : 0;
    const mechanicalPct = Math.max(0, Math.round(linear - latePenalty));
    const fatigueIndex = Math.min(100, Math.round(100 - (glycogenPct * 0.5 + mechanicalPct * 0.5)));
    points.push({ tMin: t, glycogenPct, mechanicalPct, fatigueIndex });
  }
  return points;
}

export interface EpocResult {
  epocMlKg: number;      // EPOC (ml O2 / kg)
  recoveryHours: number; // tam toparlanma önerisi
  zone: 'kisa' | 'orta' | 'uzun';
}

/**
 * EPOC (Fazla Oksijen Tüketimi) — seans ortalaması ve yoğunluğundan tahmin.
 * Standart yaklaşık tablolar: EPOC, %HR-reserve ile üstel ölçeklenir.
 */
export function estimateEpoc(input: { avgHr: number; restHr: number; maxHr: number; durationMin: number }): EpocResult {
  const { avgHr, restHr, maxHr, durationMin } = input;
  const hrr = Math.max(0, Math.min(1, (avgHr - restHr) / Math.max(1, maxHr - restHr))); // 0-1
  // EPOC ≈ 2.6 · e^(3.7·HRR) · (dk/60)  — ml/kg yaklaşımı (doygunluk sınırlı)
  const epocMlKg = Number((2.6 * Math.exp(3.7 * hrr) * (durationMin / 60)).toFixed(1));
  const bounded = Math.min(120, epocMlKg);
  const recoveryHours = Number((bounded / 12).toFixed(1)); // ~12 ml/kg/saat toparlanma
  const zone: EpocResult['zone'] = recoveryHours > 8 ? 'uzun' : recoveryHours > 4 ? 'orta' : 'kisa';
  return { epocMlKg: bounded, recoveryHours, zone };
}

export function fatigueRecoveryStatus(): string {
  return 'Yorgunluk Motoru: glikojen+mekanik eğri • EPOC tahmini • toparlanma saati';
}
