// ============================================================================
// 💓 SPEKTRAL HRV ANALİZİ + TOPARLANMA HAZIRLIĞI (Adım 33)
// Zaman ekseni: RMSSD • SDNN • pNN50 (mevcut spektralHrvEngine'den)
// Frekans ekseni: LF (0.04-0.15 Hz) • HF (0.15-0.40 Hz) • LF/HF denge
// Çıktı: Otonom toparlanma hazır olma skoru (1-10).
// Deterministik; sıfır bağımlılık.
// ============================================================================

import { computeTimeDomainHrv, computeSpectralHrv, type TimeDomainHrv, type SpectralHrv } from '../spectralHrvEngine.ts';

export interface HrvRecoveryReport {
  rmssdMs: number;
  sdnnMs: number;
  pnn50Pct: number;
  lfMs2: number;
  hfMs2: number;
  lfHfRatio: number;
  dominantBand: SpectralHrv['dominantBand'];
  readiness: number; // 1-10
  label: string;
  advice: string;
}

/**
 * Otonom toparlanma hazır olma skoru (1-10):
 * RMSSD yüksek + LF/HF dengeli + pNN50 yüksek + HF baskın → yüksek hazırlık.
 */
export function recoveryReadinessScore(td: TimeDomainHrv, spec: SpectralHrv): number {
  let score = 5;
  // Vagal ton (RMSSD)
  if (td.rmssdMs >= 40) score += 2;
  else if (td.rmssdMs >= 25) score += 1;
  else score -= 1;
  // LF/HF dengesi (1-2 dinlenim optimal)
  if (spec.lfHfRatio > 0.3 && spec.lfHfRatio <= 1.5) score += 1;
  else if (spec.lfHfRatio > 2.5) score -= 1;
  // pNN50 (vagal aktivite)
  if (td.pnn50Pct >= 20) score += 1;
  else if (td.pnn50Pct <= 5) score -= 1;
  // Dominant bant
  if (spec.dominantBand === 'HF') score += 1;
  else if (spec.dominantBand === 'LF') score -= 1;
  return Math.max(1, Math.min(10, Math.round(score)));
}

export function analyzeHrvRecovery(rr: number[]): HrvRecoveryReport {
  const td = computeTimeDomainHrv(rr);
  const spec = computeSpectralHrv(rr);
  const readiness = recoveryReadinessScore(td, spec);
  const label = readiness >= 8 ? 'Hazır' : readiness >= 6 ? 'Neredeyse hazır' : readiness >= 4 ? 'Orta' : 'Toparlanma gerekli';
  const advice =
    readiness >= 8
      ? '✅ Otonom sistem dengeli — yüksek yoğunluklu antrenman uygun'
      : readiness >= 6
        ? 'ℹ️ Hafif stres — orta yoğunluk önerilir'
        : readiness >= 4
          ? '⚠️ Yorgunluk birikimi — düşük yoğunluk + uyku'
          : '🚨 Düşük hazırlık — aktif toparlanma / izin günü, yük eklemeyin';
  return {
    rmssdMs: td.rmssdMs,
    sdnnMs: td.sdnnMs,
    pnn50Pct: td.pnn50Pct,
    lfMs2: spec.lfMs2,
    hfMs2: spec.hfMs2,
    lfHfRatio: spec.lfHfRatio,
    dominantBand: spec.dominantBand,
    readiness,
    label,
    advice,
  };
}

export function spectralHrvAnalyticsStatus(): string {
  return 'Spektral HRV: RMSSD/SDNN/pNN50 • LF/HF • hazır olma skoru 1-10';
}
