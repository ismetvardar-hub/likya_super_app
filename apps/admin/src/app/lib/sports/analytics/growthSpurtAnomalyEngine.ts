// ============================================================================
// 🌱 BÜYÜME ATAĞI (PHV) BİYOMEKANİK ANOMALİ TESPİTİ (Adım 40)
// Adölesan "awkwardness": tepe boy hızında geçici koordinasyon bozulması
//  • 3 aylık boy ölçümü (/parent): boy artışı > 2 cm/çeyrek → PHV şüphesi
//  • RSI düşüşü > %15 veya artan asimetri ile çapraz referans
//  • Veliye sade dilde güvence: geçici adaptasyon, sakatlık riski kontrol altında
// Deterministik; sıfır bağımlılık.
// ============================================================================

export const PHV_HEIGHT_JUMP_CM_QUARTER = 2.0;
export const PHV_RSI_DROP_THRESHOLD_PCT = 15;

export interface HeightMeasurement {
  measuredAt: string; // ISO tarih
  heightCm: number;
}

export interface GrowthSpurtInput {
  heightHistory: HeightMeasurement[]; // ≥2 ölçüm, ~3 ay arayla
  rsiBaseline: number;
  rsiCurrent: number;
  asymPct: number; // güncel L/R asimetri %
}

export type PhvStatus = 'phv_yok' | 'phv_beklentisi' | 'phv_anomali' | 'phv_saglikli';

export interface GrowthSpurtAssessment {
  growthCmPerQuarter: number;
  phvDetected: boolean;
  rsiDropPct: number;
  asymmetryIncreased: boolean;
  anomaly: boolean;
  status: PhvStatus;
  reassurance: string;
  note: string;
}

/** 3 aylık boy artışını çeyrek başına cm olarak hesaplar. */
export function growthCmPerQuarter(history: HeightMeasurement[]): number {
  if (history.length < 2) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  const days = Math.max(1, (new Date(last.measuredAt).getTime() - new Date(first.measuredAt).getTime()) / 86_400_000);
  return Number(((last.heightCm - first.heightCm) / Math.max(1, days) * 91.25).toFixed(1));
}

/** Çeyrek boy artışı → PHV beklentisi eşiği (2 cm/çeyrek). */
export function isPhvGrowth(cms: number): boolean {
  return cms > PHV_HEIGHT_JUMP_CM_QUARTER;
}

export const PARENTAL_REASSURANCE =
  'Bu durum büyüme atağından kaynaklanan geçici koordinasyon adaptasyonudur; sakatlık riski kontrol altındadır.';

/**
 * PHV + RSI düşüşü/asimetri çapraz referansı ile anomali tespiti.
 * Boy artışı >2cm/çeyrek VE (RSI düşüşü >%15 veya asimetri yüksek) → anomali.
 */
export function assessGrowthSpurt(input: GrowthSpurtInput): GrowthSpurtAssessment {
  const growth = growthCmPerQuarter(input.heightHistory);
  const phvDetected = isPhvGrowth(growth);
  const rsiDropPct = input.rsiBaseline > 0 ? Number((((input.rsiBaseline - input.rsiCurrent) / input.rsiBaseline) * 100).toFixed(1)) : 0;
  const asymmetryIncreased = input.asymPct > 10;
  const anomaly = phvDetected && (rsiDropPct > PHV_RSI_DROP_THRESHOLD_PCT || asymmetryIncreased);

  let status: PhvStatus;
  let note: string;
  if (anomaly) {
    status = 'phv_anomali';
    note = `PHV tespit edildi (${growth} cm/çeyrek) + RSI -${rsiDropPct}%${asymmetryIncreased ? ' + asimetri' : ''} — geçici koordinasyon adaptasyonu; büyüme plakları korunmalı, yük modifikasyonu önerilir`;
  } else if (phvDetected) {
    status = 'phv_saglikli';
    note = `PHV dönemi (${growth} cm/çeyrek) — biyomekanik metrikler beklenen bantta; kontrollü güç çalışması sürdürülebilir`;
  } else if (growth > 0) {
    status = 'phv_beklentisi';
    note = `Boy artışı ${growth} cm/çeyrek — PHV eşiği (2 cm) altında; izlem devam`;
  } else {
    status = 'phv_yok';
    note = 'Yeterli boy ölçümü yok — /parent üzerinden aylık boy kaydı başlatın';
  }

  return {
    growthCmPerQuarter: growth,
    phvDetected,
    rsiDropPct,
    asymmetryIncreased,
    anomaly,
    status,
    reassurance: PARENTAL_REASSURANCE,
    note,
  };
}

export function growthSpurtAnomalyStatus(): string {
  return `PHV Anomali: >${PHV_HEIGHT_JUMP_CM_QUARTER} cm/çeyrek + RSI>${PHV_RSI_DROP_THRESHOLD_PCT}% • veli güvence mesajı`;
}
