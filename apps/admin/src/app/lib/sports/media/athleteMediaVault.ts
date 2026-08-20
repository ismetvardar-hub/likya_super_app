// ============================================================================
// 📸 SPORCU MEDYA KASASI (Athlete Media Vault) — yerel, sıfır maliyet arşiv
// Immich benzeri kendi sunucunda barınan medya indeks adaptörü (Dokploy/VPS).
// - Koç / veli / sporcu portallarından foto-video-ses yükleme
// - JPEG EXIF DateTimeOriginal otomatik çıkarımı (yerel, üçüncü parti API yok)
// - EXIF zaman damgası → BLE sensör telemetrisi eşleştirme (maç fotoğrafı = an)
// - FNV-1a 64-bit içerik özetiyle kopya (dedup) tespiti → $0 bulut depolama
// - Deterministik: aynı girdi → aynı çıktı (Plan Z güvenli, test edilebilir)
// ============================================================================

export type MediaKind = 'photo' | 'video' | 'audio';
export type MediaSource = 'coach' | 'parent' | 'athlete';

/** Portal tarafından gelen ham yükleme (dosya + EXIF + içerik özeti için byte'lar). */
export interface MediaUpload {
  athleteId: string;
  sessionId?: string;
  kind: MediaKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Cihaz takviminden düşen fallback zaman damgası (EXIF yoksa kullanılır). */
  capturedAt?: string;
  /** EXIF + içerik özeti için dosya byte'ları (File.arrayBuffer()). */
  bytes: ArrayBuffer | Uint8Array;
  source: MediaSource;
  tags?: string[];
}

/** Kasadaki indekslenmiş medya kaydı. */
export interface AthleteMediaItem {
  id: string;
  athleteId: string;
  sessionId?: string;
  kind: MediaKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** ISO8601 — EXIF öncelikli, yoksa cihaz zamanı. */
  capturedAt: string;
  exifSource: 'exif' | 'device' | 'unknown';
  /** FNV-1a 64-bit içerik özeti (kopya tespiti). */
  contentHash: string;
  /** Yerel disk yolu (LIKYA_MEDIA_ROOT altında). */
  localPath: string;
  source: MediaSource;
  indexedAt: string;
  tags: string[];
}

export interface MediaVault {
  /** Kulüp / akademi sahibi. */
  ownerId?: string;
  items: AthleteMediaItem[];
  indexedAt: string;
}

// ---------------------------------------------------------------------------
// 1. EXIF DateTimeOriginal Parser (JPEG APP1 → TIFF IFD → ASCII takvim)
// ---------------------------------------------------------------------------
// JPEG: SOI(FFD8) → segmentler. APP1 (FFE1) içinde "Exif\0\0" + TIFF bloğu.
// TIFF: byte order ("II"/"MM"), magic 42, IFD0 ofseti. IFD girişlerinde
// tag 0x9003 (DateTimeOriginal) ve 0x0132 (DateTime) ASCII olarak aranır.

export function parseExifTimestamp(input: ArrayBuffer | Uint8Array): string | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 12 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const segLen = bytes[offset + 2] * 256 + bytes[offset + 3];
    if (marker === 0xe1 && segLen >= 10) {
      // "Exif\0\0" imzasını doğrula
      const sigOk =
        bytes[offset + 4] === 0x45 && bytes[offset + 5] === 0x78 &&
        bytes[offset + 6] === 0x69 && bytes[offset + 7] === 0x66 &&
        bytes[offset + 8] === 0x00 && bytes[offset + 9] === 0x00;
      if (sigOk) {
        const tiffStart = offset + 4 + 6; // "Exif\0\0" geç → TIFF başlangıcı
        const iso = parseTiffDateTime(bytes.subarray(tiffStart));
        if (iso) return iso;
      }
    }
    if (marker === 0xda) break; // SOS — görüntü verisi başladı
    offset += 2 + segLen;
  }
  return null;
}

