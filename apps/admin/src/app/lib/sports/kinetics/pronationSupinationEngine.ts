// ============================================================================
// 🦶 DİNAMİK PRONASYON & SUPİNASYON AÇI TAHMİNCİSİ (Adım 43)
// Duruş fazında medial/lateral basınç dağılımı + IMU roll açısı
// Kademeler: Şiddetli Overpronasyon (<-10°) • Hafif Pronasyon (-10°..-4°)
//            Nötr (-4°..+4°) • Hafif Supinasyon (+4°..+10°) • Şiddetli (>+10°)
// Sade dilde basış içgörüsü + ayakkabı/tabanlık önerisi.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type FootPosture = 'SevereOverpronation' | 'MildPronation' | 'Neutral' | 'MildSupination' | 'SevereSupination';

export interface PronationInput {
  rollAngleDeg: number;        // IMU roll (negatif = medial/pronasyon, pozitif = lateral/supinasyon)
  medialPressurePct: number;   // medial basınç payı (%)
  lateralPressurePct: number;  // lateral basınç payı (%)
}

export interface PronationAssessment {
  posture: FootPosture;
  tierLabel: string;
  rollAngleDeg: number;
  pressureBiasPct: number;   // medial − lateral fark
  insight: string;
  recommendation: string;
}

export const PRONATION_TIERS: Array<{ posture: FootPosture; label: string; min: number; max: number }> = [
  { posture: 'SevereOverpronation', label: 'Şiddetli Overpronasyon', min: -Infinity, max: -10 },
  { posture: 'MildPronation', label: 'Hafif Pronasyon', min: -10, max: -4 },
  { posture: 'Neutral', label: 'Nötr', min: -4, max: 4 },
  { posture: 'MildSupination', label: 'Hafif Supinasyon', min: 4, max: 10 },
  { posture: 'SevereSupination', label: 'Şiddetli Supinasyon', min: 10, max: Infinity },
];

/** Roll açısını ayak postürü kademesine eşler. */
export function classifyFootPosture(rollAngleDeg: number): FootPosture {
  for (const t of PRONATION_TIERS) {
    if (rollAngleDeg >= t.min && rollAngleDeg < t.max) return t.posture;
  }
  return 'Neutral';
}

export function postureTierLabel(posture: FootPosture): string {
  return PRONATION_TIERS.find((t) => t.posture === posture)?.label ?? 'Nötr';
}

/** Basış içgörüsü + ayakkabı/tabanlık önerisi üretir. */
export function assessPronation(input: PronationInput): PronationAssessment {
  const posture = classifyFootPosture(input.rollAngleDeg);
  const pressureBiasPct = input.medialPressurePct - input.lateralPressurePct;

  const insightMap: Record<FootPosture, string> = {
    SevereOverpronation: 'İçe doğru aşırı basış — medial ark çöküyor, plantar yük iç kenarda birikiyor.',
    MildPronation: 'Hafif içe basış — normal amortisör, ancak uzun mesafede medial stres artabilir.',
    Neutral: 'Dengeli basış — yük medial/lateral arasında simetrik dağılıyor.',
    MildSupination: 'Hafif dışa basış — lateral kenar yükleniyor, ayak bileği burkulma riski hafif artıyor.',
    SevereSupination: 'Dışa doğru aşırı basış — lateral yük fazla, şok emilimi azalıyor, burkulma riski yüksek.',
  };
  const recoMap: Record<FootPosture, string> = {
    SevereOverpronation: 'Stabilite ayakkabısı + medial destekli tabanlık (hareket kontrol).',
    MildPronation: 'Nötr-destekli ayakkabı; gerekirse hafif medial dolgu tabanlık.',
    Neutral: 'Nötr ayakkabı — özel destek gerekmez; düzenli basış takibi.',
    MildSupination: 'Yumuşak tamponlu ayakkabı + lateral dolgu; denge/ayak bileği güçlendirme.',
    SevereSupination: 'Maksimum tamponlama + lateral takoz; ayak bileği propriosepsiyon çalışması.',
  };

  return {
    posture,
    tierLabel: postureTierLabel(posture),
    rollAngleDeg: input.rollAngleDeg,
    pressureBiasPct: Math.round(pressureBiasPct),
    insight: insightMap[posture],
    recommendation: recoMap[posture],
  };
}

export function pronationSupinationStatus(): string {
  return 'Pronasyon/Supinasyon: roll açısı 5 kademe • basınç dengesi • ayakkabı/tabanlık önerisi';
}
