// ============================================================================
// 💓 SPEKTRAL HRV ANALİZİ (SDNN • rMSSD • LF/HF) — sıfır bağımlılık
// • Zaman ekseni: SDNN (tüm varyasyon), rMSSD (vagal/parasempatik), meanRR
// • Frekans ekseni: RR interpolasyonu → Goertzel algoritması ile
//   LF (0.04-0.15 Hz, sempatik+parasempatik) ve HF (0.15-0.40 Hz, vagal)
// • LF/HF oranı: otonom denge göstergesi (1-2 dinlenim optimal)
// Deterministik; Plan Z güvenli; donanım yoksa mock RR ile çalışır.
// ============================================================================

export interface TimeDomainHrv {
  meanRrMs: number;
  sdnnMs: number;   // standart sapma (tüm varyans)
  rmssdMs: number;  // ardışık farkların RMS'i (vagal)
  pnn50Pct: number; // >50ms ardışık fark oranı
}

/** Zaman ekseni HRV ölçümleri — RR interval dizisinden (ms). */
export function computeTimeDomainHrv(rr: number[]): TimeDomainHrv {
  if (rr.length === 0) return { meanRrMs: 0, sdnnMs: 0, rmssdMs: 0, pnn50Pct: 0 };
  const mean = rr.reduce((a, b) => a + b, 0) / rr.length;
  const sdnn = Math.sqrt(rr.reduce((a, b) => a + (b - mean) ** 2, 0) / rr.length);

  let rmssd = 0;
  let nn50 = 0;
  for (let i = 1; i < rr.length; i++) {
    const d = Math.abs(rr[i] - rr[i - 1]);
    rmssd += d * d;
    if (d > 50) nn50++;
  }
  const diffs = Math.max(1, rr.length - 1);
  rmssd = Math.sqrt(rmssd / diffs);
  return { meanRrMs: Math.round(mean), sdnnMs: Math.round(sdnn * 10) / 10, rmssdMs: Math.round(rmssd * 10) / 10, pnn50Pct: Math.round((nn50 / diffs) * 100) };
}

// ── Goertzel algoritması: tek frekans için DFT büyüklüğü ─────────────────────
function goertzelPower(samples: number[], targetHz: number, fs: number): number {
  const n = samples.length;
  if (n < 3) return 0;
  const k = (targetHz * n) / fs;
  const w = (2 * Math.PI * k) / n;
  const coeff = 2 * Math.cos(w);
  let s0 = 0, s1 = 0, s2 = 0;
  for (let i = 0; i < n; i++) {
    s0 = samples[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
  return Math.max(0, power);
}

// ── Frekans ekseni: RR dizisini eşit zamanlı ızgaraya interpolasyon ──────────
function interpolateRr(rr: number[], fs = 4): { samples: number[]; fs: number } {
  // kümülatif zaman (ms)
  const times: number[] = [0];
  for (let i = 1; i < rr.length; i++) times.push(times[i - 1] + rr[i - 1]);
  const totalMs = times[times.length - 1];
  const sampleCount = Math.max(8, Math.floor((totalMs / 1000) * fs));
  const dtSec = totalMs / 1000 / sampleCount;
  const out: number[] = [];
  let idx = 0;
  for (let s = 0; s < sampleCount; s++) {
    const tSec = s * dtSec;
    while (idx + 1 < times.length && times[idx + 1] / 1000 < tSec) idx++;
    const t0 = times[idx] / 1000;
    const t1 = times[Math.min(idx + 1, times.length - 1)] / 1000;
    const v0 = rr[idx];
    const v1 = rr[Math.min(idx + 1, rr.length - 1)];
    const f = t1 > t0 ? (tSec - t0) / (t1 - t0) : 0;
    out.push(v0 + (v1 - v0) * f);
  }
  return { samples: out, fs };
}

export interface SpectralHrv {
  lfMs2: number;      // 0.04-0.15 Hz güç
  hfMs2: number;      // 0.15-0.40 Hz güç
  lfHfRatio: number;  // otonom denge
  totalPowerMs2: number;
  dominantBand: 'LF' | 'HF' | 'balans';
  note: string;
}

const LF_BAND = [0.04, 0.15] as const;
const HF_BAND = [0.15, 0.40] as const;

/** RR interval dizisinden frekans ekseni HRV ölçümleri. */
export function computeSpectralHrv(rr: number[]): SpectralHrv {
  if (rr.length < 4) return { lfMs2: 0, hfMs2: 0, lfHfRatio: 0, totalPowerMs2: 0, dominantBand: 'balans', note: 'Yetersiz RR verisi (≥4 gereklidir)' };

  const { samples, fs } = interpolateRr(rr);
  const n = samples.length;
  const freqStep = fs / n;

  let lf = 0;
  let hf = 0;
  for (let f = freqStep; f < HF_BAND[1]; f += freqStep) {
    const p = goertzelPower(samples, f, fs);
    if (f >= LF_BAND[0] && f < LF_BAND[1]) lf += p;
    else if (f >= HF_BAND[0] && f < HF_BAND[1]) hf += p;
  }
  const lfHfRatio = hf <= 0 ? 0 : Number((lf / hf).toFixed(2));
  const total = Number((lf + hf).toFixed(0));
  const dominantBand: SpectralHrv['dominantBand'] = lfHfRatio > 1.5 ? 'LF' : lfHfRatio < 0.5 ? 'HF' : 'balans';
  const note =
    dominantBand === 'LF'
      ? 'Sempatik baskın — stres/yüklenme; dinlenim ve uyku iyileştirilmeli'
      : dominantBand === 'HF'
        ? 'Vagal (parasempatik) baskın — iyi toparlanma durumu'
        : 'Otonom denge dengeli (LF/HF 0.5-1.5)';
  return { lfMs2: Math.round(lf), hfMs2: Math.round(hf), lfHfRatio, totalPowerMs2: total, dominantBand, note };
}

export function spectralHrvStatus(): string {
  return 'Spektral HRV: SDNN • rMSSD • pNN50 • LF/HF (Goertzel) — sıfır bağımlılık';
}
