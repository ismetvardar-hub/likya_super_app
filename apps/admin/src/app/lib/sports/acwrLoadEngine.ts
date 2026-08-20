// ============================================================================
// ⚖️ ACWR YÜK DENGESİ + EXP-TRIMP MOTORU (Akut:Kronik Yük Oranı)
// • Akut (7 gün) ve Kronik (28 gün) yük ortalaması → 0.8-1.3 optimal bölge
// • >1.5 kırmızı bölge (sakatlık riski ~4x), <0.8 düşük yük (kondisyon kaybı)
// • Banister exp-TRIMP: TRIMP = dk · ΔHR-ratio · e^(b·ΔHR-ratio)
// Deterministik; Plan Z güvenli; sıfır bağımlılık.
// ============================================================================

export interface DailyLoad {
  date: string; // ISO gün (YYYY-MM-DD)
  load: number; // TRIMP / session yükü (AU)
}

export type AcwrZone = 'cok_dusuk' | 'dusuk' | 'optimal' | 'dikkat' | 'kirmizi';

export interface AcwrResult {
  acute: number;   // 7 gün ortalaması
  chronic: number; // 28 gün ortalaması
  ratio: number;   // akut / kronik
  zone: AcwrZone;
  advisory: string;
}

/** Akut (7) ve Kronik (28) yük penceresiyle ACWR oranı hesaplar. */
export function computeAcwr(dailyLoads: DailyLoad[], acuteDays = 7, chronicDays = 28): AcwrResult {
  const loads = dailyLoads.map((d) => d.load);
  const acute = loads.slice(-acuteDays);
  const chronic = loads.slice(-chronicDays);
  const mean = (a: number[]) => (a.length === 0 ? 0 : a.reduce((x, y) => x + y, 0) / a.length);
  const a = mean(acute);
  const c = mean(chronic);
  const ratio = c <= 0 ? 0 : Number((a / c).toFixed(2));

  let zone: AcwrZone;
  let advisory: string;
  if (c === 0) {
    zone = 'cok_dusuk';
    advisory = 'Kronik yük kaydı yok — ilk 28 gün baz çizgisi oluşturuluyor.';
  } else if (ratio > 1.5) {
    zone = 'kirmizi';
    advisory = '⚠️ Akut yük kronik bazı %50+ aşıyor — sakatlık riski ~4x. Yoğunluğu/hacmi hemen düşür.';
  } else if (ratio > 1.3) {
    zone = 'dikkat';
    advisory = '⚠️ Yük dengesi üst sınırda — bu hafta ek yük eklemeyin, toparlanma seansı planla.';
  } else if (ratio >= 0.8) {
    zone = 'optimal';
    advisory = '✅ ACWR 0.8-1.3 optimal bölgede — kademeli yükleme sürdürülebilir.';
  } else if (ratio >= 0.5) {
    zone = 'dusuk';
    advisory = 'ℹ️ Yük dengesi düşük — kapasite kaybı olmadan kademeli +%10 artış önerilir.';
  } else {
    zone = 'cok_dusuk';
    advisory = 'ℹ️ Çok düşük yük — akut hacmi aşamalı artırarak kronik baza yaklaştır.';
  }
  return { acute: Number(a.toFixed(1)), chronic: Number(c.toFixed(1)), ratio, zone, advisory };
}

/**
 * Banister exp-TRIMP — kalp hızı profiline göre kardiyovasküler yük (AU).
 * b katsayısı: erkek 1.92, kadın 1.67 (yüksek efor üstel ağırlıklandırılır).
 */
export function trimpExponential(input: {
  durationMin: number;
  avgHr: number;
  restHr: number;
  maxHr: number;
  sex?: 'M' | 'F';
}): { trimp: number; deltaHrRatio: number; interpretation: string } {
  const { durationMin, avgHr, restHr, maxHr, sex = 'M' } = input;
  const hrRange = Math.max(1, maxHr - restHr);
  const deltaHrRatio = Math.max(0, Math.min(1, (avgHr - restHr) / hrRange));
  const b = sex === 'F' ? 1.67 : 1.92;
  const trimp = Math.round(durationMin * deltaHrRatio * Math.exp(b * deltaHrRatio));
  const interpretation =
    trimp > 120 ? 'Yüksek kardiyovasküler yük — 48h toparlanma gerekebilir'
    : trimp > 60 ? 'Orta yük — 24h toparlanma önerilir'
    : 'Düşük/orta yük — günlük toparlanma yeterli';
  return { trimp, deltaHrRatio: Number(deltaHrRatio.toFixed(3)), interpretation };
}

export function acwrLoadStatus(): string {
  return 'ACWR Yük Dengesi: 7/28 gün • optimal 0.8-1.3 • kırmızı >1.5 • Banister exp-TRIMP';
}
