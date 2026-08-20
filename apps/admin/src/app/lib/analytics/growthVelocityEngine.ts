// ============================================================================
// 🌱 BÜYÜME HIZI & PEAK HEIGHT VELOCITY (PHV) MOTORU (Adım 67)
// Boy/kilo ölçümlerini yaş ilerlemesiyle çizer; anlık büyüme hızı (cm/yıl)
// ve PHV bükülme noktalarını hesaplar; büyüme atağında koordinasyon
// adaptasyonu danışma banner'ı üretir. Deterministik; sıfır bağımlılık.
// ============================================================================

export interface GrowthMeasurement {
  date: string;       // ISO tarih
  heightCm: number;
  weightKg?: number;
}

export interface GrowthVelocityPoint {
  date: string;                 // orta nokta tarihi
  heightCm: number;
  velocityCmPerYear: number;    // anlık hız (cm/yıl)
  isPhvPeak: boolean;
}

export const PHV_THRESHOLD_CM_PER_YEAR = 9;

/** Ardışık ölçümler arası anlık büyüme hızını hesaplar (cm/yıl). */
export function growthVelocity(points: GrowthMeasurement[]): GrowthVelocityPoint[] {
  const out: GrowthVelocityPoint[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const days = Math.max(1, (new Date(b.date).getTime() - new Date(a.date).getTime()) / 86_400_000);
    const velocity = Number((((b.heightCm - a.heightCm) / days) * 365).toFixed(2));
    const midDate = new Date((new Date(a.date).getTime() + new Date(b.date).getTime()) / 2).toISOString().slice(0, 10);
    out.push({ date: midDate, heightCm: b.heightCm, velocityCmPerYear: velocity, isPhvPeak: false });
  }
  // PHV tepe noktası: en yüksek hız
  if (out.length > 0) {
    const maxIdx = out.reduce((best, p, i, arr) => (p.velocityCmPerYear > arr[best].velocityCmPerYear ? i : best), 0);
    out[maxIdx].isPhvPeak = true;
  }
  return out;
}

export interface PhvDetection {
  phvDetected: boolean;
  peakVelocityCmPerYear: number;
  phvDate: string | null;
  advisory: string;
}

/** PHV bükülme noktası tespiti + koordinasyon adaptasyonu danışması. */
export function detectPhv(points: GrowthMeasurement[]): PhvDetection {
  const velocities = growthVelocity(points);
  if (velocities.length === 0) {
    return { phvDetected: false, peakVelocityCmPerYear: 0, phvDate: null, advisory: 'Yeterli ölçüm yok — 3 ayda bir boy kaydı önerilir' };
  }
  const peak = velocities.reduce((best, v) => (v.velocityCmPerYear > best.velocityCmPerYear ? v : best), velocities[0]);
  const phvDetected = peak.velocityCmPerYear >= PHV_THRESHOLD_CM_PER_YEAR;
  const advisory = phvDetected
    ? `🌱 PHV tespit edildi (${peak.velocityCmPerYear} cm/yıl, ${peak.date}) — geçici koordinasyon adaptasyonu beklenir; yük modifikasyonu + veli bilgilendirme önerilir`
    : `ℹ️ Büyüme hızı ${peak.velocityCmPerYear} cm/yıl — PHV eşiği (${PHV_THRESHOLD_CM_PER_YEAR} cm/yıl) altında, takip devam`;
  return { phvDetected, peakVelocityCmPerYear: peak.velocityCmPerYear, phvDate: peak.date, advisory };
}

export function growthVelocityStatus(): string {
  return `Büyüme Hızı: cm/yıl türev • PHV bükülme (≥${PHV_THRESHOLD_CM_PER_YEAR}) • koordinasyon banner`;
}
