// ============================================================================
// 🏃 SPRINT İVMELENME & HIZ PROFİLİ (Adım 42)
// Split zamanları: 0-5m (First-step quickness) ve 5-10m (Drive phase)
// Tepe ivme (a_max) + Kuvvet-Hız (F-V) profili eğimi (S_fv = F0 / v0)
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface SprintSplit {
  distanceM: number;
  timeS: number;
}

export interface SprintProfileInput {
  splits: SprintSplit[];          // 5m ve 10m split süreleri
  accelSamplesMps2?: number[];    // yüksek frekanslı ivme örnekleri (varsa)
  bodyMassKg?: number;            // F-V profili için (varsa)
}

export interface SprintProfileResult {
  split05: number;                // 0-5m süre (sn)
  split510: number;               // 5-10m süre (sn)
  v05: number;                    // 0-5m ortalama hız (m/s)
  v510: number;                   // 5-10m ortalama hız (m/s)
  accel05: number;                // 0-5m ivmelenme (m/s²)
  peakAccelMps2: number;          // a_max
  f0N: number;                    // teorik maks kuvvet
  v0Ms: number;                   // teorik maks hız
  fvSlope: number;                // S_fv = F0 / v0 (kg/s) — negatif eğim
  plateauDetected: boolean;
  advice: string;
}

/** 0-5m ve 5-10m split profili hesaplar; F-V eğimi türetir. */
export function computeSprintProfile(input: SprintProfileInput): SprintProfileResult {
  const sorted = [...input.splits].sort((a, b) => a.distanceM - b.distanceM);
  const s5 = sorted.find((s) => s.distanceM >= 5);
  const s10 = sorted.find((s) => s.distanceM >= 10);

  const split05 = s5?.timeS ?? 0;
  const split510 = s10 && s5 ? Number((s10.timeS - s5.timeS).toFixed(2)) : 0;
  const v05 = split05 > 0 ? Number((5 / split05).toFixed(2)) : 0;
  const v510 = split510 > 0 ? Number((5 / split510).toFixed(2)) : 0;
  const accel05 = split05 > 0 ? Number((v05 / split05).toFixed(2)) : 0;

  const peakAccelMps2 =
    input.accelSamplesMps2 && input.accelSamplesMps2.length > 0
      ? Number(Math.max(...input.accelSamplesMps2).toFixed(2))
      : accel05;

  // F-V profili: F0 = m·a_max, v0 = tepe hız (5-10m veya 0-5m), S_fv = F0/v0
  const mass = input.bodyMassKg ?? 70;
  const f0N = Number((mass * peakAccelMps2).toFixed(1));
  const v0Ms = Math.max(v05, v510) || 1;
  const fvSlope = Number((f0N / v0Ms).toFixed(1));

  const gainPct = v05 > 0 ? (v510 - v05) / v05 : 0;
  const plateauDetected = gainPct < 0.05;
  const advice = plateauDetected
    ? "ℹ️ 5-10m'da hız kazanımı <%5 (plato) — tepe hız erken; maks hız odaklı koşu ekle"
    : '✅ 5-10m hız kazanımı sürüyor — ivmelenme profili sağlıklı';

  return { split05, split510, v05, v510, accel05, peakAccelMps2, f0N, v0Ms, fvSlope, plateauDetected, advice };
}

export function sprintProfileStatus(): string {
  return 'Sprint Profili: 0-5m first-step • 5-10m drive • a_max • F-V eğimi S_fv';
}
