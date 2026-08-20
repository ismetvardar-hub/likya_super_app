// ============================================================================
// 🛠️ TRACK 4 — BATCH 11 SMOKE TESTİ (Adım 51-55)
// Telemetri sıkıştırma • Storage adaptör • Sporcu CRUD RBAC • Takım yönetimi • Trend
// Çalıştırma: node scripts/track4Batch11SmokeTest.mts
// ============================================================================
import {
  compressTelemetryBatch, decompressTelemetryBatch, compressionRatioPct,
  type TelemetryPoint,
} from '../src/app/lib/storage/telemetryCompressor.ts';
import { SupabaseStorageAdapter, createMockStorageProvider } from '../src/app/lib/storage/supabaseStorageAdapter.ts';
import { AthleteApiHandler, createMemoryAthleteStore, type AuthContext } from '../src/app/lib/api/athleteApiHandler.ts';
import { SquadManagementApi, createMemorySquadStore } from '../src/app/lib/api/squadManagementApi.ts';
import { aggregateWeeklyRollups, parseWeeklyRollup, parseSquadSummary, squadPerformanceSummary, mondayOf, type SessionRow } from '../src/app/lib/analytics/historicalTrendAggregator.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 51: TELEMETRİ SIKIŞTIRMA (≥%70 + round-trip) ─────────────────────────
const frames: TelemetryPoint[] = Array.from({ length: 100 }, (_, i) => ({
  timestampMs: i * 10,
  hr: 150 + (i % 10),
  gctMs: 200 + (i % 5) * 5,
  toePressure: 60 + (i % 20),
  heelPressure: 30 + (i % 15),
  armVelocity: 85.5 + (i % 10) * 0.5,
  loadingRate: 2.0 + (i % 8) * 0.05,
  rsi: 1.8 + (i % 6) * 0.02,
}));
const ratio = compressionRatioPct(frames);
check(`51a. Sıkıştırma oranı ≥%70 (gerçek: %${ratio})`, ratio >= 70);

const restored = decompressTelemetryBatch(compressTelemetryBatch(frames));
check('51b. Round-trip: zaman damgaları birebir', restored.length === 100 && restored[0].timestampMs === 0 && restored[50].timestampMs === 500 && restored[99].timestampMs === 990);
check('51c. Round-trip: HR/GCT/basınç tam sayı hassasiyeti', restored[10].hr === frames[10].hr && restored[10].gctMs === frames[10].gctMs && restored[10].toePressure === frames[10].toePressure);
check('51d. Round-trip: kuantize ondalıklar ±0.05', Math.abs(restored[10].armVelocity - frames[10].armVelocity) <= 0.05 && Math.abs(restored[10].rsi - frames[10].rsi) <= 0.05);
check('51e. Boş batch güvenli', decompressTelemetryBatch(compressTelemetryBatch([])).length === 0);

// ── ADIM 52: SUPABASE STORAGE ADAPTÖRÜ (mock) ─────────────────────────────────
const storage = new SupabaseStorageAdapter(createMockStorageProvider());
const pdfPath = await storage.uploadReportPdf('session-1', new TextEncoder().encode('%PDF-1.4 mock'));
const signedUrl = await storage.getSignedReportUrl(pdfPath, 3600);
check('52a. PDF upload → path + signed URL mock', pdfPath.includes('session-1') && signedUrl.includes('token=mock') && signedUrl.includes('expires=3600'));

const avatarPath = await storage.uploadAvatar('athlete-1', new TextEncoder().encode('PNGDATA'));
await storage.uploadDrillDiagram('drop-jumps', new TextEncoder().encode('<svg/>'));
check('52b. Avatar + drill diagram upload', avatarPath.includes('athlete-1') && avatarPath.endsWith('.png'));
const reports = await storage.listBucket('reports');
check('52c. Bucket listeleme (reports)', reports.length === 1 && reports[0] === pdfPath);
let signedError = false;
try { await storage.getSignedReportUrl('nonexistent.pdf', 60); } catch { signedError = true; }
check('52d. Var olmayan dosya → signed URL hatası', signedError === true);

// ── ADIM 53: SPORCU CRUD + RBAC ────────────────────────────────────────────────
const athleteStore = createMemoryAthleteStore([
  { id: 'at-1', userId: 'u-ath', fullName: 'Efe Yılmaz', heightCm: 148, weightKg: 38, squadId: 'sq-a', birthDate: '2012-01-01', createdAt: '2026-01-01' },
  { id: 'at-2', userId: 'u-other', fullName: 'Arda Aksoy', heightCm: 181, weightKg: 74, squadId: 'sq-b', birthDate: '2006-01-01', createdAt: '2026-01-01' },
]);
const api = new AthleteApiHandler(athleteStore);
const coachA: AuthContext = { userId: 'u-ca', role: 'coach', squadIds: ['sq-a'] };
const coachB: AuthContext = { userId: 'u-cb', role: 'coach', squadIds: ['sq-b'] };
const athleteCtx: AuthContext = { userId: 'u-ath', role: 'athlete' };
const ceo: AuthContext = { userId: 'u-ceo', role: 'ceo' };

check('53a. Athlete kendi profilini görür', (await api.getAthlete('at-1', athleteCtx))?.id === 'at-1');
let forbidden = false;
try { await api.getAthlete('at-2', athleteCtx); } catch (e) { forbidden = String(e).includes('403'); }
check('53b. Athlete başkasının profilini göremez (403)', forbidden === true);

let athleteCreate = false;
try { await api.createAthlete({ fullName: 'X', heightCm: 150, weightKg: 50 }, athleteCtx); } catch (e) { athleteCreate = String(e).includes('403'); }
check('53c. Athlete sporcu oluşturamaz (403)', athleteCreate === true);

