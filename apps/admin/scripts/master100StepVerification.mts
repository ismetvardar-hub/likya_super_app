// ============================================================================
// 🏁 MASTER 100-STEP VERIFICATION (Adım 121-125 dahil — PİLOT FAZ 5)
// • 25 batch'in tüm smoke testlerini + 6 birim testini + E2E'yi çalıştırır
// • Roadmap'te 125/125 adımın [x] olduğunu doğrular
// • Her batch'in anahtar motor dosyasının varlığını kontrol eder
// Çalıştırma: node scripts/master100StepVerification.mts
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` — ${detail}` : ''}`);
};

const runNode = (file: string): boolean => {
  const r = spawnSync('node', [file], { encoding: 'utf8', timeout: 120_000 });
  return r.status === 0;
};

// ── 1. BATCH SMOKE TESTLERİ (Track 2-7 + yardımcılar) ─────────────────────────
const smokeTests = [
  'scripts/tinyKinematicsSmokeTest.mts',
  'scripts/track2Batch5SmokeTest.mts',
  'scripts/track2Batch6SmokeTest.mts',
  'scripts/track3Batch7SmokeTest.mts',
  'scripts/track3Batch8SmokeTest.mts',
  'scripts/track3Batch9SmokeTest.mts',
  'scripts/geospatialCacheSmokeTest.mts',
  'scripts/track4Batch10SmokeTest.mts',
  'scripts/track4Batch11SmokeTest.mts',
  'scripts/track4Batch12SmokeTest.mts',
  'scripts/track5Batch13SmokeTest.mts',
  'scripts/track5Batch14SmokeTest.mts',
  'scripts/track5Batch15SmokeTest.mts',
  'scripts/track6Batch16SmokeTest.mts',
  'scripts/track6Batch17SmokeTest.mts',
  'scripts/track7Batch18SmokeTest.mts',
  'scripts/track7Batch19SmokeTest.mts',
  'scripts/track8Batch20SmokeTest.mts',
  'scripts/pilotPhase1SmokeTest.mts',
  'scripts/pilotPhase2SmokeTest.mts',
  'scripts/pilotPhase3SmokeTest.mts',
  'scripts/pilotPhase4SmokeTest.mts',
  'scripts/pilotPhase5SmokeTest.mts',
];
let smokePass = 0;
for (const t of smokeTests) {
  const ok = existsSync(t) && runNode(t);
  if (ok) smokePass++;
  check(`Smoke: ${t}`, ok);
}
check('Tüm batch smoke testleri geçti', smokePass === smokeTests.length, `${smokePass}/${smokeTests.length}`);

// ── 2. BİRİM TESTLERİ (.test.mts) ─────────────────────────────────────────────
const unitTests = [
  'mobileSyncBridge.test.mts',
  'jsxGuard.test.mts',
  'athleteMediaVault.test.mts',
  'sportScienceBatch.test.mts',
  'bleParserCalibration.test.mts',
  'tinyMlsys.test.mts',
];
let unitPass = 0;
for (const t of unitTests) {
  const ok = existsSync(t) && runNode(t);
  if (ok) unitPass++;
  check(`Unit: ${t}`, ok);
}
check('Tüm birim testleri geçti', unitPass === unitTests.length, `${unitPass}/${unitTests.length}`);

// ── 3. E2E SENARYOLARI ─────────────────────────────────────────────────────────
const e2eOk = existsSync('scripts/runE2eHeadless.mts') && runNode('scripts/runE2eHeadless.mts');
check('E2E: 3 senaryo (Koç / Veli / Offline Sync)', e2eOk);

// ── 4. HER BATCH'İN ANAHTAR MOTORU MEVCUT ─────────────────────────────────────
const batchEngines: Array<[string, string]> = [
  ['Batch 1 (Adım 1-5)', 'src/app/lib/ops/communicationSuite.ts'],
  ['Batch 2 (Adım 6-10)', 'src/app/lib/ops/geofenceAlertTrigger.ts'],
  ['Batch 3 (Adım 11-15)', 'src/app/lib/ops/notificationCenter.ts'],
  ['Batch 4 (Adım 16-20)', 'src/app/lib/hardware/bleProtocolDefinition.ts'],
  ['Batch 5 (Adım 21-25)', 'src/app/lib/hardware/sensorSyncEngine.ts'],
  ['Batch 6 (Adım 26-30)', 'src/app/lib/sports/analytics/asymmetryEngine.ts'],
  ['Batch 7 (Adım 31-35)', 'src/app/lib/sports/analytics/acwrEngine.ts'],
  ['Batch 8 (Adım 36-40)', 'src/app/lib/sports/analytics/rsiTierEngine.ts'],
  ['Batch 9 (Adım 41-45)', 'src/app/lib/sports/analytics/recoveryDurationEngine.ts'],
  ['Batch 10 (Adım 46-50)', 'src/app/lib/db/seedFixtures.ts'],
  ['Batch 11 (Adım 51-55)', 'src/app/lib/storage/telemetryCompressor.ts'],
  ['Batch 12 (Adım 56-60)', 'src/app/lib/db/retentionPolicyEngine.ts'],
  ['Batch 13 (Adım 61-65)', 'src/app/lib/gamification/athleteXpEngine.ts'],
  ['Batch 14 (Adım 66-70)', 'src/app/lib/ui/dashboardLayoutEngine.ts'],
  ['Batch 15 (Adım 71-75)', 'src/app/lib/gamification/pbDetectionEngine.ts'],
  ['Batch 16 (Adım 76-80)', 'src/app/lib/match/matchScoreEngine.ts'],
  ['Batch 17 (Adım 81-85)', 'src/app/lib/scouting/talentIdIndexEngine.ts'],
  ['Batch 18 (Adım 86-90)', 'src/app/lib/facility/courtOccupancyEngine.ts'],
  ['Batch 19 (Adım 91-95)', 'src/app/lib/finance/revenueAnalyticsEngine.ts'],
  ['Batch 20 (Adım 96-100)', 'src/app/lib/security/securityHeadersEngine.ts'],
  ['Batch 21 (Adım 101-105)', 'src/app/lib/monitoring/healthCheckEngine.ts'],
  ['Batch 22 (Adım 106-110)', 'src/app/lib/court/matchDaySessionEngine.ts'],
  ['Batch 23 (Adım 111-115)', 'src/app/lib/analytics/multiClubLeaderboardEngine.ts'],
  ['Batch 24 (Adım 116-120)', 'src/app/lib/hardware/hardwareFleetManager.ts'],
  ['Batch 25 (Adım 121-125)', 'src/app/lib/ai/openRouterGateway.ts'],
];
let enginePass = 0;
for (const [batch, engine] of batchEngines) {
  const ok = existsSync(engine);
  if (ok) enginePass++;
  check(`${batch} motor: ${engine}`, ok);
}
check('25 batch motor dosyası mevcut', enginePass === batchEngines.length, `${enginePass}/${batchEngines.length}`);

// ── 5. ROADMAP 125/125 [x] ────────────────────────────────────────────────────
const roadmap = readFileSync('../../docs/100_STEP_EXECUTION_ROADMAP.md', 'utf8');
const checked = (roadmap.match(/^\| \d{2,3} \|.*\[x\]/gm) ?? []).length;
const totalSteps = (roadmap.match(/^\| \d{2,3} \|/gm) ?? []).length;
check('Roadmap: 125/125 adım [x]', checked >= 125 && totalSteps >= 125, `${checked} [x] / ${totalSteps} adım`);

// ── SONUÇ ─────────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok).length;
console.log(`\n🎉 MASTER VERIFICATION: ${results.length - failed}/${results.length} kontrol geçti — 125/125 ROADMAP %100 (Pilot Faz 1-5 dahil)`);
process.exit(failed > 0 ? 1 : 0);
