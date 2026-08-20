// ============================================================================
// 🤖 AI KOÇ ÖNERİ MOTORU — zayıf bölge → drill reçetesi + büyüme atağı anomali
// • Metrikleri elit hedeflerle karşılaştırıp öncelikli drill reçetesi üretir
// • Büyüme atağı (PHV) döneminde biyomekanik anomali tespiti (GCT/yükleme kayması)
// Deterministik kurallar; LLM gerektirmez; Plan Z güvenli.
// ============================================================================

export interface AthleteMetrics {
  rsi: number;
  gctMs: number;
  loadingRateKnS: number;
  forefootPct: number;
  trimp: number;
  asymPct: number;        // GRF L/R asimetri %
  angularLoadPct: number; // 0-100 açısal yük
  hrvStress: boolean;     // HRV düşük / stres işareti
}

export interface DrillPrescription {
  priority: 'KRITIK' | 'ONCELIKLI' | 'ISTEĞE_BAĞLI';
  focus: string;
  drill: string;
  setsReps: string;
  why: string;
}

const ELITE = { RSI: 0.85, GCT_MS: 200, LOADING_KnS: 2.5, FOREFOOT_PCT: 65, TRIMP_MAX: 120, ASYM_PCT: 15, ANGULAR_MAX: 35 };

/** Zayıf bölgeleri tespit edip öncelik sıralı drill reçetesi üretir. */
export function recommendDrills(metrics: AthleteMetrics): DrillPrescription[] {
  const out: DrillPrescription[] = [];

  if (metrics.rsi < ELITE.RSI) {
    out.push({
      priority: metrics.rsi < ELITE.RSI * 0.8 ? 'KRITIK' : 'ONCELIKLI',
      focus: 'Reaktif güç (RSI)',
      drill: 'Depth Jump + 5s kısa temas',
      setsReps: '4×5 · 3dk dinlenme',
      why: `RSI ${metrics.rsi} hedefin (${ELITE.RSI}) altında — kısa temas süresiyle patlayıcı yeniden güç üretimi`,
    });
  }
  if (metrics.gctMs > ELITE.GCT_MS + 25) {
    out.push({
      priority: 'ONCELIKLI',
      focus: 'Temas süresi (GCT)',
      drill: 'Plyometrik ladder + rebound hop',
      setsReps: '3×8 · 2dk',
      why: `GCT ${metrics.gctMs}ms çok uzun — zeminde kalma süresi elastik enerjiyi kaybettirir`,
    });
  }
  if (metrics.loadingRateKnS > ELITE.LOADING_KnS) {
    out.push({
      priority: metrics.loadingRateKnS > ELITE.LOADING_KnS * 1.2 ? 'KRITIK' : 'ONCELIKLI',
      focus: 'Darbe yükleme oranı',
      drill: 'Yumuşak iniş serisi (sessiz iniş) + tempo koşusu',
      setsReps: '3×6 · 90sn',
      why: `Yükleme ${metrics.loadingRateKnS} kN/s — Aşil/kemik stresi riski; iniş yumuşatılmalı`,
    });
  }
  if (metrics.forefootPct < ELITE.FOREFOOT_PCT) {
    out.push({
      priority: 'ONCELIKLI',
      focus: 'Önayak itiş payı',
      drill: 'Ankraj + itiş drilleri (forefoot push)',
      setsReps: '4×10 · 60sn',
      why: `Önayak %${metrics.forefootPct} — itiş fazında güç kaybı; önayak yüklenmesi artırılmalı`,
    });
  }
  if (metrics.asymPct > ELITE.ASYM_PCT) {
    out.push({
      priority: 'ONCELIKLI',
      focus: 'L/R kuvvet asimetrisi',
      drill: 'Tek bacak kuvvet + denge (unilateral)',
      setsReps: '3×8 her bacak · 90sn',
      why: `Asimetri %${metrics.asymPct} (>%15) — tek taraflı yüklenme sakatlık riski`,
    });
  }
  if (metrics.angularLoadPct > ELITE.ANGULAR_MAX) {
    out.push({
      priority: 'ISTEĞE_BAĞLI',
      focus: 'Açısal yük kontrolü',
      drill: 'Bilek/kalça kontrol drilleri + sınırlı spin',
      setsReps: '2×8 · 60sn',
      why: `Açısal yük %${metrics.angularLoadPct} — aşırı rotasyon eklem stresi`,
    });
  }
  if (metrics.hrvStress) {
    out.push({
      priority: 'KRITIK',
      focus: 'Toparlanma',
      drill: 'Aktif toparlanma + uyku hijyeni (HRV takibi)',
      setsReps: '1 gün düşük yoğunluk',
      why: 'HRV stres işareti — otonom sistem dengesiz; yük eklemek riskli',
    });
  }
  if (metrics.trimp > ELITE.TRIMP_MAX) {
    out.push({
      priority: 'ONCELIKLI',
      focus: 'Yük yönetimi',
      drill: 'Hacim azaltma + ACWR takibi',
      setsReps: 'Haftalık -%20',
      why: `TRIMP ${metrics.trimp} çok yüksek — aşırı antrenman sendromu önlenmeli`,
    });
  }
  if (out.length === 0) {
    out.push({
      priority: 'ISTEĞE_BAĞLI',
      focus: 'Bakım',
      drill: 'Genel kuvvet + mobilite devresi',
      setsReps: '2×10 · 60sn',
      why: 'Tüm metrikler hedef bölgede — koruyucu devam programı',
    });
  }
  return out;
}

