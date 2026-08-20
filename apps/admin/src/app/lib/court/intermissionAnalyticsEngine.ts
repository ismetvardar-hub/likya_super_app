// ============================================================================
// 🎯 KOÇ MOLA & SET ARASI TAKTİK HUD MOTORU (Adım 107)
// 90 saniyelik değişim/molada son set/o oyun metriklerini anında toplar:
// İlk Servis Yüzdesi, Ortalama Racket Hızı, GCT Yorgunluk Drift'i (+ms) ve
// Yüksek Yüklü Deselerasyonlar. Bu metriklerden 3 maddelik, düz dilli,
// deterministik taktik önerisi üretir. Saf — node ortamında doğrulanabilir.
// ============================================================================

export const INTERMISSION_BREAK_MS = 90_000;
export const GCT_FATIGUE_DRIFT_WARN_MS = 20;
export const SERVE_FIRST_IN_WARN_PCT = 50;
export const RACKET_SPEED_WARN_KMH = 80;
export const HIGH_LOAD_DECEL_WARN = 25;

export interface SetMetrics {
  serveFirstInPct: number;      // 0-100
  avgRacketSpeedKmh: number;
  gctMsStart: number;           // set başı ortalama GCT
  gctMsEnd: number;             // set sonu ortalama GCT
  highLoadDecels: number;       // adet (>3.5 m/s² deselerasyonlar)
  opponentPattern?: string;     // isteğe bağlı rakip gözlemi
}

export interface IntermissionMetrics {
  serveFirstInPct: number;
  avgRacketSpeedKmh: number;
  gctFatigueDriftMs: number;    // +ms = GCT uzadı (yorgunluk)
  highLoadDecels: number;
  rallyPatternNote: string;
}

export function gctFatigueDriftMs(gctMsStart: number, gctMsEnd: number): number {
  return Math.round((gctMsEnd - gctMsStart) * 100) / 100;
}

export function aggregateIntermissionMetrics(m: SetMetrics): IntermissionMetrics {
  const drift = gctFatigueDriftMs(m.gctMsStart, m.gctMsEnd);
  return {
    serveFirstInPct: Math.round(m.serveFirstInPct * 10) / 10,
    avgRacketSpeedKmh: Math.round(m.avgRacketSpeedKmh * 10) / 10,
    gctFatigueDriftMs: drift,
    highLoadDecels: m.highLoadDecels,
    rallyPatternNote:
      m.opponentPattern && m.opponentPattern.trim().length > 0
        ? m.opponentPattern.trim()
        : 'Rakip deseni gözlemlenmedi',
  };
}

// ── Kural tabanlı taktik önerileri (her zaman 3 madde, düz dil) ───────────────
export interface TacticalAdvice {
  bullets: string[];
  emphasis: string; // antrenöre öncelik ipucu
}

export function generateTacticalAdvice(metrics: IntermissionMetrics): TacticalAdvice {
  const bullets: string[] = [];
  const triggers: string[] = [];

  if (metrics.serveFirstInPct < SERVE_FIRST_IN_WARN_PCT) {
    bullets.push(`İlk servis yüzdesi %${metrics.serveFirstInPct} — düşük; 2. serviste slice derinliğini artır, riski azalt`);
    triggers.push('serve');
  } else {
    bullets.push(`İlk servis yüzdesi %${metrics.serveFirstInPct} — stabil; servis oyununa agresif başla`);
    triggers.push('serve-good');
  }

  if (metrics.gctFatigueDriftMs > GCT_FATIGUE_DRIFT_WARN_MS) {
    bullets.push(`GCT yorgunluk drift'i +${metrics.gctFatigueDriftMs}ms — ayak patlaması düşüyor; oyunu kısalt, çapraz vuruş sayısını azalt`);
    triggers.push('gct');
  } else {
    bullets.push(`GCT drift ${metrics.gctFatigueDriftMs >= 0 ? '+' : ''}${metrics.gctFatigueDriftMs}ms — patlayıcılık korunuyor; baskıyı sürdür`);
    triggers.push('gct-good');
  }

  if (metrics.highLoadDecels > HIGH_LOAD_DECEL_WARN) {
    bullets.push(`${metrics.highLoadDecels} yüksek yüklü deselerasyon — fren yükü birikiyor; kısa yön değişimlerini azalt, topu daha derin oyna`);
    triggers.push('decel');
  } else if (metrics.avgRacketSpeedKmh < RACKET_SPEED_WARN_KMH) {
    bullets.push(`Racket hızı ${metrics.avgRacketSpeedKmh} km/s — düşük; öne doğru ağırlık aktarımı ve topu vururken kalça dönüşü ekle`);
    triggers.push('speed');
  } else {
    bullets.push(`Racket hızı ${metrics.avgRacketSpeedKmh} km/s ve deselerasyon yükü kontrol altında — mevcut ritmi koru`);
    triggers.push('decel-good');
  }

  return { bullets, emphasis: `Mola süresi: 90sn — öncelik: ${bullets[0]}` };
}

export function intermissionAnalyticsStatus(): string {
  return `Mola HUD: GCT drift >${GCT_FATIGUE_DRIFT_WARN_MS}ms uyarı • İlk servis <%${SERVE_FIRST_IN_WARN_PCT} • ${INTERMISSION_BREAK_MS / 1000}sn mola`;
}
