// ============================================================================
// ⏱️ OTOMATİK VİDEO HIGHLIGHT YER İMİ & RALLİ KLİPÇİ (Adım 84)
// Telemetri tetikleyicileri: yüksek servis hızı (>%90 dilim), uzun ralli (>10 vuruş),
// patlayıcı yön değiştirme (>5.0 m/s²). EDL + sosyal medya klip aralıkları.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type HighlightTrigger = 'serve-speed' | 'extended-rally' | 'explosive-cod';

export interface HighlightEvent {
  tMs: number;
  type: 'serve' | 'rally-shot' | 'cod';
  value: number; // serve km/h · rally shot sırası · COD m/s²
}

export interface HighlightBookmark {
  id: string;
  tMs: number;
  trigger: HighlightTrigger;
  reason: string;
  clipStartMs: number;
  clipEndMs: number;
  durationSec: number;
}

export interface HighlightRuleConfig {
  serveSpeedP90Kmh: number;
  rallyShotThreshold: number;
  codThresholdMps2: number;
  preClipMs: number;
  postClipMs: number;
}

export const DEFAULT_HIGHLIGHT_RULES: HighlightRuleConfig = {
  serveSpeedP90Kmh: 170,
  rallyShotThreshold: 10,
  codThresholdMps2: 5.0,
  preClipMs: 3000,
  postClipMs: 5000,
};

export interface ClipInterval {
  clipStartMs: number;
  clipEndMs: number;
  durationSec: number;
}

/** Yer imi için klip aralığı (öncesi/sonrası tampon). */
export function clipInterval(bookmarkMs: number, rules: HighlightRuleConfig = DEFAULT_HIGHLIGHT_RULES): ClipInterval {
  const clipStartMs = Math.max(0, bookmarkMs - rules.preClipMs);
  const clipEndMs = bookmarkMs + rules.postClipMs;
  return { clipStartMs, clipEndMs, durationSec: Number(((clipEndMs - clipStartMs) / 1000).toFixed(1)) };
}

/** Telemetri olaylarından highlight yer imlerini üretir. */
export function evaluateHighlightRules(events: HighlightEvent[], rules: HighlightRuleConfig = DEFAULT_HIGHLIGHT_RULES): HighlightBookmark[] {
  const bookmarks: HighlightBookmark[] = [];
  let rallyCount = 0;
  let lastRallyT = -Infinity;

  for (const e of events) {
    if (e.type === 'serve' && e.value > rules.serveSpeedP90Kmh) {
      bookmarks.push({ id: `hl_serve_${bookmarks.length}`, tMs: e.tMs, trigger: 'serve-speed', reason: `Servis ${e.value} km/h > %90 dilim`, ...clipInterval(e.tMs, rules) });
    } else if (e.type === 'rally-shot') {
      if (e.tMs - lastRallyT <= 2500) rallyCount++; else rallyCount = 1;
      lastRallyT = e.tMs;
      if (rallyCount >= rules.rallyShotThreshold) {
        bookmarks.push({ id: `hl_rally_${bookmarks.length}`, tMs: e.tMs, trigger: 'extended-rally', reason: `${rallyCount} vuruşluk uzun ralli`, ...clipInterval(e.tMs, rules) });
        rallyCount = 0; // yeni ralli sayacı
      }
    } else if (e.type === 'cod' && Math.abs(e.value) > rules.codThresholdMps2) {
      bookmarks.push({ id: `hl_cod_${bookmarks.length}`, tMs: e.tMs, trigger: 'explosive-cod', reason: `Patlayıcı yön değiştirme ${e.value.toFixed(1)} m/s²`, ...clipInterval(e.tMs, rules) });
    }
  }
  return bookmarks;
}

/** EDL (Edit Decision List) — sosyal medya klip üretimi için yapı. */
export function buildEdl(bookmarks: HighlightBookmark[], sourceName: string): string {
  const lines = ['TITLE: Likya Highlight', `FILE: ${sourceName}`, '001  AX       V     C'];
  for (const b of bookmarks) {
    const startTc = msToTimecode(b.clipStartMs);
    const endTc = msToTimecode(b.clipEndMs);
    lines.push(`${b.id.padEnd(8)} AX       V     C        ${startTc} ${endTc}`);
  }
  return lines.join('\n');
}

function msToTimecode(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const f = Math.floor((ms % 1000) / 33); // 30fps
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

export function videoHighlightClipperStatus(): string {
  return 'Highlight: servis>%90 • ralli>10 • COD>5.0 m/s² • EDL + klip aralıkları';
}
