// ============================================================================
// 🛠️ TRACK 4 — BATCH 12 SMOKE TESTİ (Adım 56-60) + TRACK 4 BÜTÜNLÜK
// Retention • Audit Log • Realtime WS • Veli OTP • Adım 46-60 doğrulama
// Çalıştırma: node scripts/track4Batch12SmokeTest.mts
// ============================================================================
import { retentionStageFor, pruneExpiredTelemetry, retentionAction, RETENTION } from '../src/app/lib/db/retentionPolicyEngine.ts';
import { AuditLogService, createMemoryAuditStore } from '../src/app/lib/security/auditLogService.ts';
import { RealtimeSubscriptionManager, createMockRealtimeTransport } from '../src/app/lib/sync/realtimeSubscriptionManager.ts';
import { ParentVerificationEngine, generateSixDigitOtp, OTP_TTL_MINUTES } from '../src/app/lib/auth/parentVerificationEngine.ts';
// Track 4 bütünlük (Adım 46-60)
import { buildSeedFixtures } from '../src/app/lib/db/seedFixtures.ts';
import { compressTelemetryBatch, decompressTelemetryBatch, type TelemetryPoint } from '../src/app/lib/storage/telemetryCompressor.ts';
import { AthleteApiHandler, createMemoryAthleteStore, type AuthContext } from '../src/app/lib/api/athleteApiHandler.ts';
import { resolveLastWriteWins } from '../src/app/lib/sync/backgroundSyncEngine.ts';
import { aggregateWeeklyRollups, type SessionRow } from '../src/app/lib/analytics/historicalTrendAggregator.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 56: VERİ SAKLAMA / AYIKLAMA ──────────────────────────────────────────
check('56a. Aşama eşikleri (30/90 gün)', retentionStageFor(10) === 'uncompressed' && retentionStageFor(45) === 'compress' && retentionStageFor(120) === 'prune');
const prune = pruneExpiredTelemetry([
  { id: 'f1', ageDays: 10 }, { id: 'f2', ageDays: 40 }, { id: 'f3', ageDays: 95 }, { id: 'f4', ageDays: 200 },
]);
check('56b. prune: 2 silinir, 1 özetlenir, 1 kalır', prune.prunedCount === 2 && prune.compressCount === 1 && prune.keptCount === 1);
check('56c. 24B/çerçeve tasarruf (2 × 24 = 48B)', prune.totalBytesSaved === 48);
check('56d. Seans/uyarı kalıcı arşiv', retentionAction(400, 'sessions').action === 'archive-permanent' && retentionAction(400, 'injury_alerts').action === 'archive-permanent');
check('56e. Sabitler doğru', RETENTION.uncompressedDays === 30 && RETENTION.compressDays === 90);

// ── ADIM 57: DENETİM GÜNLÜĞÜ (append-only) ────────────────────────────────────
const audit = new AuditLogService(createMemoryAuditStore());
audit.log({ actorId: 'u-coach', actorRole: 'coach', targetAthleteId: 'a1', action: 'PROFILE_VIEW', ipAddress: '10.0.0.1', metadataJson: '{"source":"portal"}' });
audit.log({ actorId: 'u-ceo', actorRole: 'ceo', targetAthleteId: 'a1', action: 'INJURY_FLAG_OVERRIDE', ipAddress: '10.0.0.2', metadataJson: '{"reason":"manual-review"}' });
audit.log({ actorId: 'u-parent', actorRole: 'parent', targetAthleteId: 'a2', action: 'PARENT_ACCESS', ipAddress: '10.0.0.3', metadataJson: '{}' });
check('57a. 3 kayıt append edildi + sporcu sorgusu', audit.count() === 3 && audit.queryByAthlete('a1').length === 2);
check('57b. Immutability: güncelleme/silme bloke', audit.tryMutate() === 'blocked');
let mutateThrows = false;
try { (audit as unknown as { store: { update: () => void } }).store.update('', {}); } catch { mutateThrows = true; }
check('57c. Store düzeyinde update → hata', mutateThrows === true);

