// ============================================================================
// 🛑 DESELERASYON STRES İNDEKSİ (Adım 37)
// Yüksek negatif ivmelerden (a < -3.0 m/s²) mekanik fren stresi:
//  • COD (yön değiştirme) ve ani duruşlar sırasında IMU/Tabanlık spike'ları
//  • Kümülatif Deselerasyon Yükü (CDL) + diz eklemi tork risk bayrakları
// Deterministik; sıfır bağımlılık; Plan Z güvenli.
// ============================================================================

export const DECEL_THRESHOLD_MPS2 = -3.0;  // fren eşiği
export const HIGH_IMPACT_THRESHOLD_MPS2 = -6.0; // yüksek darbe freni

export interface AccelSample {
  tMs: number;
  a: number; // m/s² (negatif = yavaşlama)
}

export interface DecelerationEvent {
  tMs: number;
  peakDecelMps2: number;
  durationMs: number;
  velocityLostMs: number; // |a| × Δt → kaybedilen hız (m/s)
  highImpact: boolean;
}

export interface DecelerationStressReport {
  eventCount: number;
  highImpactCount: number;
  cdl: number;            // Kümülatif Deselerasyon Yükü (m/s hız kaybı toplamı)
  averageDecelMps2: number;
  kneeTorqueRisk: boolean; // yüksek darbe freni yoğunluğu → risk
  riskLevel: 'dusuk' | 'orta' | 'yuksek';
  advisory: string;
}

/** Bir örneğin frenleme olayı olup olmadığı (a < -3.0 m/s²). */
export function isBrakingEvent(a: number): boolean {
  return a < DECEL_THRESHOLD_MPS2;
}

/**
 * Örnekleri gruplayarak frenleme olaylarını çıkarır ve CDL + risk hesabı yapar.
 * CDL = Σ |a| × Δt — kod dönüşlerinde biriken mekanik fren yükü.
 */
export function analyzeDecelerationLoad(samples: AccelSample[]): DecelerationStressReport {
  const events: DecelerationEvent[] = [];
  let current: DecelerationEvent | null = null;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (isBrakingEvent(s.a)) {
      if (!current) {
        current = { tMs: s.tMs, peakDecelMps2: s.a, durationMs: 0, velocityLostMs: 0, highImpact: false };
      }
      current.peakDecelMps2 = Math.min(current.peakDecelMps2, s.a);
      current.durationMs = i + 1 < samples.length ? samples[i + 1].tMs - s.tMs : 50;
      current.velocityLostMs = Math.abs(current.peakDecelMps2) * (current.durationMs / 1000);
      current.highImpact = current.peakDecelMps2 <= HIGH_IMPACT_THRESHOLD_MPS2;
    } else if (current) {
      events.push(current);
      current = null;
    }
  }
  if (current) events.push(current);

  const cdl = Number(events.reduce((sum, e) => sum + e.velocityLostMs, 0).toFixed(1));
  const highImpactCount = events.filter((e) => e.highImpact).length;
  const averageDecelMps2 = events.length > 0 ? Number((events.reduce((s, e) => s + Math.abs(e.peakDecelMps2), 0) / events.length).toFixed(2)) : 0;

  // Risk: yüksek darbe freni (≤-6 m/s²) yoğunluğu ve toplam fren yükü
  const riskLevel: DecelerationStressReport['riskLevel'] =
    highImpactCount >= 5 || cdl > 25 ? 'yuksek' : highImpactCount >= 2 || cdl > 10 ? 'orta' : 'dusuk';
  const kneeTorqueRisk = riskLevel !== 'dusuk';

  const advisory =
    riskLevel === 'yuksek'
      ? `🚨 Yüksek fren stresi: ${highImpactCount} yüksek darbe freni, CDL ${cdl} m/s — diz/patella stresi riski; deselerasyon yükünü düşür, diz kuvvetlendirme`
      : riskLevel === 'orta'
        ? `⚠️ Orta fren stresi: CDL ${cdl} m/s, ${highImpactCount} yüksek darbe — set arası dinlenme + frenleme tekniği`
        : `✅ Düşük fren stresi: ${events.length} olay, CDL ${cdl} m/s — yük yönetimi uygun`;
  return { eventCount: events.length, highImpactCount, cdl, averageDecelMps2, kneeTorqueRisk, riskLevel, advisory };
}

export function decelerationStressStatus(): string {
  return `Deselerasyon: a<-${Math.abs(DECEL_THRESHOLD_MPS2)} m/s² • CDL • diz tork riski (${HIGH_IMPACT_THRESHOLD_MPS2} m/s² üst darbe)`;
}