let coachWrongSquad = false;
try { await api.createAthlete({ fullName: 'X', heightCm: 150, weightKg: 50, squadId: 'sq-a' }, coachB); } catch (e) { coachWrongSquad = String(e).includes('403'); }
check("53d. Yanlış takım coach'u ekleyemez (403)", coachWrongSquad === true);

const created = await api.createAthlete({ fullName: 'Zeynep', heightCm: 152, weightKg: 42, squadId: 'sq-a' }, coachA);
check('53e. Yetkili coach takımına ekleyebilir', created.squadId === 'sq-a');

let invalid = false;
try { await api.createAthlete({ fullName: 'X', heightCm: 300, weightKg: 50 }, ceo); } catch (e) { invalid = String(e).includes('422'); }
check('53f. Geçersiz boy (300cm) → 422', invalid === true);
let invalidW = false;
try { await api.updateAthlete('at-1', { weightKg: 200 }, coachA); } catch (e) { invalidW = String(e).includes('422'); }
check('53g. Geçersiz kilo (200kg) → 422', invalidW === true);

let unAuthUpdate = false;
try { await api.updateAthlete('at-2', { weightKg: 60 }, coachA); } catch (e) { unAuthUpdate = String(e).includes('403'); }
check('53h. Başka takım sporcusunu düzenleyemez (403)', unAuthUpdate === true);

const ceoList = await api.listAthletes(undefined, ceo);
const coachList = await api.listAthletes(undefined, coachA);
const athleteList = await api.listAthletes(undefined, athleteCtx);
check('53i. Liste kapsamı: ceo hepsi, coach takımı, athlete kendi', ceoList.length >= 3 && coachList.every((a) => a.squadId === 'sq-a') && athleteList.length === 1);

// ── ADIM 54: TAKIM YÖNETİMİ ───────────────────────────────────────────────────
const squadApi = new SquadManagementApi(createMemorySquadStore(), {
  get: (id) => (id === 'a1' ? { avgRsi: 2.0, avgGctMs: 190, injuryRisk: 'low' } : id === 'a2' ? { avgRsi: 1.5, avgGctMs: 240, injuryRisk: 'high' } : null),
});
const squad = squadApi.createSquad('Junior Gelişim', 'coach-1', 'junior');
squadApi.addCoachToSquad(squad.id, 'coach-2');
const assigned = squadApi.assignAthletesToSquad(squad.id, ['a1', 'a2', 'a1']);
check('54a. Çoklu coach + tekrar eden atama tekilleştirilir', squad.coachIds.length === 2 && assigned.added === 2);
const removed = squadApi.removeAthleteFromSquad(squad.id, 'a1');
const roster = squadApi.getSquadRoster(squad.id);
check('54b. Kadro: a2 kaldı + istatistikler', removed.removed === true && roster?.athleteCount === 1 && roster.highRiskCount === 1 && roster.readinessPct === 0);
squadApi.assignAthletesToSquad(squad.id, ['a1']);
const roster2 = squadApi.getSquadRoster(squad.id);
check('54c. Kadro istatistiği: 2 sporcu, avg RSI 1.75, hazırlık %50', roster2?.athleteCount === 2 && roster2.avgRsi === 1.75 && roster2.readinessPct === 50);

// ── ADIM 55: TREND AGGREGASYON ────────────────────────────────────────────────
check('55a. mondayOf: 2026-08-20 (Perşembe) → 2026-08-17 (Pazartesi)', mondayOf('2026-08-20') === '2026-08-17');
const parsed = parseWeeklyRollup({ week_start: '2026-08-17', total_trimp: '120.5', avg_rsi: '1.8', avg_gct_ms: '210.0', avg_acwr: '1.1', peak_strike_force: '980.0', session_count: '3' });
check('55b. SQL satır ayrıştırma', parsed.totalTrimp === 120.5 && parsed.avgRsi === 1.8 && parsed.sessionCount === 3);

const sessions: SessionRow[] = [
  { id: 's1', athleteId: 'a1', sessionDate: '2026-08-18', trimp: 100, acwr: 1.1, avgRsi: 1.9, avgGctMs: 200, peakStrikeForce: 950 },
  { id: 's2', athleteId: 'a1', sessionDate: '2026-08-20', trimp: 80, acwr: 1.05, avgRsi: 1.8, avgGctMs: 210, peakStrikeForce: 900 },
  { id: 's3', athleteId: 'a1', sessionDate: '2026-08-25', trimp: 120, acwr: 1.2, avgRsi: 1.7, avgGctMs: 205, peakStrikeForce: 980 },
];
const rollups = aggregateWeeklyRollups(sessions);
check('55c. Haftalık gruplama: 2 hafta, ilkinde 2 seans', rollups.length === 2 && rollups[0].sessionCount === 2 && rollups[0].totalTrimp === 180 && rollups[0].peakStrikeForce === 950);

const summary = squadPerformanceSummary(sessions, [
  { athleteId: 'a1', injuryRisk: 'low' },
  { athleteId: 'a2', injuryRisk: 'high' },
]);
check('55d. Takım özeti: 2 sporcu, %50 hazırlık, 1 yüksek risk', summary.athleteCount === 2 && summary.readyPct === 50 && summary.highRiskCount === 1);
const parsedSquad = parseSquadSummary({ athlete_count: '2', ready_pct: '50', medium_risk_count: '0', high_risk_count: '1', avg_trimp: '100.0', avg_acwr: '1.1' });
check('55e. SQL takım özeti satır ayrıştırma', parsedSquad.highRiskCount === 1 && parsedSquad.readyPct === 50);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

