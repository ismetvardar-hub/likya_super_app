// ============================================================================
// 🎬 VİRAL REELS & HIGHLIGHT KLİP MOTORU — SportVisionX x Social
// - Vuruş hızı eşiği (>85 km/s) veya kritik ralli anında otomatik tetiklenme
// - Video overlay veri katmanı: sporcu adı, radar hızı, falso açısı, watermark
// - Veli portalına "Instagram Story / WhatsApp Paylaş" buton çıktısı
// - Mock-first: kamera yoksa deterministik highlight simülasyonu
// ============================================================================

export type ClipTier = 'BÜYÜK AN' | 'VİRAL' | 'ŞUT';

export interface HighlightClip {
  id: string;
  athleteId: string;
  shotSpeedKmh: number;
  spinAngleDeg: number;      // falso açısı
  rallyLength: number;       // ralli vuruş sayısı
  tier: ClipTier;
  triggeredAt: string;
  overlay: {
    athleteLabel: string;
    speedLabel: string;
    spinLabel: string;
    watermark: string;       // kulüp watermark şablonu
  };
  shareUrls: {
    instagramStory: string;
    whatsapp: string;
  };
}

const SPEED_THRESHOLD_KMH = 85;
const WATERMARK = '⚡ ExtremeS Kulüp TV • Likya Kampüsü';
let clips: HighlightClip[] = [];
let seq = 1;

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function tierOf(speedKmh: number, rally: number): ClipTier {
  if (speedKmh >= 95 || rally >= 12) return 'BÜYÜK AN';
  if (speedKmh >= 85) return 'VİRAL';
  return 'ŞUT';
}

// ---------------------------------------------------------------------------
// 1. Highlight Tetikleyici — SportVisionX vuruş hızı eşiği
// ---------------------------------------------------------------------------
export function captureHighlight(athleteId: string, shotSpeedKmh: number, spinAngleDeg: number, rallyLength: number, opts?: { athleteLabel?: string }): HighlightClip | null {
  if (shotSpeedKmh < SPEED_THRESHOLD_KMH && rallyLength < 8) return null; // eşik altı → kaydetme
  const tier = tierOf(shotSpeedKmh, rallyLength);
  const clip: HighlightClip = {
    id: `CLIP-${String(seq++).padStart(3, '0')}`,
    athleteId,
    shotSpeedKmh,
    spinAngleDeg,
    rallyLength,
    tier,
    triggeredAt: now(),
    overlay: {
      athleteLabel: opts?.athleteLabel ?? `${athleteId} • ExtremeS`,
      speedLabel: `Radar ${shotSpeedKmh} km/h`,
      spinLabel: `Falso ${Math.abs(spinAngleDeg)}°${spinAngleDeg < 0 ? ' (içten dışa)' : ' (dıştan içe)'}`,
      watermark: WATERMARK,
    },
    shareUrls: {
      instagramStory: `https://instagram.com/stories/create/?hint=${encodeURIComponent(`@${athleteId} ${shotSpeedKmh} km/h vuruş! ${WATERMARK}`)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`🎬 ${athleteId} — ${shotSpeedKmh} km/h ⚡ ${tier} klip! ${WATERMARK}`)}`,
    },
  };
  clips.unshift(clip);
  if (clips.length > 12) clips.pop();
  return clip;
}

export function getClips(limit = 5): HighlightClip[] {
  return clips.slice(0, limit);
}

export function viralClipEngineStatus(): string {
  return `Reels Motoru: ${clips.length} klip • eşik ${SPEED_THRESHOLD_KMH} km/h • watermark hazır`;
}
