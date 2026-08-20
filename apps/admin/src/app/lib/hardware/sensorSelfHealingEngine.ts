// ============================================================================
// 🩹 AKTİF SENSÖR SELF-HEALING & DİNAMİK OTO-KALİBRASYON MOTORU (Adım 119)
// Doğal dinlenme aralıklarında (oturma molası, su molası) çalışan otomatik
// drift-düzeltme algoritması: ağırlık taşımayan anları tespit eder ve FSR
// kanalları için zero-load baseline ofsetini sıfırlar (sıcaklık + mekanik
// creep drift'e karşı). Saf/deterministik — node'da doğrulanabilir.
// ============================================================================

export const REST_VALUE_THRESHOLD = 8;      // bu değerin altı = ağırlık taşımıyor
export const REST_WINDOW_MS = 10_000;       // 10 sn kesintisiz dinlenme aralığı
export const MAX_FSR_VALUE = 100;

export interface FsrChannelSample {
  tsMs: number;
  value: number;   // ham FSR ADC (0-100 ölçek)
}

export interface RestInterval {
  startTsMs: number;
  endTsMs: number;
  durationMs: number;
  meanValue: number;
  sampleCount: number;
  valid: boolean;
}

export function isRestSample(value: number, threshold = REST_VALUE_THRESHOLD): boolean {
  return value < threshold;
}

// ── Ağırlık taşımayan (non-weight bearing) aralık tespiti ────────────────────
export function detectNonWeightBearing(samples: FsrChannelSample[], threshold = REST_VALUE_THRESHOLD, windowMs = REST_WINDOW_MS): RestInterval[] {
  const rests: RestInterval[] = [];
  let runStart: number | null = null;
  let runValues: number[] = [];

  const flush = (endMs: number) => {
    if (runStart === null || runValues.length === 0) return;
    const durationMs = endMs - runStart;
    const meanValue = runValues.reduce((a, b) => a + b, 0) / runValues.length;
    const valid = durationMs >= windowMs && meanValue <= threshold;
    rests.push({ startTsMs: runStart, endTsMs: endMs, durationMs, meanValue: Math.round(meanValue * 100) / 100, sampleCount: runValues.length, valid });
    runStart = null;
    runValues = [];
  };

  for (const s of samples) {
    if (isRestSample(s.value, threshold)) {
      if (runStart === null) runStart = s.tsMs;
      runValues.push(s.value);
    } else {
      flush(s.tsMs);
    }
  }
  flush(samples.length > 0 ? samples[samples.length - 1].tsMs : 0);
  return rests;
}

export function lastValidRest(rests: RestInterval[]): RestInterval | null {
  const valid = rests.filter((r) => r.valid);
  return valid.length > 0 ? valid[valid.length - 1] : null;
}

// ── Drift düzeltme: zero-load baseline'ı dinlenme ortalamasına sıfırla ───────
export interface DriftCorrection {
  applied: boolean;
  oldBaselineOffset: number;
  newBaselineOffset: number;
  driftAmount: number;                 // eski - yeni (pozitif = sensör yukarı kaymış)
  correctedSamples: FsrChannelSample[];
  note: string;
}

export function applyDriftCorrection(samples: FsrChannelSample[], rests: RestInterval[], currentBaselineOffset: number): DriftCorrection {
  const rest = lastValidRest(rests);
  if (!rest) {
    return {
      applied: false,
      oldBaselineOffset: currentBaselineOffset,
      newBaselineOffset: currentBaselineOffset,
      driftAmount: 0,
      correctedSamples: [...samples],
      note: 'Geçerli dinlenme aralığı yok — düzeltme uygulanmadı',
    };
  }
  const newBaselineOffset = rest.meanValue;
  const driftAmount = Math.round((currentBaselineOffset - newBaselineOffset) * 100) / 100;
  const correctedSamples = samples.map((s) => ({
    tsMs: s.tsMs,
    value: Math.max(0, Math.min(MAX_FSR_VALUE, Math.round((s.value - driftAmount) * 100) / 100)),
  }));
  return {
    applied: true,
    oldBaselineOffset: currentBaselineOffset,
    newBaselineOffset,
    driftAmount,
    correctedSamples,
    note: `Zero-load baseline ${currentBaselineOffset} → ${newBaselineOffset} (drift ${driftAmount >= 0 ? '+' : ''}${driftAmount}); sonraki okumalar düzeltildi`,
  };
}

export function computeCurrentBaseline(samples: FsrChannelSample[]): number {
  if (samples.length === 0) return 0;
  return Math.round((samples.reduce((a, b) => a + b.value, 0) / samples.length) * 100) / 100;
}

export function sensorSelfHealingStatus(): string {
  return `Self-Healing: ${REST_WINDOW_MS / 1000}sn dinlenme tespiti • FSR zero-load baseline drift düzeltmesi`;
}
