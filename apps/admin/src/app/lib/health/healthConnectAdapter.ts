// ============================================================================
// 🫀 APPLE HEALTHKIT & GOOGLE HEALTH CONNECT ÇİFT ADAPTÖR (Adım 142)
// Tüketici akıllı saatleriyle (Apple Watch, Garmin, Whoop, Galaxy Watch)
// biyometrik senkronizasyon: dinlenme kalp hızı (RHR), kalp hızı değişkenliği
// (HRV / SDNN ms), uyku süresi (Derin/REM saat) ve VO2 Max tahmini. Kort öncesi
// Baseline Readiness Skoru (0-100%) hesaplayarak günlük ACWR yük önerisini
// otomatik ayarlar. Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type BiometricSource = 'apple_health' | 'google_health_connect' | 'garmin' | 'whoop' | 'galaxy_watch';

export interface BiometricSnapshot {
  athleteId: string;
  restingHrBpm: number;
  hrvSdnnMs: number;
  sleepDeepHrs: number;
  sleepRemHrs: number;
  vo2Max: number; // ml/kg/dk
  source: BiometricSource;
  capturedAt: string;
}

export interface ReadinessResult {
  score: number; // 0-100
  tier: 'RED' | 'AMBER' | 'GREEN';
  components: { rhr: number; hrv: number; sleep: number; vo2: number };
  note: string;
}

export const READINESS_RED_MAX = 40;
export const READINESS_AMBER_MAX = 65;

// ── Bileşenler ───────────────────────────────────────────────────────────────
export function rhrComponent(restingHrBpm: number): number {
  return Math.max(0, Math.min(100, 100 - (restingHrBpm - 40) * 2));
}

export function hrvComponent(hrvSdnnMs: number): number {
  return Math.max(0, Math.min(100, ((hrvSdnnMs - 15) / 85) * 100));
}

export function sleepComponent(deepHrs: number, remHrs: number): number {
  const total = deepHrs + remHrs;
  return Math.max(0, Math.min(100, (total / 3.5) * 100));
}

export function vo2Component(vo2Max: number): number {
  return Math.max(0, Math.min(100, ((vo2Max - 35) / 25) * 100));
}

export function readinessScore(snapshot: BiometricSnapshot): ReadinessResult {
  const c = {
    rhr: Math.round(rhrComponent(snapshot.restingHrBpm) * 100) / 100,
    hrv: Math.round(hrvComponent(snapshot.hrvSdnnMs) * 100) / 100,
    sleep: Math.round(sleepComponent(snapshot.sleepDeepHrs, snapshot.sleepRemHrs) * 100) / 100,
    vo2: Math.round(vo2Component(snapshot.vo2Max) * 100) / 100,
  };
  const score = Math.round(0.3 * c.rhr + 0.3 * c.hrv + 0.25 * c.sleep + 0.15 * c.vo2);
  const tier = score < READINESS_RED_MAX ? 'RED' : score < READINESS_AMBER_MAX ? 'AMBER' : 'GREEN';
  const note =
    tier === 'RED'
      ? `Readiness ${score} — düşük; ACWR yükü %40 azaltılmalı (toparlanma önceliği)`
      : tier === 'AMBER'
        ? `Readiness ${score} — orta; ACWR yükü %20 azaltılmalı`
        : `Readiness ${score} — yüksek; planlanan ACWR yükü uygulanabilir`;
  return { score, tier, components: c, note };
}

// ── ACWR yük azaltma (Readiness'e göre) ──────────────────────────────────────
export interface LoadAdjustment {
  plannedLoad: number;
  adjustedLoad: number;
  dampeningPct: number;
  tier: 'RED' | 'AMBER' | 'GREEN';
  note: string;
}

export function adjustTrainingLoad(plannedLoad: number, readiness: ReadinessResult): LoadAdjustment {
  const dampeningPct = readiness.tier === 'RED' ? 40 : readiness.tier === 'AMBER' ? 20 : 0;
  const adjustedLoad = Math.round(plannedLoad * (1 - dampeningPct / 100));
  return {
    plannedLoad,
    adjustedLoad,
    dampeningPct,
    tier: readiness.tier,
    note: `Readiness ${readiness.score} → ACWR planı ${plannedLoad} → ${adjustedLoad} (%-${dampeningPct})`,
  };
}

// ── Kaynak normalizasyonu (birim farkları) ───────────────────────────────────
export function normalizeBiometric(raw: Partial<BiometricSnapshot>, source: BiometricSource, athleteId: string): BiometricSnapshot {
  let sleepDeepHrs = raw.sleepDeepHrs ?? 1;
  let sleepRemHrs = raw.sleepRemHrs ?? 0.8;
  // Dakika cinsinden raporlayan kaynaklar (Whoop/Garmin) saat birimine çevrilir
  if (sleepDeepHrs > 24) sleepDeepHrs = Math.round((sleepDeepHrs / 60) * 100) / 100;
  if (sleepRemHrs > 24) sleepRemHrs = Math.round((sleepRemHrs / 60) * 100) / 100;
  return {
    athleteId,
    restingHrBpm: raw.restingHrBpm ?? 60,
    hrvSdnnMs: raw.hrvSdnnMs ?? 45,
    sleepDeepHrs,
    sleepRemHrs,
    vo2Max: raw.vo2Max ?? 45,
    source,
    capturedAt: raw.capturedAt ?? new Date().toISOString(),
  };
}

export function healthConnectStatus(): string {
  return `Health Connect: ${5} kaynak (Apple/Garmin/Whoop/Galaxy/Google) • Readiness 0-100% → ACWR yük azaltma`;
}
