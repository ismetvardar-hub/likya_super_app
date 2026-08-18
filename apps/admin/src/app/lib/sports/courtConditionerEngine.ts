// ============================================================================
// 🏀 SPORTVISIONX — KONDİSYON & DRILL MOTORU (Outcome-Driven)
// "The 17s Court Conditioner" — 60 saniyelik saha içi kondisyon testi
//   • Ölçekler: Başlangıç (9-11 geçiş) / Orta (13-15 geçiş) / İleri (17 geçiş)
//   • Ayak dönüş biyomekaniği (pivot) + nabız/toparlanma izleme veri yapısı
// U8-U16 atletik gelişim pencereleri (patlayıcı güç, dikey sıçrama, reaksiyon)
// ============================================================================

export type ConditionerScale = 'baslangic' | 'orta' | 'ileri';

export interface ConditionerScaleSpec {
  id: ConditionerScale;
  label: string;
  minPasses: number;
  maxPasses: number;
  targetPasses: number;
  restSec: number;
  description: string;
}

export const CONDITIONER_SCALES: ConditionerScaleSpec[] = [
  { id: 'baslangic', label: 'Başlangıç', minPasses: 9, maxPasses: 11, targetPasses: 11, restSec: 60, description: 'Düşük tempo geçiş + 60s tam dinlenme — yeni başlayan sporcular' },
  { id: 'orta', label: 'Orta', minPasses: 13, maxPasses: 15, targetPasses: 15, restSec: 45, description: 'Orta tempo geçiş + 45s aktif toparlanma — gelişim penceresi' },
  { id: 'ileri', label: 'İleri', minPasses: 15, maxPasses: 17, targetPasses: 17, restSec: 30, description: 'Maksimal 17 geçiş + 30s — elit kondisyon hedefi' },
];

/** Ayak dönüş (pivot) biyomekanik ölçümleri — 60s test boyunca. */
export interface PivotBiomechanics {
  totalPivots: number;
  dominantFootPivots: number;
  offFootPivots: number;
  avgPivotDegrees: number; // ortalama dönüş açısı
  weightTransfer: 0 | 1 | 2 | 3; // 0=zayıf … 3=mükemmel
  balanceLosses: number; // denge kaybı sayısı
}

/** Nabız / toparlanma izleme veri yapısı. */
export interface HeartRecovery {
  restingBpm: number;
  peakBpm: number;
  recovery60Bpm: number; // 60. saniyedeki nabız
  recoveryRate: number; // yüzde (düşüş oranı)
}

export interface CourtConditionerResult {
  id: string;
  athlete: string;
  ageGroup: string; // U8 … U16
  scale: ConditionerScale;
  passes: number;
  durationSec: number; // 60
  completedAt: string;
  pivot: PivotBiomechanics;
  heart: HeartRecovery;
  verdict: 'PASS' | 'FAIL';
  nextScale: ConditionerScale;
}

