// ============================================================================
// 🛑 YAVAŞLAMA & KORT ZEMİN BİYOMEKANİĞİ
// "Control the deceleration, not just the speed" — frenleme kalitesini ölç.
//   • Brake Index: plant öncesi hız düşürme oranı.
//   • Traction Check: yanal kayma ve zemin tutuş katsayısı.
//   • Sakatlık risk önleyici yük hesabı (eklem yükü yönetimi).
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface BrakeProfile {
  approachSpeedKmh: number;   // plant öncesi hız
  plantSpeedKmh: number;      // plant anındaki hız
  brakeIndex: number;         // 0-1 (1 = tam kontrol, 0 = kontrolsüz)
  brakeDistanceM: number;     // fren mesafesi
}

export interface TractionProfile {
  lateralSlipCm: number;      // yanal kayma (cm)
  surface: 'parke' | 'lastik' | 'cim' | 'toprak';
  tractionCoeff: number;      // 0-1 (1 = tam tutuş)
  wetFloor: boolean;
}

export interface LoadProfile {
  bodyMassKg: number;
  impactLoadG: number;        // plant anında zemine binen yük (G)
  weeklySprintCount: number;
  injuryRiskScore: number;    // 0-100 (100 = yüksek risk)
  loadAdvisory: string;
}

export interface DecelerationReport {
  athlete: string;
  profile: { brake: BrakeProfile; traction: TractionProfile; load: LoadProfile };
  overallGrade: 'A' | 'B' | 'C' | 'D';
  prescription: string;
}

// ── BRAKE INDEX: hız düşürme oranı ──────────────────────────────────────────
export function computeBrakeIndex(approachKmh: number, plantKmh: number): number {
  if (approachKmh <= 0) return 1;
  const ratio = Math.max(0, Math.min(1, (approachKmh - plantKmh) / approachKmh));
  // Tam durma kontrolü: plant hızı ne kadar düşükse kontrol o kadar yüksek
  return Math.round(ratio * 100) / 100;
}

// ── TRACTION CHECK: zemin tutuş katsayısı ───────────────────────────────────
export const SURFACE_TRACTION: Record<TractionProfile['surface'], number> = {
  parke: 0.72,
  lastik: 0.58,
  cim: 0.81,
  toprak: 0.65,
};

export function computeTractionCoeff(surface: TractionProfile['surface'], lateralSlipCm: number, wetFloor: boolean): number {
  const base = SURFACE_TRACTION[surface];
  const slipPenalty = Math.min(0.3, lateralSlipCm * 0.01); // 30cm kayma → -0.3
  const wetPenalty = wetFloor ? 0.15 : 0;
  return Math.round(Math.max(0.1, Math.min(1, base - slipPenalty - wetPenalty)) * 100) / 100;
}

// ── LOAD: sakatlık risk önleyici yük hesabı ─────────────────────────────────
export function computeLoadProfile(input: {
  bodyMassKg: number;
  impactLoadG: number;
  weeklySprintCount: number;
}): LoadProfile {
  const loadScore = Math.min(100, (input.impactLoadG / 6) * 50 + (input.weeklySprintCount / 12) * 40 + (input.bodyMassKg > 85 ? 10 : 0));
  const injuryRiskScore = Math.round(loadScore);

  let loadAdvisory: string;
  if (injuryRiskScore < 35) loadAdvisory = 'Güvenli yük bölgesi — kademeli yükleme sürdürülebilir.';
  else if (injuryRiskScore < 60) loadAdvisory = 'Dikkat bölgesi — set arası dinlenmeyi +20s uzat.';
  else loadAdvisory = 'Yüksek risk bölgesi — haftalık sprint sayısını %30 azalt, plyometrik günü iptal et.';

  return { bodyMassKg: input.bodyMassKg, impactLoadG: input.impactLoadG, weeklySprintCount: input.weeklySprintCount, injuryRiskScore, loadAdvisory };
}

// ── RAPOR ───────────────────────────────────────────────────────────────────
export function analyzeDeceleration(input: {
  athlete: string;
  approachKmh: number;
  plantKmh: number;
  brakeDistanceM: number;
  lateralSlipCm: number;
  surface: TractionProfile['surface'];
  wetFloor?: boolean;
  bodyMassKg: number;
  impactLoadG: number;
  weeklySprintCount: number;
}): DecelerationReport {
  const brake: BrakeProfile = {
    approachSpeedKmh: input.approachKmh,
    plantSpeedKmh: input.plantKmh,
    brakeIndex: computeBrakeIndex(input.approachKmh, input.plantKmh),
    brakeDistanceM: input.brakeDistanceM,
  };
  const traction: TractionProfile = {
    lateralSlipCm: input.lateralSlipCm,
    surface: input.surface,
    tractionCoeff: computeTractionCoeff(input.surface, input.lateralSlipCm, input.wetFloor ?? false),
    wetFloor: input.wetFloor ?? false,
  };
  const load = computeLoadProfile({ bodyMassKg: input.bodyMassKg, impactLoadG: input.impactLoadG, weeklySprintCount: input.weeklySprintCount });

  const score = brake.brakeIndex * 45 + traction.tractionCoeff * 35 + (100 - load.injuryRiskScore) / 100 * 20;
  const overallGrade: DecelerationReport['overallGrade'] = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D';

  const prescription =
    overallGrade === 'A' ? 'Mükemmel frenleme — plant öncesi yumuşak hız düşürme korunmalı; ileri düzeye geç.'
    : overallGrade === 'B' ? 'İyi — lateral kayma azaltılmalı: zemin temasında daha kısa adım + alçak ağırlık merkezi.'
    : overallGrade === 'C' ? 'Orta — brake index artır: plant öncesi 2 adımda hızı %60 düşür (3-2-1 ritmi).'
    : 'Zayıf — sakatlık riski yüksek: sprint yükü azalt, frenleme drilleri (deceleration ladder) ile yeniden kur.';

  return { athlete: input.athlete, profile: { brake, traction, load }, overallGrade, prescription };
}

export function decelerationBiomechanicsStatus(): string {
  return 'Frenleme Biyomekaniği [Brake Index • Traction Check • Yük riski — deceleration önce gelir]';
}
