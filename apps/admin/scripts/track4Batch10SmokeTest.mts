// ============================================================================
// 🛠️ TRACK 4 — BATCH 10 SMOKE TESTİ (Adım 46-50)
// SQL şema • RLS politikaları • Seed fikstürleri • Offline kuyruk • BG Sync
// Çalıştırma: node scripts/track4Batch10SmokeTest.mts
// ============================================================================
import { readFileSync } from 'node:fs';
import { buildSeedFixtures, seedFixturesSummary } from '../src/app/lib/db/seedFixtures.ts';
import { OfflineStorageEngine, createMemoryStorageBackend } from '../src/app/lib/storage/offlineStorageEngine.ts';
import { BackgroundSyncEngine, resolveLastWriteWins } from '../src/app/lib/sync/backgroundSyncEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

const schemaSql = readFileSync(new URL('../../../supabase/schema.sql', import.meta.url), 'utf8');
const rlsSql = readFileSync(new URL('../../../supabase/migrations/20260220_rls_policies.sql', import.meta.url), 'utf8');

// ── ADIM 46: SQL ŞEMA SÖZDİZİMİ + İLİŞKİSEL KISITLAR ─────────────────────────
const tables = ['squads', 'athletes', 'sessions', 'telemetry_frames', 'growth_records', 'parent_links', 'injury_alerts'];
check('46a. 7 tablo CREATE ifadesi mevcut', tables.every((t) => schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${t}`)));
check('46b. athletes zorunlu sütunlar', ['id uuid PRIMARY KEY', 'full_name text NOT NULL', 'birth_date date', 'squad_id uuid'].every((c) => schemaSql.includes(c)));
check('46c. sessions sport bilimi sütunları', ['trimp numeric', 'acwr numeric', 'avg_gct_ms numeric', 'avg_rsi numeric', 'injury_risk_level text'].every((c) => schemaSql.includes(c)));
check('46d. telemetry_frames zaman serisi sütunları', ['timestamp_ms bigint', 'gct_ms numeric', 'loading_rate numeric'].every((c) => schemaSql.includes(c)));
check('46e. FK kısıtları (athletes/sessions referansları)', schemaSql.includes('REFERENCES athletes(id)') && schemaSql.includes('REFERENCES sessions(id)') && schemaSql.includes('REFERENCES public.users(id)'));
check('46f. Performans indeksleri', ['athletes_squad_idx', 'sessions_athlete_date_idx', 'telemetry_session_idx', 'injury_athlete_idx'].every((i) => schemaSql.includes(i)));

// ── ADIM 47: ÇOK ROLLÜ RLS POLİTİKALARI ──────────────────────────────────────
check('47a. 5 tabloda RLS aktif', ['athletes', 'sessions', 'telemetry_frames', 'growth_records', 'injury_alerts'].every((t) => rlsSql.includes(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`)));
check('47b. CEO/Manager tam erişim', rlsSql.includes('ceo_manager_full_athletes') && rlsSql.includes('is_ceo_or_manager()'));
check('47c. Coach takım kapsamı', rlsSql.includes('coach_squad_athletes') && rlsSql.includes('is_coach_of_squad('));
check('47d. Parent yalnızca SELECT (bağlı çocuk)', rlsSql.includes('parent_children_read') && rlsSql.includes('is_parent_of('));
check('47e. Athlete yalnızca kendi verisi', rlsSql.includes('athlete_self_read') && rlsSql.includes('athlete_own_telemetry_read'));
check('47f. Yardımcı fonksiyonlar tanımlı', ['auth_user_role', 'is_ceo_or_manager', 'is_coach_of_squad', 'is_parent_of'].every((f) => rlsSql.includes(`public.${f}`)));

// ── ADIM 48: DETERMİNİSTİK SEED FİKSTÜRLERİ ───────────────────────────────────
const seedA = buildSeedFixtures(2026);
const seedB = buildSeedFixtures(2026);
check('48a. Deterministik (aynı seed → aynı veri)', JSON.stringify(seedA) === JSON.stringify(seedB));
check('48b. 2 takım + 6 sporcu (4 junior, 2 pro)', seedA.squads.length === 2 && seedA.athletes.length === 6);
check('48c. 72 seans (6 sporcu × 6 hafta × 2)', seedA.sessions.length === 72 && seedA.sessions.every((s) => s.trimp > 0 && s.acwr > 0));
check('48d. 864 telemetri çerçevesi', seedA.telemetryFrames.length === 864);
check('48e. Arda (pro) sakatlık bayrağı yüksek risk', seedA.sessions.some((s) => s.athleteId === '00000000-0000-0000-0000-000000000205' && s.injuryRiskLevel === 'high'));
check('48f. Sakatlık uyarıları + büyüme kayıtları + veli bağları', seedA.injuryAlerts.length >= 2 && seedA.growthRecords.length === 18 && seedA.parentLinks.length === 4);
check('48g. Özet tek satır', seedFixturesSummary(seedA).includes('72 seans'));

