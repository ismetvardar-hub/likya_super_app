// ============================================================================
// 🧬 SPOR BİLİMİ & KİNEMATİK ANALİTİK MOTORU — 3 EKSEN (Elit Performans)
// Dış Yük (Kinematik) • İç Yük (Fizyolojik) • Nöromusküler/Biyomekanik
// Sensörler: Göğüs Bandı (HRM) + MiBand IMU + Tabanlık FSR + Telefon Kamerası
// - RSI (Reaktif Güç İndeksi), Dinamik Loading Rate (dF/dt)
// - Yüksek Yoğunluk Deselerasyon Sayacı (> -3.5 m/s²)
// - TRIMP (Training Impulse), HRR 60s, HRV rMSSD
// - Elit benchmark yüzdelik sıralamaları + yorgunluk/performans oranı
// - Seans veri seti dışa aktarımı (JSON / CSV)
// - Mock-first: donanım bağlı değilse deterministik simülasyon
// ============================================================================

import type { LiveTelemetrySnapshot } from './liveTelemetryEngine';

// ---------------------------------------------------------------------------
// 1. Üç Eksenli Spor Bilimi Metrik Şeması
// ---------------------------------------------------------------------------
export interface SportsScienceMetrics {
  // ── DIŞ YÜK (Kinematik) ──
  vMaxKmh: number;               // maks koşu hızı
  accelerationMps2: number;      // 0-5m patlayıcı ivmelenme
  decelerationCount: number;     // > -3.5 m/s² sert frenleme sayısı
  codAgilityMs: number;          // yön değiştirme çevikliği
  flightMs: number;              // uçuş süresi (FSR)
  jumpHeightCm: number;          // sıçrama yüksekliği
  // ── NÖROMUSKÜLER / BİYOMEKANİK ──
  rsi: number;                   // Reaktif Güç İndeksi = flight / gct
  loadingRateKnS: number;        // dF/dt darbe yükleme oranı
  footStrike: { forefootPct: number; midfootPct: number; heelPct: number };
  propulsionMs: number;          // itiş fazı süresi
  // ── İÇ YÜK (Fizyolojik) ──
  trimp: number;                 // Training Impulse (zon ağırlıklı)
  hrvRmssdMs: number;            // otonom stres göstergesi
  hrr60Bpm: number;              // 60s kalp toparlanması
  timestamp: number;
}

export interface BenchmarkRow {
  metric: string;
  value: string;
  elite: string;
  percentile: number;   // 0-100 (sporcunun elit kitleye göre yüzdelik dilimi)
  status: 'ELITE' | 'GOOD' | 'DEVELOPING';
}

export interface FatiguePerformancePoint {
  rsi: number;
  trimp: number;
  timestamp: number;
}

const G = 9.81;

// Elit benchmark referansları
const BENCHMARKS = {
  RSI: 0.6,
  VMAX_KMH: 24,
  ACCEL_MPS2: 4.5,
  DECEL_FLAG: -3.5,
  COD_MS: 280,
  JUMP_CM: 45,
  LOADING_KnS: 2.5,
  TRIMP_SESSION: 60,
  HRV_RMSSD: 65,
  HRR60: 30,
};

// TRIMP zon ağırlıkları (Edwards)
const TRIMP_WEIGHT: Record<string, number> = { 'Zon 1': 1, 'Zon 2': 2, 'Zon 3': 3, 'Zon 4': 4, 'Zon 5': 5 };

// ---------------------------------------------------------------------------
// 2. Dinamik Metrik Hesaplamaları (canlı telemetriden türetilir)
// ---------------------------------------------------------------------------
export function computeSportsScienceMetrics(base: LiveTelemetrySnapshot, seed = 0): SportsScienceMetrics {
  const s = base.timestamp % 997;
  const zone = base.heartZone;
  const zoneWeight = TRIMP_WEIGHT[zone] ?? 3;

  // Uçuş süresi: FSR temas kesintisi (deterministik 380-520ms)
  const flightMs = 380 + (s % 14) * 10;
  // Sıçrama yüksekliği: h = (g · t²) / 8
  const jumpHeightCm = Number(((G * Math.pow(flightMs / 1000, 2)) / 8 * 100).toFixed(1));

  return {
    // Dış yük
    vMaxKmh: Number((18 + (s % 9) * 0.7).toFixed(1)),
    accelerationMps2: Number((3.2 + (s % 5) * 0.35).toFixed(2)),
    decelerationCount: (s % 4) === 0 ? 1 + (s % 3) : 0,   // > -3.5 m/s² sert frenleme
    codAgilityMs: Math.round(240 + (s % 12) * 8),
    flightMs,
    jumpHeightCm,
    // Nöromusküler
    rsi: Number((flightMs / Math.max(1, base.gctMs)).toFixed(2)),
    loadingRateKnS: base.loadingRateKnS,
    footStrike: (() => {
      const fore = base.forefootPct;
      const heel = base.heelPct;
      const ratio = 100 / Math.max(1, fore + heel);
      const foreN = Math.round(fore * ratio);
      const heelN = Math.round(heel * ratio);
      return { forefootPct: foreN, midfootPct: 100 - foreN - heelN, heelPct: heelN };
    })(),
    propulsionMs: Math.round(90 + (s % 9) * 9),
    // İç yük
    trimp: Math.round(zoneWeight * (10 + (s % 12))),       // zon ağırlığı × dakika
    hrvRmssdMs: base.hrvMs - 2,
    hrr60Bpm: Math.round(22 + (s % 12)),                    // 60s düşüş (24-34)
    timestamp: base.timestamp,
  };
}