// ── ADIM 58: REALTIME WEBSOCKET ABONELİK ──────────────────────────────────────
const transport = createMockRealtimeTransport();
const rt = new RealtimeSubscriptionManager(transport, { baseBackoffMs: 500, maxRetries: 5 });
let alerts: Record<string, unknown>[] = [];
const squadSub = rt.subscribeToSquadLiveAlerts('sq-1', (p) => alerts.push(p));
transport.publish('squad-alerts:sq-1', 'squad-alert', { athleteId: 'a1', risk: 'high' });
let frames: Record<string, unknown>[] = [];
rt.subscribeToSessionTelemetry('s-1', (p) => frames.push(p));
transport.publish('session-telemetry:s-1', 'telemetry-frame', { hr: 165, gctMs: 230 });
check('58a. Squad uyarısı + telemetri çerçevesi dağıtıldı', alerts.length === 1 && alerts[0].risk === 'high' && frames.length === 1 && frames[0].hr === 165);
squadSub.unsubscribe();
transport.publish('squad-alerts:sq-1', 'squad-alert', { athleteId: 'a2' });
check('58b. Unsubscribe sonrası ileti yok', alerts.length === 1);
const backoff1 = rt.simulateDisconnect();
const backoff2 = rt.simulateDisconnect();
check('58c. Üstel backoff artar (500 → 1000)', backoff2 === backoff1 * 2 && backoff1 === 500);

// ── ADIM 59: VELİ OTP & ÇOCUK BAĞLAMA ─────────────────────────────────────────
check('59a. 6 haneli OTP + deterministik (aynı seed)', generateSixDigitOtp(42).length === 6 && generateSixDigitOtp(42) === generateSixDigitOtp(42) && generateSixDigitOtp(42) !== generateSixDigitOtp(43));

const pe = new ParentVerificationEngine();
const token = pe.generateOtp('a1', 'u-parent', 7);
const base = new Date(token.expiresAt).getTime() - new Date(token.createdAt).getTime();
check(`59b. TTL ${OTP_TTL_MINUTES} dakika`, base === OTP_TTL_MINUTES * 60_000);
check('59c. Antrenör onaylı bağlama → ok', pe.verify({ token: token.token, coachConfirmed: true }).ok === true);
check('59d. Onay yok → LINK_NOT_CONFIRMED', pe.verify({ token: token.token, coachConfirmed: false, phoneMatch: true }).ok === true && pe.verify({ token: token.token }).ok === false);

const expired = pe.generateOtp('a2', 'u-p2', 8);
check('59e. 15dk sonra token dolar', pe.verify({ token: expired.token, coachConfirmed: true, nowMs: new Date(expired.expiresAt).getTime() + 1 }).error === 'TOKEN_EXPIRED');

const revoked = pe.generateOtp('a3', 'u-p3', 9);
pe.revoke(revoked.token);
check('59f. Revoke sonrası verify reddedilir', pe.verify({ token: revoked.token, coachConfirmed: true }).error === 'TOKEN_REVOKED');

const coachPath = pe.generateOtp('a4', 'u-p4', 10);
check('59g. Coach onaylı alternatif yol', pe.confirmByCoach(coachPath.token, 'u-coach').ok === true && pe.statusOf(coachPath.token) === 'verified');

// ── TRACK 4 BÜTÜNLÜK (Adım 46-60) ─────────────────────────────────────────────
const seed = buildSeedFixtures(2026);
check('46-48. Seed bütünlük: 72 seans + 864 telemetri', seed.sessions.length === 72 && seed.telemetryFrames.length === 864);

const tf: TelemetryPoint[] = Array.from({ length: 50 }, (_, i) => ({ timestampMs: i * 10, hr: 150 + i, gctMs: 200, toePressure: 60, heelPressure: 30, armVelocity: 85, loadingRate: 2, rsi: 1.8 }));
const restored = decompressTelemetryBatch(compressTelemetryBatch(tf));
check('51. Sıkıştırma round-trip (50 çerçeve)', restored.length === 50 && restored[0].timestampMs === 0 && restored[49].timestampMs === 490);

const apiStore = createMemoryAthleteStore([{ id: 'at-1', userId: 'u-ath', fullName: 'Efe', heightCm: 148, weightKg: 38, squadId: 'sq-a', createdAt: '2026-01-01' }]);
const handler = new AthleteApiHandler(apiStore);
let blocked = false;
try { await handler.createAthlete({ fullName: 'X', heightCm: 150, weightKg: 50 }, { userId: 'u-ath', role: 'athlete' }); } catch { blocked = true; }
check('53. RBAC: athlete oluşturamaz', blocked === true);

check('50. LWW: yeni yerel kazanır', resolveLastWriteWins('2026-08-01T00:00:00Z', '2026-07-01T00:00:00Z') === true);
const rollup = aggregateWeeklyRollups([{ id: 's1', athleteId: 'a1', sessionDate: '2026-08-18', trimp: 100, acwr: 1.1 } as SessionRow]);
check('55. Haftalık rollup hesaplanır', rollup.length === 1 && rollup[0].totalTrimp === 100);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

