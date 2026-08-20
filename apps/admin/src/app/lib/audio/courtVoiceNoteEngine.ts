// ============================================================================
// 🎙️ KORT SES NOTU & AUDIO MARKER MOTORU (Adım 108)
// Canlı oyun sırasında koç için sıfır-gecikme sesli not: 1-dokunuş kayıt
// (MediaRecorder / Web Audio) + aktif 100Hz telemetri zaman çizelgesine anlık
// zaman damgası işaretleme. Offline-first audio blob IndexedDB'de önbelleklenir,
// arka planda Supabase Storage 'session-voice-notes' bucket'ına yüklenir.
// Saf/deterministik — blob tarayıcıda, meta veri + zaman çizelgesi burada.
// ============================================================================

export const VOICE_NOTES_BUCKET = 'session-voice-notes';
export const TELEMETRY_TIMELINE_HZ = 100;
export const VOICE_NOTE_MIME_DEFAULT = 'audio/webm';
export const VOICE_NOTE_MAX_SECONDS = 300; // 5 dk üst sınır

export type VoiceNoteUploadState = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface VoiceNoteMeta {
  id: string;
  sessionId: string;
  athleteId: string;
  tsMs: number;            // mutlak kayıt zamanı (telemetri ile senkron)
  recordedAt: string;
  durationMs: number;
  mimeType: string;
  sizeBytes: number;
  uploadState: VoiceNoteUploadState;
}

export interface VoiceNoteTimelineMapping {
  sessionOffsetMs: number;      // seans başlangıcından itibaren sapma
  frameIndex: number;           // 100Hz çerçeve indeksi = offset/10
  telemetryFrameMs: number;     // eşleşen telemetri çerçevesinin ms damgası
}

export function createVoiceNoteMeta(opts: {
  id?: string;
  sessionId: string;
  athleteId: string;
  tsMs: number;
  durationMs: number;
  mimeType?: string;
  sizeBytes?: number;
}): VoiceNoteMeta {
  return {
    id: opts.id ?? `vn_${opts.tsMs.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    sessionId: opts.sessionId,
    athleteId: opts.athleteId,
    tsMs: opts.tsMs,
    recordedAt: new Date(opts.tsMs).toISOString(),
    durationMs: Math.max(0, opts.durationMs),
    mimeType: opts.mimeType ?? VOICE_NOTE_MIME_DEFAULT,
    sizeBytes: opts.sizeBytes ?? 0,
    uploadState: 'pending',
  };
}

export function serializeVoiceNoteMeta(meta: VoiceNoteMeta): string {
  return JSON.stringify(meta);
}

export function parseVoiceNoteMeta(json: string | null | undefined): VoiceNoteMeta | null {
  try {
    const m = JSON.parse(json ?? 'null');
    if (!m || typeof m !== 'object' || typeof m.id !== 'string' || typeof m.sessionId !== 'string') return null;
    return m as VoiceNoteMeta;
  } catch {
    return null;
  }
}

export function validateAudioBlobMeta(meta: VoiceNoteMeta): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!meta.sessionId || meta.sessionId.length === 0) issues.push('sessionId boş');
  if (meta.durationMs < 0) issues.push('negatif süre');
  if (meta.durationMs > VOICE_NOTE_MAX_SECONDS * 1000) issues.push(`süre ${VOICE_NOTE_MAX_SECONDS}s üst sınırı aşıyor`);
  if (!meta.mimeType || !meta.mimeType.startsWith('audio/')) issues.push('mimeType audio/ değil');
  if (meta.sizeBytes < 0) issues.push('negatif boyut');
  return { valid: issues.length === 0, issues };
}

// ── 100Hz telemetri zaman çizelgesine işaretleme ─────────────────────────────
export function mapToTelemetryTimeline(noteTsMs: number, sessionStartMs: number, sessionEndMs: number | null): VoiceNoteTimelineMapping {
  const endMs = sessionEndMs ?? noteTsMs;
  const offsetMs = Math.max(0, Math.min(endMs - sessionStartMs, noteTsMs - sessionStartMs));
  return {
    sessionOffsetMs: Math.round(offsetMs),
    frameIndex: Math.floor(offsetMs / (1000 / TELEMETRY_TIMELINE_HZ)),
    telemetryFrameMs: Math.round(sessionStartMs + Math.floor(offsetMs / (1000 / TELEMETRY_TIMELINE_HZ)) * (1000 / TELEMETRY_TIMELINE_HZ)),
  };
}

export function voiceNoteStorageKey(sessionId: string): string {
  return `likya_voice_notes_${sessionId}`;
}

export function buildStorageUploadPath(sessionId: string, noteId: string): string {
  return `${sessionId}/${noteId}.webm`;
}

export function courtVoiceNoteStatus(): string {
  return `Ses Notu: ${VOICE_NOTES_BUCKET} bucket • 100Hz timeline işaretleme • ${VOICE_NOTE_MAX_SECONDS}s üst sınır`;
}