function parseTiffDateTime(tiff: Uint8Array): string | null {
  if (tiff.length < 8) return null;
  const little = tiff[0] === 0x49 && tiff[1] === 0x49; // "II"
  const big = tiff[0] === 0x4d && tiff[1] === 0x4d;    // "MM"
  if (!little && !big) return null;

  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  if (view.getUint16(2, little) !== 42) return null;
  const ifdOffset = view.getUint32(4, little);
  if (ifdOffset + 2 > tiff.length) return null;
  const count = view.getUint16(ifdOffset, little);

  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > tiff.length) break;
    const tag = view.getUint16(entry, little);
    if (tag !== 0x9003 && tag !== 0x0132) continue;
    const type = view.getUint16(entry + 2, little);
    if (type !== 2) continue; // yalnızca ASCII

    const charCount = view.getUint32(entry + 4, little);
    const strStart = charCount <= 4 ? entry + 8 : view.getUint32(entry + 8, little);
    const len = Math.min(charCount, Math.max(0, tiff.length - strStart));
    const raw = new TextDecoder('ascii').decode(tiff.subarray(strStart, strStart + len));
    const iso = exifStringToIso(raw);
    if (iso) return iso;
  }
  return null;
}

/** "YYYY:MM:DD HH:MM:SS" → ISO8601 (UTC varsayımı; EXIF saat dilimi tutmaz). */
export function exifStringToIso(raw: string): string | null {
  const m = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/.exec(raw.trim());
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 60) return null;
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ---------------------------------------------------------------------------
// 2. İçerik Özeti (FNV-1a 64-bit, hi/lo 32-bit ayrık) — deterministik dedup
// BigInt kullanılmaz: ES2020 öncesi hedeflerle de uyumlu, aynı girdi → aynı hash.
// ---------------------------------------------------------------------------
export function hashMediaBytes(bytes: Uint8Array): string {
  let hi = 0xcbf29ce4; // 64-bit offset basis'in üst 32 biti
  let lo = 0x84222325; // alt 32 biti (0xcbf29ce484222325)
  for (let i = 0; i < bytes.length; i++) {
    lo = (lo ^ bytes[i]) >>> 0;
    // 64-bit çarpma: a * 0x100000001b3 = a * (256*2^32 + 435)
    //   → lo = a_lo*435 mod 2^32 ; carry = floor(a_lo*435 / 2^32)
    //   → hi = (a_hi*435 + a_lo*256 + carry) mod 2^32  (hepsi < 2^53 → kesin)
    const loMul = lo * 435;
    const newLo = loMul % 0x100000000;
    const carry = Math.floor(loMul / 0x100000000);
    hi = (hi * 435 + lo * 256 + carry) % 0x100000000; // eski lo kullanılır
    lo = newLo;
  }
  const hiHex = ('0000000' + hi.toString(16)).slice(-8);
  const loHex = ('0000000' + lo.toString(16)).slice(-8);
  return hiHex + loHex;
}

const DEFAULT_MEDIA_ROOT = '/var/lib/likya/media';

/** Yerel disk kökü — LIKYA_MEDIA_ROOT ortam değişkeniyle özelleştirilebilir. */
export function mediaRoot(): string {
  if (typeof process !== 'undefined' && process.env?.LIKYA_MEDIA_ROOT) return process.env.LIKYA_MEDIA_ROOT;
  return DEFAULT_MEDIA_ROOT;
}

/** Yerel disk yolu: /MEDIA_ROOT/{athleteId}/{sessionId}/{fileName} */
export function resolveLocalPath(item: { athleteId: string; sessionId?: string; fileName: string }): string {
  const parts = [mediaRoot(), encodeURIComponent(item.athleteId)];
  if (item.sessionId) parts.push(encodeURIComponent(item.sessionId));
  parts.push(item.fileName);
  return parts.join('/');
}

// ---------------------------------------------------------------------------
// 3. Kasa Durumu & Yükleme Kaydı
// ---------------------------------------------------------------------------
export function createMediaVault(ownerId?: string): MediaVault {
  return { ownerId, items: [], indexedAt: new Date().toISOString() };
}