/** 17s Court Conditioner testini değerlendirir — deterministik skorlama. */
export function runCourtConditioner(input: {
  athlete: string;
  ageGroup: string;
  scale: ConditionerScale;
  passes: number;
  pivot?: Partial<PivotBiomechanics>;
  heart?: Partial<HeartRecovery>;
}): CourtConditionerResult {
  const spec = CONDITIONER_SCALES.find((s) => s.id === input.scale) ?? CONDITIONER_SCALES[0];

  const pivot: PivotBiomechanics = {
    totalPivots: input.pivot?.totalPivots ?? Math.min(input.passes, 17),
    dominantFootPivots: input.pivot?.dominantFootPivots ?? Math.round(input.passes * 0.6),
    offFootPivots: input.pivot?.offFootPivots ?? Math.round(input.passes * 0.4),
    avgPivotDegrees: input.pivot?.avgPivotDegrees ?? 90,
    weightTransfer: input.pivot?.weightTransfer ?? 2,
    balanceLosses: input.pivot?.balanceLosses ?? Math.max(0, input.passes - 12),
  };

  const heart: HeartRecovery = {
    restingBpm: input.heart?.restingBpm ?? 72,
    peakBpm: input.heart?.peakBpm ?? 178,
    recovery60Bpm: input.heart?.recovery60Bpm ?? 118,
    recoveryRate: input.heart?.recoveryRate ?? 34,
  };
  if (!input.heart?.recoveryRate) {
    heart.recoveryRate = Math.round(((heart.peakBpm - heart.recovery60Bpm) / heart.peakBpm) * 100);
  }

  const inBand = input.passes >= spec.minPasses && input.passes <= spec.maxPasses;
  const verdict: CourtConditionerResult['verdict'] = input.passes >= spec.targetPasses ? 'PASS' : 'FAIL';

  const scaleOrder: ConditionerScale[] = ['baslangic', 'orta', 'ileri'];
  const nextIdx = Math.min(scaleOrder.indexOf(input.scale) + 1, scaleOrder.length - 1);
  const nextScale: ConditionerScale = verdict === 'PASS' && inBand ? scaleOrder[nextIdx] : input.scale;

  return {
    id: `cc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    athlete: input.athlete,
    ageGroup: input.ageGroup,
    scale: input.scale,
    passes: input.passes,
    durationSec: 60,
    completedAt: new Date().toISOString(),
    pivot,
    heart,
    verdict,
    nextScale,
  };
}

// ============================================================================
// U8-U16 ATLETİK GELİŞİM MATRİSİ — hazır reçeteler
// ============================================================================

export interface AthleticPrescription {
  ageGroup: string;
  phase: string;
  explosivePower: string;
  verticalJump: string;
  reaction: string;
  agility: string;
  weeklyLoad: string;
}

export const ATHLETIC_MATRIX: AthleticPrescription[] = [
  {
    ageGroup: 'U8',
    phase: 'Temel Hareket Becerileri',
    explosivePower: '10x zıplama merdiveni (düşük yoğunluk)',
    verticalJump: 'Squat jump 2x5 (vücut ağırlığı)',
    reaction: 'Görsel işaret tepkisi 3x8 (ışık tablası)',
    agility: '4x8m mekik 3 set',
    weeklyLoad: '2 antrenman / 30dk',
  },
  {
    ageGroup: 'U10',
    phase: 'Koordinasyon Pencere 1',
    explosivePower: 'Hurdle jump 3x6 (20cm)',
    verticalJump: 'Counter-movement jump 3x5',
    reaction: 'Ses + görsel tepki 4x6',
    agility: 'T-Drill 4 tur (reaksiyon hızı ölçümü)',
    weeklyLoad: '3 antrenman / 45dk',
  },
  {
    ageGroup: 'U12',
    phase: 'Hız-Aktif Gelişim',
    explosivePower: 'Box jump 4x5 (30cm)',
    verticalJump: 'CMJ + arm swing 4x4',
    reaction: '5-0-5 çeviklik 4x3 (dominant/off foot)',
    agility: 'Pro-agility 4 tur + pivot kaydı',
    weeklyLoad: '3 antrenman / 60dk',
  },
  {
    ageGroup: 'U14',
    phase: 'Patlayıcı Kuvvet Pencere',
    explosivePower: 'Med-ball slam 4x8 (3kg) + broad jump 4x4',
    verticalJump: 'Max CMJ izleme (haftalık log)',
    reaction: 'Start reaksiyonu 5x5 (0.2s hedef)',
    agility: '17s Court Conditioner — Orta ölçek',
    weeklyLoad: '4 antrenman / 75dk',
  },
  {
    ageGroup: 'U16',
    phase: 'Kondisyon — 17s Odak',
    explosivePower: 'Depth jump 4x6 (35cm)',
    verticalJump: 'Max vertical (standart protokol)',
    reaction: 'Reaksiyon tablası 6x5 + pivot biomekanik kaydı',
    agility: '17s Court Conditioner — İleri ölçek (17 geçiş)',
    weeklyLoad: '4 antrenman / 90dk',
  },
];

export function athleticPrescription(ageGroup: string): AthleticPrescription {
  const clean = ageGroup.trim().toUpperCase();
  const found = ATHLETIC_MATRIX.find((p) => p.ageGroup === clean);
  if (found) return found;
  const digits = clean.match(/\d+/);
  if (digits) {
    const n = Math.min(16, Math.max(8, Number(digits[0])));
    const near = ATHLETIC_MATRIX.find((p) => p.ageGroup === `U${n}`) ?? ATHLETIC_MATRIX[Math.floor((n - 8) / 2)];
    return near;
  }
  return ATHLETIC_MATRIX[0];
}

export function courtConditionerEngineStatus(): string {
  return `SportVisionX Kondisyon Motoru [3 ölçek • 17s test • U8-U16 matris (${ATHLETIC_MATRIX.length} reçete)]`;
}