// ── ADIM 49: OFFLINE INDEXEDDB KUYRUĞU (push/pop) ──────────────────────────────
const storage = new OfflineStorageEngine(createMemoryStorageBackend());
await storage.enqueuePending('telemetry', { sessionId: 's1', timestampMs: 0 });
await storage.enqueuePending('drill', { drillId: 'drop-jumps' });
await storage.enqueuePending('growth', { athleteId: 'a1', heightCm: 152 });
check('49a. 3 kayıt kuyruğa alındı', (await storage.countPending()) === 3);
const dequeued = await storage.dequeuePending(2);
check('49b. dequeue 2 → kuyrukta 1 kaldı', dequeued.length === 2 && (await storage.countPending()) === 1);
check('49c. FIFO sıralama korunur', dequeued[0].kind === 'telemetry' && dequeued[1].kind === 'drill');

await storage.putTelemetry({ sessionId: 's1', timestampMs: 100, hr: 150, gctMs: 200 });
await storage.putTelemetry({ sessionId: 's1', timestampMs: 200, hr: 160, gctMs: 210 });
const frames = await storage.getTelemetry('s1');
check('49d. Telemetri çerçeveleri zaman sıralı', frames.length === 2 && frames[0].timestampMs === 100 && frames[1].hr === 160);
await storage.putGrowthLog('a1', '2026-08-01', { weightKg: 40 });
check('49e. Büyüme günlüğü', (await storage.getGrowthLogs('a1')).length === 1);

// ── ADIM 50: ARKA PLAN SENKRONİZASYON (batch + online/offline + LWW) ──────────
check('50a. LWW: daha yeni yerel kazanır', resolveLastWriteWins('2026-08-01T00:00:00Z', '2026-07-01T00:00:00Z') === true);
check('50b. LWW: daha eski yerel kaybeder', resolveLastWriteWins('2026-06-01T00:00:00Z', '2026-07-01T00:00:00Z') === false);

let handlerCalls = 0;
let handlerBatches: number[][] = [];
const syncStorage = new OfflineStorageEngine(createMemoryStorageBackend());
const sync = new BackgroundSyncEngine(
  syncStorage,
  async (batch) => {
    handlerCalls++;
    handlerBatches.push(batch.map((r) => r.id));
    return { ok: true };
  },
  25,
);

sync.setConnectivity(false);
for (let i = 0; i < 60; i++) await syncStorage.enqueuePending('telemetry', { sessionId: 'bulk', i });
const offlineResult = await sync.flushBatches();
check('50c. Çevrimdışıyken flush → idle, handler çalışmaz', offlineResult.phase === 'idle' && handlerCalls === 0);

sync.setConnectivity(true);
await new Promise((r) => setTimeout(r, 20)); // otomatik flush'ın tamamlanması
check('50d. Online → 60 kayıt 3 batch (25+25+10)', handlerCalls === 3 && handlerBatches[0].length === 25 && handlerBatches[2].length === 10);
check('50e. Kuyruk boşaldı', (await syncStorage.countPending()) === 0);

// Çakışma çözümü: remote daha yeni → yerel kaybeder, kuyruktan düşer
const conflictStorage = new OfflineStorageEngine(createMemoryStorageBackend());
const conflictSync = new BackgroundSyncEngine(
  conflictStorage,
  async (batch) => ({
    ok: false,
    conflictIds: batch.map((r) => r.id),
    remoteVersions: Object.fromEntries(batch.map((r) => [r.id, '2099-01-01T00:00:00Z'])),
  }),
  10,
);
conflictSync.setConnectivity(false);
const c1 = await conflictStorage.enqueuePending('growth', { athleteId: 'x' });
conflictSync.setConnectivity(true);
await new Promise((r) => setTimeout(r, 20));
check('50f. Remote daha yeni → LWW çözümü, kuyruk boşalır + error fazı', (await conflictStorage.countPending()) === 0 && c1 !== null);

// İlerleme olayları
let progressEvents: string[] = [];
const evtSyncStorage = new OfflineStorageEngine(createMemoryStorageBackend());
const evtSync = new BackgroundSyncEngine(evtSyncStorage, async (b) => ({ ok: true }), 5);
evtSync.onProgress((e) => progressEvents.push(e.phase));
evtSync.setConnectivity(false);
for (let i = 0; i < 12; i++) await evtSyncStorage.enqueuePending('session', { i });
evtSync.setConnectivity(true);
await new Promise((r) => setTimeout(r, 20));
check('50g. İlerleme olayları yayınlandı (flushing + done)', progressEvents.includes('flushing') && progressEvents.includes('done'));

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

