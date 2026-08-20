// ============================================================================
// 🗄️ VERİ SAKLAMA & AYIKLAMA MOTORU (Adım 56) — kademeli retention
//  • Ham 100Hz telemetri: 30 gün sıkıştırılmadan → sıkıştır/özetle → 90 gün sonra hard prune
//  • Özet seanslar & sakatlık uyarıları: kalıcı (ömür boyu arşiv)
// pruneExpiredTelemetry(olderThanDays) + SQL cron karşılığı (20260220_retention_policy.sql)
// Deterministik; sıfır bağımlılık.
// ============================================================================

export const RETENTION = {
  uncompressedDays: 30,
  compressDays: 90,
  permanentTables: ['sessions', 'injury_alerts'] as const,
} as const;

export type RetentionStage = 'uncompressed' | 'compress' | 'prune';

/** Yaşa göre saklama aşaması: ≤30 gün ham, ≤90 gün özetle, >90 gün prune. */
export function retentionStageFor(ageDays: number): RetentionStage {
  if (ageDays <= RETENTION.uncompressedDays) return 'uncompressed';
  if (ageDays <= RETENTION.compressDays) return 'compress';
  return 'prune';
}

export interface TelemetryFrameMeta {
  id: string;
  ageDays: number;
}

export interface PruneResult {
  prunedCount: number;
  compressCount: number;
  keptCount: number;
  totalBytesSaved: number;
}

/** 90 günden eski ham telemetriyi siler; 30-90 gün arası özetlenir (varsayılan 24B/çerçeve). */
export function pruneExpiredTelemetry(frames: TelemetryFrameMeta[], olderThanDays = RETENTION.compressDays, bytesPerFrame = 24): PruneResult {
  let prunedCount = 0;
  let compressCount = 0;
  let keptCount = 0;
  for (const f of frames) {
    const stage = retentionStageFor(f.ageDays);
    if (stage === 'prune') prunedCount++;
    else if (stage === 'compress') compressCount++;
    else keptCount++;
  }
  return { prunedCount, compressCount, keptCount, totalBytesSaved: prunedCount * bytesPerFrame };
}

/** Tek bir telemetri kaydının önerilen aksiyonunu üretir. */
export function retentionAction(ageDays: number, table: 'telemetry_frames' | 'sessions' | 'injury_alerts'): { action: 'keep' | 'compress' | 'prune' | 'archive-permanent'; note: string } {
  if (table !== 'telemetry_frames') {
    return { action: 'archive-permanent', note: `${table} ömür boyu arşivlenir (lifetime archive)` };
  }
  const stage = retentionStageFor(ageDays);
  if (stage === 'prune') return { action: 'prune', note: `${ageDays} günlük ham telemetri hard prune edildi` };
  if (stage === 'compress') return { action: 'compress', note: `${ageDays} günlük çerçeve delta-sıkıştırıldı ve özetlendi` };
  return { action: 'keep', note: `${ageDays} günlük çerçeve sıkıştırılmadan saklanıyor (≤30 gün)` };
}

/** SQL prune fonksiyonu için özet istatistik metni (CI/UI). */
export function retentionPolicySummary(pruned: number, archived: number): string {
  return `Retention: ${pruned} çerçeve prune edildi • ${archived} özet kalıcı arşivlendi`;
}

export function retentionPolicyStatus(): string {
  return `Retention: ham ${RETENTION.uncompressedDays}g → özet ${RETENTION.compressDays}g → prune • seans/uyarı kalıcı`;
}
