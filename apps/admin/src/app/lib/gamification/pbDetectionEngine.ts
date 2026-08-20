// ============================================================================
// 🎉 KİŞİSEL REKOR (PB) TESPİT MOTORU (Adım 71)
// Tarihsel kırılmalar: MAX_RSI • MIN_GCT • PEAK_SPRINT_SPEED • MAX_SERVE_VELOCITY
// Konfeti/particle tetikleyici + dışa aktarılabilir "PB Milestone Kartı" verisi.
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export type PbMetric = 'MAX_RSI' | 'MIN_GCT' | 'PEAK_SPRINT_SPEED' | 'MAX_SERVE_VELOCITY';
export type PbDirection = 'max' | 'min';

export interface PbMetricMeta {
  label: string;
  unit: string;
  direction: PbDirection;
  emoji: string;
}

export const PB_METRIC_META: Record<PbMetric, PbMetricMeta> = {
  MAX_RSI: { label: 'Maks RSI', unit: '', direction: 'max', emoji: '⚡' },
  MIN_GCT: { label: 'Min GCT', unit: 'ms', direction: 'min', emoji: '🦶' },
  PEAK_SPRINT_SPEED: { label: 'Tepe Sprint Hızı', unit: 'km/h', direction: 'max', emoji: '🏃' },
  MAX_SERVE_VELOCITY: { label: 'Maks Servis Hızı', unit: 'km/h', direction: 'max', emoji: '🎾' },
};

/** 'max' metriği için büyük, 'min' metriği için küçük değer daha iyidir. */
export function isBetter(metric: PbMetric, value: number, best: number | null): boolean {
  if (best === null) return true;
  return PB_METRIC_META[metric].direction === 'max' ? value > best : value < best;
}

export interface PbEvent {
  metric: PbMetric;
  label: string;
  emoji: string;
  unit: string;
  newValue: number;
  previousBest: number | null;
  improvedPct: number;
  achievedAt: string;
}

/** Tek metriğin tarihsel rekor olup olmadığını kontrol eder. */
export function detectPersonalBest(metric: PbMetric, value: number, previousBest: number | null, nowIso = new Date().toISOString()): PbEvent | null {
  if (!isBetter(metric, value, previousBest)) return null;
  const meta = PB_METRIC_META[metric];
  const improvedPct =
    previousBest === null || previousBest === 0
      ? 100
      : meta.direction === 'max'
        ? Number((((value - previousBest) / previousBest) * 100).toFixed(1))
        : Number((((previousBest - value) / previousBest) * 100).toFixed(1));
  return { metric, label: meta.label, emoji: meta.emoji, unit: meta.unit, newValue: value, previousBest, improvedPct, achievedAt: nowIso };
}

export interface SessionMetrics {
  maxRsi?: number;
  minGctMs?: number;
  peakSprintKmh?: number;
  maxServeKmh?: number;
}

export interface PbHistory {
  maxRsi: number | null;
  minGctMs: number | null;
  peakSprintKmh: number | null;
  maxServeKmh: number | null;
}

/** Seans metriklerini tarihsel rekorlarla karşılaştırır; tüm PB olaylarını döndürür. */
export function evaluateSessionPbs(session: SessionMetrics, history: PbHistory, nowIso?: string): PbEvent[] {
  const candidates: Array<{ metric: PbMetric; value: number | undefined; best: number | null }> = [
    { metric: 'MAX_RSI', value: session.maxRsi, best: history.maxRsi },
    { metric: 'MIN_GCT', value: session.minGctMs, best: history.minGctMs },
    { metric: 'PEAK_SPRINT_SPEED', value: session.peakSprintKmh, best: history.peakSprintKmh },
    { metric: 'MAX_SERVE_VELOCITY', value: session.maxServeKmh, best: history.maxServeKmh },
  ];
  return candidates
    .filter((c) => c.value !== undefined)
    .map((c) => detectPersonalBest(c.metric, c.value as number, c.best, nowIso))
    .filter((e): e is PbEvent => e !== null);
}

/** PB Milestone Kartı — sosyal paylaşım için dışa aktarılabilir metin. */
export function pbMilestoneCard(event: PbEvent, athleteName = 'Sporcu'): string {
  const change = event.previousBest === null ? 'İlk' : `+%${event.improvedPct}`;
  return `🎉 ${athleteName} yeni PB! ${event.emoji} ${event.label}: ${event.newValue}${event.unit} (${change}) — SportVisionX`;
}

export function pbDetectionStatus(): string {
  return 'PB Tespiti: MAX_RSI • MIN_GCT • sprint • serve • konfeti + milestone kartı';
}
