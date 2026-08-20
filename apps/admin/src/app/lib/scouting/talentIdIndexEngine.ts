// ============================================================================
// 🧠 AI YETENEK TESPİTİ (TID) BİLEŞİK ENDEKS MOTORU (Adım 82)
// Kanıt tabanlı faktörler: PHV ayarlı biyolojik olgunlaşma ofseti, reaktif güç
// büyüme hızı, bilişsel tepki hızı, deselerasyon fren verimi, sakatlık direnci.
// TID Bileşik Skoru (0-100) + projeksiyon tavan kademesi.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface TidFactors {
  maturationOffsetMonths: number; // 0 = tam PHV; + = PHV sonrası
  reactivePowerVelocity: number;  // RSI yıllık büyüme hızı
  cognitiveReactionMs: number;    // daha hızlı = daha iyi
  brakeEfficiencyPct: number;     // 0-100
  injuryResiliencePct: number;    // 0-100
}

export const TID_WEIGHTS = {
  reactivePower: 0.3,
  maturation: 0.2,
  cognitive: 0.2,
  brake: 0.15,
  resilience: 0.15,
} as const;

export type TidCeiling = 'Developmental' | 'Regional' | 'National' | 'International' | 'Pro Prospect';

/** 0-100 normalizasyon (invert = küçük değer daha iyi). */
function norm(value: number, min: number, max: number, invert = false): number {
  const raw = Math.max(0, Math.min(1, (value - min) / Math.max(0.001, max - min)));
  return Math.round((invert ? 1 - raw : raw) * 100);
}

/** PHV'a göre olgunlaşma skoru: PHV yakınında maks, uzaklaştıkça düşer. */
export function maturationScore(offsetMonths: number): number {
  return Math.max(15, Math.min(100, Math.round(100 - Math.abs(offsetMonths) * 3.2)));
}

/** TID bileşik skoru (0-100). */
export function computeTidScore(f: TidFactors): number {
  const reactive = norm(f.reactivePowerVelocity, 0.3, 1.5);
  const maturation = maturationScore(f.maturationOffsetMonths);
  const cognitive = norm(f.cognitiveReactionMs, 150, 320, true); // hızlı = yüksek
  const brake = Math.max(0, Math.min(100, f.brakeEfficiencyPct));
  const resilience = Math.max(0, Math.min(100, f.injuryResiliencePct));

  const score = Math.round(
    TID_WEIGHTS.reactivePower * reactive +
    TID_WEIGHTS.maturation * maturation +
    TID_WEIGHTS.cognitive * cognitive +
    TID_WEIGHTS.brake * brake +
    TID_WEIGHTS.resilience * resilience,
  );
  return Math.max(0, Math.min(100, score));
}

export function tidCeilingForScore(score: number): TidCeiling {
  if (score >= 90) return 'Pro Prospect';
  if (score >= 80) return 'International';
  if (score >= 68) return 'National';
  if (score >= 55) return 'Regional';
  return 'Developmental';
}

export interface TidAssessment {
  score: number;
  ceiling: TidCeiling;
  factorBreakdown: Record<'reactivePower' | 'maturation' | 'cognitive' | 'brake' | 'resilience', number>;
  recommendation: string;
}

/** TID değerlendirmesi: skor + tavan + faktör kırılımı + öneri. */
export function assessTalentId(f: TidFactors): TidAssessment {
  const score = computeTidScore(f);
  const ceiling = tidCeilingForScore(score);
  const factorBreakdown = {
    reactivePower: norm(f.reactivePowerVelocity, 0.3, 1.5),
    maturation: maturationScore(f.maturationOffsetMonths),
    cognitive: norm(f.cognitiveReactionMs, 150, 320, true),
    brake: Math.max(0, Math.min(100, f.brakeEfficiencyPct)),
    resilience: Math.max(0, Math.min(100, f.injuryResiliencePct)),
  };
  const recommendation =
    ceiling === 'Pro Prospect' || ceiling === 'International'
      ? `TID ${score} — uluslararası/ulusal seviye aday; elit program + sürekli gelişim izleme önerilir`
      : ceiling === 'National'
        ? `TID ${score} — ulusal seviye potansiyel; reaktif güç ve fren verimi odaklı program`
        : ceiling === 'Regional'
          ? `TID ${score} — bölgesel seviye; biyolojik olgunlaşma ve bilişsel hız gelişimi öncelikli`
          : `TID ${score} — gelişim aşaması; kapsamlı temel atletik gelişim programı`;
  return { score, ceiling, factorBreakdown, recommendation };
}

export function talentIdStatus(): string {
  return 'TID: PHV olgunlaşma + reaktif güç + bilişsel + fren + direnç → 0-100 + tavan kademe';
}