/** Yüklemeden EXIF/fallback zaman damgasını çıkarır. */
export function extractExifFromUpload(upload: MediaUpload): { capturedAt: string; exifSource: 'exif' | 'device' | 'unknown' } {
  const bytes = upload.bytes instanceof Uint8Array ? upload.bytes : new Uint8Array(upload.bytes);
  const exif = parseExifTimestamp(bytes);
  if (exif) return { capturedAt: exif, exifSource: 'exif' };
  if (upload.capturedAt && !Number.isNaN(new Date(upload.capturedAt).getTime())) {
    return { capturedAt: new Date(upload.capturedAt).toISOString(), exifSource: 'device' };
  }
  return { capturedAt: new Date().toISOString(), exifSource: 'unknown' };
}

export interface RegisterResult {
  ok: boolean;
  deduped: boolean;
  item?: AthleteMediaItem;
  message: string;
}

/** Medyayı kasaya kaydeder; içerik özeti aynıysa kopyayı reddeder ($0 arşiv). */
export function registerMediaUpload(vault: MediaVault, upload: MediaUpload): RegisterResult {
  const bytes = upload.bytes instanceof Uint8Array ? upload.bytes : new Uint8Array(upload.bytes);
  const contentHash = hashMediaBytes(bytes);
  const existing = vault.items.find((i) => i.contentHash === contentHash);
  if (existing) {
    return { ok: false, deduped: true, message: `Kopya tespit edildi → ${existing.fileName} arşivde zaten mevcut (${contentHash})` };
  }

  const { capturedAt, exifSource } = extractExifFromUpload(upload);
  const item: AthleteMediaItem = {
    id: `MED-${contentHash.slice(0, 8)}-${vault.items.length + 1}`,
    athleteId: upload.athleteId,
    sessionId: upload.sessionId,
    kind: upload.kind,
    fileName: upload.fileName,
    mimeType: upload.mimeType,
    sizeBytes: upload.sizeBytes || bytes.length,
    capturedAt,
    exifSource,
    contentHash,
    localPath: resolveLocalPath(upload),
    source: upload.source,
    indexedAt: new Date().toISOString(),
    tags: upload.tags ?? [],
  };
  vault.items.push(item);
  vault.indexedAt = item.indexedAt;
  return { ok: true, deduped: false, item, message: `${item.fileName} arşivlendi (EXIF: ${exifSource}) → ${item.localPath}` };
}

/** Aynı içerik özetine sahip kayıtları teke indirir (idempotent). */
export function dedupeVault(vault: MediaVault): { removed: number; items: AthleteMediaItem[] } {
  const seen = new Set<string>();
  const items: AthleteMediaItem[] = [];
  for (const it of vault.items) {
    if (seen.has(it.contentHash)) continue;
    seen.add(it.contentHash);
    items.push(it);
  }
  const removed = vault.items.length - items.length;
  vault.items = items;
  return { removed, items };
}


// ---------------------------------------------------------------------------
// 4. EXIF Zaman Damgası → BLE Telemetri Eşleştirme
// ---------------------------------------------------------------------------
export interface TelemetryFrame {
  tMs: number; // epoch millis
  heartRate?: number;
  gctMs?: number;
  activity?: string;
  [key: string]: unknown; // webBluetoothBridge/virtualBleSensorLab çerçeveleri kabul edilir
}

export interface TelemetryLink {
  mediaId: string;
  fileName: string;
  capturedAt: string;
  matched: boolean;
  offsetSec: number | null;
  frame: TelemetryFrame | null;
  note: string;
}

/** Eşleştirme penceresi (±60 sn) — maç fotoğrafı → telemetri anı. */
export const TELEMETRY_MATCH_WINDOW_MS = 60_000;

export function findNearestTelemetryFrame(
  capturedAtMs: number,
  frames: TelemetryFrame[],
  windowMs = TELEMETRY_MATCH_WINDOW_MS,
): { frame: TelemetryFrame | null; offsetSec: number | null } {
  if (frames.length === 0) return { frame: null, offsetSec: null };
  let best: TelemetryFrame | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const f of frames) {
    const diff = Math.abs(f.tMs - capturedAtMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = f;
    }
  }
  if (!best || bestDiff > windowMs) return { frame: null, offsetSec: null };
  return { frame: best, offsetSec: Math.round((best.tMs - capturedAtMs) / 1000) };
}