// ── BÜYÜME ATAĞI (PHV) BİYOMEKANİK ANOMALİ TESPİTİ ─────────────────────────
export interface GrowthDataPoint {
  measuredAt: string; // ISO tarih
  heightCm: number;
  weightKg: number;
  gctMs: number;
  loadingRateKnS: number;
}

export interface GrowthSpurtAnomaly {
  growthRateCmYr: number; // yıllık boy artış hızı
  phvDetected: boolean;   // tepe boy hızı (≥9 cm/yıl)
  anomaly: boolean;       // büyüme atağı sırasında biyomekanik sapma
  anomalyReason: string;
  notes: string;
}

/**
 * Büyüme hızını tahmin eder; PHV döneminde GCT uzaması + yükleme artışı gibi
 * geçici biyomekanik sapmaları "anomali" olarak işaretler (kontrol önerisi).
 */
export function detectGrowthSpurtAnomaly(history: GrowthDataPoint[]): GrowthSpurtAnomaly {
  if (history.length < 2) {
    return { growthRateCmYr: 0, phvDetected: false, anomaly: false, anomalyReason: 'Yeterli ölçüm yok (≥2 gerekli)', notes: 'Boy/kinetik takibi başlatıldı' };
  }
  const first = history[0];
  const last = history[history.length - 1];
  const days = Math.max(1, (new Date(last.measuredAt).getTime() - new Date(first.measuredAt).getTime()) / 86_400_000);
  const growthRateCmYr = Number(((last.heightCm - first.heightCm) / Math.max(1, days) * 365).toFixed(2));
  const phvDetected = growthRateCmYr >= 9;

  const gctRise = last.gctMs - first.gctMs;
  const loadingRise = last.loadingRateKnS - first.loadingRateKnS;
  const anomaly = phvDetected && (gctRise > 20 || loadingRise > 0.5);

  const anomalyReason = anomaly
    ? `PHV (${growthRateCmYr} cm/yıl) ile GCT +${gctRise}ms / yükleme +${loadingRise.toFixed(1)} kN/s — büyümeye bağlı geçici mekanik bozulma olabilir; büyüme plakları korunmalı`
    : phvDetected
      ? `PHV tespit edildi (${growthRateCmYr} cm/yıl) — metrikler beklenen bantta, güç antrenmanı kontrollü artırılabilir`
      : `Büyüme hızı ${growthRateCmYr} cm/yıl — PHV eşiği (9 cm/yıl) altında, anomali yok`;
  return { growthRateCmYr, phvDetected, anomaly, anomalyReason, notes: anomaly ? 'Ortez/uzun vadeli plan için gelişim uzmanına yönlendir' : 'Takip devam' };
}

export function aiCoachAdvisorStatus(): string {
  return 'AI Koç Öneri: elit hedef kıyası → drill reçetesi • PHV büyüme anomali tespiti';
}

