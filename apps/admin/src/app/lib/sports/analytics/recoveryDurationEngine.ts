// ============================================================================
// 😮💨 MAÇ SONRASI METABOLİK TOPARLANMA & EPOC MODELİ (Adım 41)
// EPOC_est = α · TRIMP · (HR_mean / HR_max)²
// Çıktı: önerilen dinlenme penceresi (24h/48h/72h) + ertesi gün antrenman hazırlığı
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export interface RecoveryInput {
  trimp: number;   // Banister TRIMP (AU)
  hrMean: number;
  hrMax: number;
  alpha?: number;  // ölçek katsayısı (varsayılan 0.5)
}

export type RestWindow = '24h' | '48h' | '72h';
export type NextDayReadiness = 'hazir' | 'kismen' | 'toparlanma_gerekli';

export interface RecoveryAssessment {
  epocMlKg: number;
  hrRatio: number;
  recoveryHours: number;
  restWindow: RestWindow;
  nextDayReadiness: NextDayReadiness;
  advice: string;
}

/** EPOC tahmini: α · TRIMP · (HR_mean / HR_max)² */
export function estimateEpoc(input: RecoveryInput): number {
  const { trimp, hrMean, hrMax, alpha = 0.5 } = input;
  const hrRatio = hrMax > 0 ? hrMean / hrMax : 0;
  return Number((alpha * trimp * hrRatio * hrRatio).toFixed(1));
}

/** EPOC değerini dinlenme penceresine ve ertesi gün hazırlığına dönüştürür. */
export function assessRecovery(input: RecoveryInput): RecoveryAssessment {
  const epocMlKg = estimateEpoc(input);
  const hrRatio = input.hrMax > 0 ? Number((input.hrMean / input.hrMax).toFixed(3)) : 0;

  let restWindow: RestWindow;
  let recoveryHours: number;
  let nextDayReadiness: NextDayReadiness;
  if (epocMlKg > 50) {
    restWindow = '72h';
    recoveryHours = 72;
    nextDayReadiness = 'toparlanma_gerekli';
  } else if (epocMlKg > 15) {
    restWindow = '48h';
    recoveryHours = 48;
    nextDayReadiness = 'kismen';
  } else {
    restWindow = '24h';
    recoveryHours = 24;
    nextDayReadiness = 'hazir';
  }

  const advice =
    nextDayReadiness === 'toparlanma_gerekli'
      ? `🚨 EPOC ${epocMlKg} ml/kg — ağır metabolik yük; ${restWindow} dinlenme + glikojen yenileme, yarın düşük yoğunluk`
      : nextDayReadiness === 'kismen'
        ? `⚠️ EPOC ${epocMlKg} ml/kg — ${restWindow} toparlanma; ertesi gün orta yoğunluk, ağır seans planlama`
        : `✅ EPOC ${epocMlKg} ml/kg — hafif yük; ${restWindow} içinde otonom/glikojen bazalına dönüş, ertesi gün antrenmana hazır`;
  return { epocMlKg, hrRatio, recoveryHours, restWindow, nextDayReadiness, advice };
}

/** Işık / orta / aşırı seans senaryoları için hızlı profil (test & UI). */
export function recoveryProfileFor(level: 'light' | 'moderate' | 'extreme'): RecoveryAssessment {
  const base: Record<'light' | 'moderate' | 'extreme', RecoveryInput> = {
    light: { trimp: 40, hrMean: 110, hrMax: 185 },
    moderate: { trimp: 100, hrMean: 150, hrMax: 190 },
    extreme: { trimp: 250, hrMean: 175, hrMax: 190 },
  };
  return assessRecovery(base[level]);
}

export function recoveryDurationStatus(): string {
  return 'Toparlanma Motoru: EPOC=α·TRIMP·(HRm/HRmax)² • 24h/48h/72h pencere • hazırlık';
}
