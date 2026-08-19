// ============================================================================
// 🖥️ EXTREMES CANLI BİYOMETRİK TELEMETRİ & KIYAS MOTORU
// - Anlık sensör verileri (HRM nabız, MiBand kol kinematiği, FSR tabanlık)
// - Profesyonel referans/hedef değerlerle canlı kıyas + sapma analizi
// - Asimetri & yorgunluk indeksi + zaman ekseninde nabız/GCT serisi
// - Mock-first: donanım bağlı değilse deterministik canlı simülasyon
// (Donanım geldiğinde navigator.bluetooth ile bu şemaya akar)
// ============================================================================

export type CompareStatus = 'ok' | 'warn' | 'down' | 'up';

export interface ComparisonRow {
  metric: string;
  current: string;
  target: string;
  status: CompareStatus;
  badge: string;
  meaning: string;
}

export interface LiveTelemetrySnapshot {
  heartRate: number;        // bpm
  hrvMs: number;
  heartZone: string;
  armAngleDeg: number;      // kol açısı
  swingSpeedKmh: number;
  shotCount: number;
  gctMs: number;
  forefootPct: number;
  heelPct: number;
  loadingRateKnS: number;
  impactDurabilityPct: number;
  fatigueRiskPct: number;
  timestamp: number;
}

export interface TimePoint {
  t: string;
  heartRate: number;
  gctMs: number;
}

// Profesyonel sporcu referans değerleri
const REF = {
  GCT_MAX_MS: 200,
  HR_MAX_BPM: 160,
  SWING_TARGET_KMH: 110,
  LOADING_MAX_KnS: 2.5,
};

// ---------------------------------------------------------------------------
// 2. Canlı Anlık Değer Simülasyonu (mock-first, deterministik)
// ---------------------------------------------------------------------------
let tick = 0;

export function generateLiveSnapshot(seed = 0): LiveTelemetrySnapshot {
  tick += 1;
  const s = tick + seed;
  return {
    heartRate: 158 + (s % 9) * 2 + Math.floor(s / 3) % 4,     // 158-178
    hrvMs: 40 + (s % 5) * 2,
    heartZone: 'Zon 4 - Anaerobik Eşik',
    armAngleDeg: 108 + (s % 7) * 2,                            // 108-120
    swingSpeedKmh: 88 + (s % 7) * 2,                           // 88-100
    shotCount: 32 + (s % 9),
    gctMs: 170 + (s % 8) * 5,                                  // 170-205
    forefootPct: 70 + (s % 6) * 2,                             // 70-80
    heelPct: 30 - (s % 6),
    loadingRateKnS: Number((1.6 + (s % 5) * 0.1).toFixed(1)), // 1.6-2.0
    impactDurabilityPct: 86 + (s % 6),
    fatigueRiskPct: 22 + (s % 9),
    timestamp: Date.now(),
  };
}


// ---------------------------------------------------------------------------
// 3. Anlık Kıyas ve Sapma Analizi — referanslara göre durum üretimi
// ---------------------------------------------------------------------------
export function buildComparisonRows(snap: LiveTelemetrySnapshot): ComparisonRow[] {
  const rows: ComparisonRow[] = [];

  rows.push({
    metric: 'Zemin Temas (GCT)',
    current: `${snap.gctMs} ms`,
    target: `< ${REF.GCT_MAX_MS} ms`,
    status: snap.gctMs < REF.GCT_MAX_MS ? 'ok' : 'warn',
    badge: snap.gctMs < REF.GCT_MAX_MS ? 'Optimal' : 'Yüksek',
    meaning: snap.gctMs < REF.GCT_MAX_MS ? 'Ayak zeminde gereksiz kalmıyor (elit düzey)' : 'Temas süresi uzuyor — reaktif güç kaybı riski',
  });

  rows.push({
    metric: 'Nabız & Efor',
    current: `${snap.heartRate} bpm`,
    target: `< ${REF.HR_MAX_BPM} bpm`,
    status: snap.heartRate < REF.HR_MAX_BPM ? 'ok' : 'warn',
    badge: snap.heartRate < REF.HR_MAX_BPM ? 'Kontrollü' : 'Yüksek',
    meaning: snap.heartRate >= REF.HR_MAX_BPM ? `${snap.heartZone} — hücum fazında` : 'Efor bölgesi kontrollü',
  });

  rows.push({
    metric: 'Kol Savrulma Hızı',
    current: `${snap.swingSpeedKmh} km/h`,
    target: `${REF.SWING_TARGET_KMH} km/h`,
    status: snap.swingSpeedKmh >= REF.SWING_TARGET_KMH ? 'ok' : 'down',
    badge: snap.swingSpeedKmh >= REF.SWING_TARGET_KMH ? 'Hedefte' : `-${REF.SWING_TARGET_KMH - snap.swingSpeedKmh} km/h`,
    meaning: `Savrulma açısı ${snap.armAngleDeg}° yerine 130° hedeflenmeli`,
  });

  rows.push({
    metric: 'Basış Dağılımı',
    current: `%${snap.forefootPct} Ön Ayak`,
    target: 'Ön ağırlık',
    status: snap.forefootPct >= 65 ? 'ok' : 'warn',
    badge: snap.forefootPct >= 65 ? 'Doğru Form' : 'Topuk ağırlıklı',
    meaning: snap.forefootPct >= 65 ? 'Patlayıcı basış — sprinte hazır' : 'Ön ayak yükü artırılmalı',
  });

  rows.push({
    metric: 'Darbe Yükleme Oranı',
    current: `${snap.loadingRateKnS} kN/s`,
    target: `< ${REF.LOADING_MAX_KnS} kN/s`,
    status: snap.loadingRateKnS < REF.LOADING_MAX_KnS ? 'ok' : 'warn',
    badge: snap.loadingRateKnS < REF.LOADING_MAX_KnS ? 'Güvenli' : 'Kritik',
    meaning: snap.loadingRateKnS < REF.LOADING_MAX_KnS ? 'Eklem/menisküs yükü normal sınırlarda' : 'Aşil ve stres kırığı riski yükseliyor',
  });

  return rows;
}

// ---------------------------------------------------------------------------
// 4. Zaman Ekseni — nabız + GCT serisi (çizgi grafik için)
// ---------------------------------------------------------------------------
export function buildTimeSeries(snap: LiveTelemetrySnapshot, history: TimePoint[] = [], maxPoints = 14): TimePoint[] {
  const t = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const next = [...history, { t, heartRate: snap.heartRate, gctMs: snap.gctMs }];
  return next.slice(-maxPoints);
}

// ---------------------------------------------------------------------------
// 5. Durum Özeti (header rozeti)
// ---------------------------------------------------------------------------
export function dashboardSummary(snap: LiveTelemetrySnapshot): { status: 'ok' | 'warn'; text: string } {
  const rows = buildComparisonRows(snap);
  const okCount = rows.filter((r) => r.status === 'ok').length;
  const warnCount = rows.length - okCount;
  return warnCount === 0 ? { status: 'ok', text: 'TÜM METRİKLER OPTİMAL' } : { status: 'warn', text: `${warnCount} METRİK HEDEF DIŞINDA` };
}

export function liveTelemetryStatus(): string {
  return 'Canlı Biyometrik Panel: HRM • MiBand • FSR • referans kıyas • zaman serisi hazır';
}