// ---------------------------------------------------------------------------
// 3. Elit Benchmark Yüzdelik Sıralaması
// ---------------------------------------------------------------------------
export function percentileRank(metric: keyof typeof BENCHMARKS, value: number): number {
  const elite = BENCHMARKS[metric];
  // Yüksek=iyi olan metrikler için %100 elit seviyede; düşük=iyi için ters oran
  const higherIsBetter = !['DECEL_FLAG', 'COD_MS', 'LOADING_KnS'].includes(metric);
  const ratio = Math.abs(value) / Math.abs(elite);
  const pct = higherIsBetter ? Math.min(100, ratio * 100) : Math.max(0, 100 - (ratio - 1) * 100);
  return Math.round(pct);
}

export function buildBenchmarkComparison(m: SportsScienceMetrics): BenchmarkRow[] {
  const rows: BenchmarkRow[] = [
    { metric: 'RSI (Reaktif Güç)', value: m.rsi.toFixed(2), elite: `≥ ${BENCHMARKS.RSI}`, percentile: percentileRank('RSI', m.rsi), status: 'GOOD' },
    { metric: 'Maks Hız (Vmax)', value: `${m.vMaxKmh} km/h`, elite: `≥ ${BENCHMARKS.VMAX_KMH}`, percentile: percentileRank('VMAX_KMH', m.vMaxKmh), status: 'GOOD' },
    { metric: 'İvmelenme (0-5m)', value: `${m.accelerationMps2} m/s²`, elite: `≥ ${BENCHMARKS.ACCEL_MPS2}`, percentile: percentileRank('ACCEL_MPS2', m.accelerationMps2), status: 'GOOD' },
    { metric: 'COD Çeviklik', value: `${m.codAgilityMs} ms`, elite: `≤ ${BENCHMARKS.COD_MS}`, percentile: percentileRank('COD_MS', m.codAgilityMs), status: 'GOOD' },
    { metric: 'Sıçrama Yüksekliği', value: `${m.jumpHeightCm} cm`, elite: `≥ ${BENCHMARKS.JUMP_CM}`, percentile: percentileRank('JUMP_CM', m.jumpHeightCm), status: 'GOOD' },
    { metric: 'TRIMP (Antrenman Yükü)', value: `${m.trimp} AU`, elite: `~${BENCHMARKS.TRIMP_SESSION}`, percentile: Math.min(100, Math.round((m.trimp / BENCHMARKS.TRIMP_SESSION) * 100)), status: 'GOOD' },
    { metric: 'HRV rMSSD', value: `${m.hrvRmssdMs} ms`, elite: `≥ ${BENCHMARKS.HRV_RMSSD}`, percentile: percentileRank('HRV_RMSSD', m.hrvRmssdMs), status: 'GOOD' },
    { metric: 'HRR 60s (Toparlanma)', value: `${m.hrr60Bpm} bpm`, elite: `≥ ${BENCHMARKS.HRR60}`, percentile: percentileRank('HRR60', m.hrr60Bpm), status: 'GOOD' },
  ];
  // Durum etiketi: percentile'a göre
  return rows.map((r) => ({ ...r, status: r.percentile >= 85 ? 'ELITE' : r.percentile >= 60 ? 'GOOD' : 'DEVELOPING' }));
}


// ---------------------------------------------------------------------------
// 4. Yorgunluk-Performans Oranı (RSI düşüşü izleme)
// ---------------------------------------------------------------------------
export function fatigueToPerformanceRatio(history: FatiguePerformancePoint[]): { ratio: number; trend: 'stabil' | 'düşüyor' | 'risk'; recommendation: string } {
  if (history.length < 2) return { ratio: 1, trend: 'stabil', recommendation: 'Yeterli veri yok — seans ilerledikçe RSI/TRIMP izlenir' };
  const first = history[0];
  const last = history[history.length - 1];
  const rsiDrop = Math.max(0, first.rsi - last.rsi);
  const trimpRise = Math.max(1, last.trimp - first.trimp);
  const ratio = Number((rsiDrop / trimpRise).toFixed(3));
  const trend = ratio > 0.04 ? 'düşüyor' : ratio > 0.02 ? 'stabil' : 'stabil';
  const recommendation = trend === 'düşüyor'
    ? '⚠️ RSI düşerken TRIMP yükseliyor — yorgunluk birikimi; yoğunluğu azalt'
    : '✅ RSI/TRIMP dengesi stabil — hacim artırılabilir';
  return { ratio, trend: trend as 'stabil' | 'düşüyor' | 'risk', recommendation };
}

// ---------------------------------------------------------------------------
// 5. Seans Veri Seti Dışa Aktarımı (JSON / CSV)
// ---------------------------------------------------------------------------
const CSV_HEADER = 'timestamp,vmax_kmh,accel_mps2,decel_count,cod_ms,flight_ms,jump_cm,rsi,loading_kns,forefoot_pct,midfoot_pct,heel_pct,propulsion_ms,trimp,hrv_ms,hrr60_bpm';

export function exportSessionDataset(rows: SportsScienceMetrics[]): { json: string; csv: string } {
  const json = JSON.stringify(rows, null, 2);
  const csvLines = rows.map((m) =>
    [m.timestamp, m.vMaxKmh, m.accelerationMps2, m.decelerationCount, m.codAgilityMs, m.flightMs, m.jumpHeightCm, m.rsi, m.loadingRateKnS, m.footStrike.forefootPct, m.footStrike.midfootPct, m.footStrike.heelPct, m.propulsionMs, m.trimp, m.hrvRmssdMs, m.hrr60Bpm].join(',')
  );
  return { json, csv: [CSV_HEADER, ...csvLines].join('\n') };
}

export function sportsScienceStatus(): string {
  return 'Spor Bilimi Motoru: RSI • dF/dt • Deselerasyon • TRIMP • HRR • yüzdelik • CSV/JSON';
}

