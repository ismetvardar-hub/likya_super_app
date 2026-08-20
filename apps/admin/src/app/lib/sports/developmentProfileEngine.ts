// ============================================================================
// 🚀 GELİŞİM PROFİLİ MOTORU — RSI Yaş/Cinsiyet Tier + Sprint İvmelenme Profili
// • RSI-modified tier tabloları: U9 → Yetişkin × Erkek/Kadın (elit/iyi/gelişen)
// • RSI yüzdelik dilimi ve yaşa göre hedef bölge
// • Sprint profili: 0-5m ve 5-10m ivmelenme, plato tespiti, tepe hız
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export type AgeGroup = 'U9' | 'U11' | 'U13' | 'U15' | 'U17' | 'Yetiskin';
export type Sex = 'M' | 'F';

export interface RsiTierRow {
  ageGroup: AgeGroup;
  sex: Sex;
  elite: number;      // ≥ %85 dilim
  good: number;       // ≥ %60 dilim
  developing: number; // taban
}

// RSI-modified yaş/cinsiyet referans tabloları (gelişim literatürü bazlı)
export const RSI_TIER_TABLE: RsiTierRow[] = [
  { ageGroup: 'U9', sex: 'M', elite: 0.55, good: 0.42, developing: 0.3 },
  { ageGroup: 'U9', sex: 'F', elite: 0.5, good: 0.38, developing: 0.27 },
  { ageGroup: 'U11', sex: 'M', elite: 0.65, good: 0.5, developing: 0.35 },
  { ageGroup: 'U11', sex: 'F', elite: 0.58, good: 0.44, developing: 0.31 },
  { ageGroup: 'U13', sex: 'M', elite: 0.75, good: 0.58, developing: 0.4 },
  { ageGroup: 'U13', sex: 'F', elite: 0.66, good: 0.5, developing: 0.35 },
  { ageGroup: 'U15', sex: 'M', elite: 0.85, good: 0.66, developing: 0.45 },
  { ageGroup: 'U15', sex: 'F', elite: 0.72, good: 0.55, developing: 0.38 },
  { ageGroup: 'U17', sex: 'M', elite: 0.95, good: 0.74, developing: 0.5 },
  { ageGroup: 'U17', sex: 'F', elite: 0.78, good: 0.6, developing: 0.42 },
  { ageGroup: 'Yetiskin', sex: 'M', elite: 1.05, good: 0.82, developing: 0.55 },
  { ageGroup: 'Yetiskin', sex: 'F', elite: 0.85, good: 0.66, developing: 0.45 },
];

/** Yaşa göre yaş grubunu eşleştirir (6-10 U9, 11-12 U11, 13-14 U13, 15-16 U15, 17-18 U17). */
export function ageGroupForAge(age: number): AgeGroup {
  if (age <= 10) return 'U9';
  if (age <= 12) return 'U11';
  if (age <= 14) return 'U13';
  if (age <= 16) return 'U15';
  if (age <= 18) return 'U17';
  return 'Yetiskin';
}

export function rsiTierFor(age: number, sex: Sex): RsiTierRow {
  const g = ageGroupForAge(age);
  return RSI_TIER_TABLE.find((r) => r.ageGroup === g && r.sex === sex) ?? RSI_TIER_TABLE[RSI_TIER_TABLE.length - 1];
}

export interface RsiAssessment {
  rsi: number;
  ageGroup: AgeGroup;
  percentile: number; // 0-100 (tier tabloya göre)
  band: 'ELIT' | 'IYI' | 'GELISEN' | 'ALTINDA';
  target: string;
}

/** Sporcunun RSI değerini yaş/cinsiyet tier'ına göre değerlendirir. */
export function assessRsiTiered(rsi: number, age: number, sex: Sex): RsiAssessment {
  const tier = rsiTierFor(age, sex);
  let percentile: number;
  let band: RsiAssessment['band'];
  if (rsi >= tier.elite) {
    percentile = Math.min(100, 85 + Math.round(((rsi - tier.elite) / Math.max(0.05, tier.elite)) * 15));
    band = 'ELIT';
  } else if (rsi >= tier.good) {
    percentile = 60 + Math.round(((rsi - tier.good) / Math.max(0.05, tier.elite - tier.good)) * 25);
    band = 'IYI';
  } else if (rsi >= tier.developing) {
    percentile = 30 + Math.round(((rsi - tier.developing) / Math.max(0.05, tier.good - tier.developing)) * 30);
    band = 'GELISEN';
  } else {
    percentile = Math.max(1, Math.round((rsi / Math.max(0.01, tier.developing)) * 30));
    band = 'ALTINDA';
  }
  return { rsi, ageGroup: tier.ageGroup, percentile: Math.max(0, Math.min(100, percentile)), band, target: `Hedef ${tier.elite} (elit ${tier.ageGroup} ${tier.sex === 'M' ? 'erkek' : 'kadın'})` };
}

// ── SPRINT İVMELENME PROFİLİ (0-5m, 5-10m) ───────────────────────────────────
export interface SprintSplit {
  distanceM: number;
  timeS: number;
}

export interface SprintProfile {
  v0_5: number;          // 0-5m ortalama hız (m/s)
  v5_10: number;         // 5-10m ortalama hız (m/s)
  accel0to5: number;     // ilk 5m ivmelenme (m/s²)
  accel5to10: number;    // 5-10m ivmelenme (m/s²)
  plateauDetected: boolean; // hız kazanımı %5'in altında → plato
  topSpeedKmh: number;   // tahmini tepe hız
  advice: string;
}

/** 0-5m ve 5-10m split sürelerinden ivmelenme profilini hesaplar. */
export function sprintAccelerationProfile(splits: SprintSplit[]): SprintProfile {
  const sorted = [...splits].sort((a, b) => a.distanceM - b.distanceM);
  const v = (d: number, t: number) => (t > 0 ? d / t : 0);
  const s0 = sorted.find((s) => s.distanceM >= 5) ?? sorted[0];
  const s10 = sorted.find((s) => s.distanceM >= 10) ?? null;

  const v0_5 = s0 ? v(5, s0.timeS) : 0;
  const accel0to5 = s0 ? v0_5 / Math.max(0.01, s0.timeS) : 0;
  let v5_10 = v0_5;
  let accel5to10 = 0;
  if (s10) {
    const t5to10 = Math.max(0.01, s10.timeS - s0.timeS);
    const d5to10 = s10.distanceM - (s0.distanceM <= 5 ? 5 : s0.distanceM);
    v5_10 = d5to10 / t5to10;
    accel5to10 = (v5_10 - v0_5) / t5to10;
  }
  const gainPct = v0_5 > 0 ? (v5_10 - v0_5) / v0_5 : 1;
  const plateauDetected = gainPct < 0.05;
  const topSpeedKmh = Number((Math.max(v0_5, v5_10) * 3.6).toFixed(1));
  const advice = plateauDetected
    ? "ℹ️ 5-10m'da hız kazanımı < %5 (plato) — tepe hız çok erken; maksimum hız odaklı koşu ekle"
    : "✅ 5-10m'da hız kazanımı sürüyor — ivmelenme profili sağlıklı";
  return { v0_5: Number(v0_5.toFixed(2)), v5_10: Number(v5_10.toFixed(2)), accel0to5: Number(accel0to5.toFixed(2)), accel5to10: Number(accel5to10.toFixed(2)), plateauDetected, topSpeedKmh, advice };
}

export function developmentProfileStatus(): string {
  return 'Gelişim Profili: RSI tier (U9-ADULT × M/F) • sprint 0-5/5-10m • plato tespiti';
}