/** Kasadaki her medyayı BLE telemetri çerçevesiyle eşleştirir. */
export function linkMediaToTelemetry(
  media: AthleteMediaItem[],
  frames: TelemetryFrame[],
  windowMs = TELEMETRY_MATCH_WINDOW_MS,
): TelemetryLink[] {
  return media.map((m) => {
    const captured = new Date(m.capturedAt).getTime();
    if (Number.isNaN(captured)) {
      return { mediaId: m.id, fileName: m.fileName, capturedAt: m.capturedAt, matched: false, offsetSec: null, frame: null, note: 'Geçersiz zaman damgası' };
    }
    const { frame, offsetSec } = findNearestTelemetryFrame(captured, frames, windowMs);
    if (!frame) {
      return { mediaId: m.id, fileName: m.fileName, capturedAt: m.capturedAt, matched: false, offsetSec: null, frame: null, note: `Pencerede telemetri yok (±${Math.round(windowMs / 1000)}s)` };
    }
    const hr = frame.heartRate !== undefined ? `${frame.heartRate} bpm` : '—';
    const offsetNote = offsetSec !== 0 ? ` (${offsetSec}s sapma)` : '';
    return { mediaId: m.id, fileName: m.fileName, capturedAt: m.capturedAt, matched: true, offsetSec, frame, note: `Eşleşti → HR ${hr}${offsetNote}` };
  });
}

// ---------------------------------------------------------------------------
// 5. Kasa İndeksi & Depolama Raporu
// ---------------------------------------------------------------------------
export interface VaultFilter {
  athleteId?: string;
  sessionId?: string;
  kind?: MediaKind;
  source?: MediaSource;
  from?: string; // ISO tarih (dahil)
  to?: string; // ISO tarih (dahil)
}

export function buildVaultIndex(vault: MediaVault, filter: VaultFilter = {}): AthleteMediaItem[] {
  return vault.items.filter((it) => {
    if (filter.athleteId && it.athleteId !== filter.athleteId) return false;
    if (filter.sessionId && it.sessionId !== filter.sessionId) return false;
    if (filter.kind && it.kind !== filter.kind) return false;
    if (filter.source && it.source !== filter.source) return false;
    if (filter.from && it.capturedAt < filter.from) return false;
    if (filter.to && it.capturedAt > filter.to) return false;
    return true;
  });
}

export interface StorageReport {
  totalCount: number;
  totalBytes: number;
  byKind: Record<MediaKind, { count: number; bytes: number }>;
  byExifSource: Record<'exif' | 'device' | 'unknown', number>;
  dedupSavingsBytes: number;
  root: string;
}

export function vaultStorageReport(vault: MediaVault): StorageReport {
  const byKind: StorageReport['byKind'] = {
    photo: { count: 0, bytes: 0 },
    video: { count: 0, bytes: 0 },
    audio: { count: 0, bytes: 0 },
  };
  const byExifSource: StorageReport['byExifSource'] = { exif: 0, device: 0, unknown: 0 };
  const seen = new Set<string>();
  let totalBytes = 0;
  let dedupSavingsBytes = 0;

  for (const it of vault.items) {
    byKind[it.kind].count += 1;
    byKind[it.kind].bytes += it.sizeBytes;
    byExifSource[it.exifSource] += 1;
    totalBytes += it.sizeBytes;
    if (seen.has(it.contentHash)) dedupSavingsBytes += it.sizeBytes;
    else seen.add(it.contentHash);
  }
  return { totalCount: vault.items.length, totalBytes, byKind, byExifSource, dedupSavingsBytes, root: mediaRoot() };
}

export function athleteMediaVaultStatus(): string {
  return 'Sporcu Medya Kasası: EXIF otomasyon • BLE telemetri eşleştirme • FNV-1a dedup • yerel disk ($0)';
}

