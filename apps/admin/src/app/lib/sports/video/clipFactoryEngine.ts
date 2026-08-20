// ============================================================================
// 🎬 VİDEO KLİP FABRİKASI (Long→Short Auto Clipper) — sıfır maliyetli
// - Yüksek güç anı tespiti: RSI ≥ 2.0 • sprint > 20 km/h • max HR rallileri
// - Otomatik video yer imi/timestamp üretici (9:16 Reels/Shorts dilimleri)
// - Tarayıcı Canvas/MediaRecorder planı + açık webhook adaptörleri
//   (2short / yerel ffmpeg köprüsü) — ücretli abonelik yok.
// ============================================================================

export interface TelemetryMoment {
  tSec: number;          // video zaman ekseni (sn)
  rsi: number;
  speedKmh: number;
  hr: number;
}

export interface ClipTimestamp {
  startSec: number;
  endSec: number;
  label: string;
  reason: string;
  emoji: string;
}

export const RSI_THRESHOLD = 2.0;
export const SPRINT_THRESHOLD_KMH = 20;
export const HR_SPIKE_THRESHOLD = 170;
export const CLIP_DURATION_SEC = 6;

// ---------------------------------------------------------------------------
// 1. Yüksek Güç Anı Tespiti
// ---------------------------------------------------------------------------
export function detectHighPowerMoments(telemetry: TelemetryMoment[]): TelemetryMoment[] {
  return telemetry.filter(
    (m) => m.rsi >= RSI_THRESHOLD || m.speedKmh > SPRINT_THRESHOLD_KMH || m.hr >= HR_SPIKE_THRESHOLD,
  );
}

// ---------------------------------------------------------------------------
// 2. Otomatik Klip Timestamp Üretici (9:16 dilimler)
// ---------------------------------------------------------------------------
export function buildClipTimestamps(telemetry: TelemetryMoment[]): ClipTimestamp[] {
  const hot = detectHighPowerMoments(telemetry);
  const clips: ClipTimestamp[] = [];
  let lastEnd = -1;

  for (const m of hot) {
    // Çakışan/yapışık anları birleştir
    const start = Math.max(0, m.tSec - 1);
    if (start <= lastEnd) {
      const prev = clips[clips.length - 1];
      if (prev) prev.endSec = Math.min(prev.endSec + 2, m.tSec + 2);
      lastEnd = clips[clips.length - 1]?.endSec ?? start;
      continue;
    }
    const reasonParts: string[] = [];
    if (m.rsi >= RSI_THRESHOLD) reasonParts.push('RSI elit');
    if (m.speedKmh > SPRINT_THRESHOLD_KMH) reasonParts.push(`sprint ${m.speedKmh.toFixed(1)} km/h`);
    if (m.hr >= HR_SPIKE_THRESHOLD) reasonParts.push('max HR ralli');

    clips.push({
      startSec: start,
      endSec: start + CLIP_DURATION_SEC,
      label: reasonParts.join(' • '),
      reason: reasonParts[0] ?? 'power',
      emoji: reasonParts.some((r) => r.startsWith('sprint')) ? '🏃' : reasonParts.some((r) => r.startsWith('max')) ? '❤️‍🔥' : '⚡',
    });
    lastEnd = start + CLIP_DURATION_SEC;
  }
  return clips;
}

// ---------------------------------------------------------------------------
// 3. 9:16 Reels/Shorts Format Listesi + Tarayıcı Yakalama Planı
// ---------------------------------------------------------------------------
export function formatVerticalClips(clips: ClipTimestamp[]): string[] {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  return clips.map((c) => `${fmt(c.startSec)}–${fmt(c.endSec)} • 9:16 Reels • ${c.emoji} ${c.label}`);
}

export interface BrowserClipPlan {
  videoEl: 'source-video';
  canvas: { width: 1080; height: 1920 };
  mime: string;
  slice: { startSec: number; endSec: number };
  notes: string;
}

/** MediaRecorder + Canvas 1080x1920 dikey dilimleme planı (sıfır maliyet) */
export function buildBrowserClipPlan(clip: ClipTimestamp): BrowserClipPlan {
  return {
    videoEl: 'source-video',
    canvas: { width: 1080, height: 1920 },
    mime: 'video/webm;codecs=vp9',
    slice: { startSec: clip.startSec, endSec: clip.endSec },
    notes: 'MediaRecorder ile dikey 9:16 çıktı — kaynak video zamanına göre dilimlenir',
  };
}

// ---------------------------------------------------------------------------
// 4. Açık Webhook Adaptörleri (2short / yerel ffmpeg)
// ---------------------------------------------------------------------------
export type ClipAdapter = '2short' | 'ffmpeg';

export function buildClipWebhookPayload(clip: ClipTimestamp, adapter: ClipAdapter, sourceUrl: string): { url: string; body: Record<string, unknown> } {
  if (adapter === '2short') {
    return {
      url: 'https://2short.ai/webhook/clip',
      body: { sourceUrl, startSec: clip.startSec, endSec: clip.endSec, format: '9:16', caption: clip.label },
    };
  }
  // Yerel ffmpeg köprüsü — ücretsiz: ffmpeg -ss START -to END -vf "scale=1080:1920"
  return {
    url: 'http://localhost:8080/ffmpeg/clip',
    body: { sourceUrl, startSec: clip.startSec, endSec: clip.endSec, filter: 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920', caption: clip.label },
  };
}

export function clipFactoryStatus(): string {
  return `Klip Fabrikası: RSI≥${RSI_THRESHOLD} • sprint>${SPRINT_THRESHOLD_KMH} km/h • HR≥${HR_SPIKE_THRESHOLD} • 9:16 • 2short/ffmpeg`;
}
