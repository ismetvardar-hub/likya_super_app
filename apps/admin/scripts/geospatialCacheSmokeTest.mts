// ============================================================================
// 🛠️ GEOSPATIAL + SEMANTIC CACHE SMOKE TESTİ
// Harita pin projeksiyonu • Geofence ENTER/EXIT • Semantik önbellek hit/miss
// • Sezon hafıza vektör sıkıştırma
// Çalıştırma: node scripts/geospatialCacheSmokeTest.mts
// ============================================================================
import {
  projectLngLatToMap,
  pointInPolygon,
  locateAthlete,
  GeofenceTracker,
  projectFacilityLayout,
  projectIotDevices,
  iotStatusColor,
  COURT_ZONES,
  FACILITY_ITEMS,
  IOT_DEVICES,
} from '../src/app/lib/facility/courtGeoEngine.ts';
import { fnv1a64, SemanticQueryCache, type TelemetryProfile } from '../src/app/lib/ai/cache/semanticQueryCache.ts';
import { SeasonMemoryBuffer } from '../src/app/lib/sports/avatar/seasonMemoryBuffer.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── 1. HARİTA PİN PROJEKSİYONU ────────────────────────────────────────────────
const center = projectLngLatToMap(36.21, 29.66, 1000, 600);
check('1a. Bounds merkezi → (500, 300)', center.x === 500 && center.y === 300);
const corner = projectLngLatToMap(36.23, 29.64, 1000, 600);
check('1b. MaxLat/MinLng köşesi → (0, 0)', corner.x === 0 && corner.y === 0);
const court1 = projectLngLatToMap(36.221, 29.651, 1000, 600);
check('1c. Kort 1 pin projeksiyonu aralıkta', court1.x > 250 && court1.x < 350 && court1.y > 120 && court1.y < 170);

// ── 2. GEOFENCE ÇOKGEN + ENTER/EXIT ───────────────────────────────────────────
check('2a. Kort alanı içi → true', pointInPolygon(36.22, 29.655, COURT_ZONES[0].polygon) === true);
check('2b. Kort alanı dışı → false', pointInPolygon(36.2, 29.65, COURT_ZONES[0].polygon) === false);
check('2c. locateAthlete iki bölgeyi listeler', locateAthlete(36.22, 29.655).length === 2);

const tracker = new GeofenceTracker();
const first = tracker.check('a1', 36.2, 29.65);
const enter = tracker.check('a1', 36.22, 29.655);
const stay = tracker.check('a1', 36.22, 29.655);
const exit = tracker.check('a1', 36.2, 29.65);
check('2d. İlk kayıt → olay yok', first.event === null);
check('2e. Bölgeye giriş → GEOFENCE_ENTER', enter.event === 'ENTER' && enter.zoneId === 'court-area');
check('2f. Aynı bölge → tekrar olay yok', stay.event === null);
check('2g. Bölgeden çıkış → GEOFENCE_EXIT', exit.event === 'EXIT');

// ── 3. TESİS DÜZENİ + IoT ─────────────────────────────────────────────────────
check('3a. 10 tesis öğesi (8 kort + salon + soyunma)', projectFacilityLayout().length === 10 && FACILITY_ITEMS.length === 10);
check('3b. 6 IoT cihaz + renk eşleme', projectIotDevices().length === 6 && IOT_DEVICES.length === 6 && iotStatusColor('online') === '#10B981' && iotStatusColor('offline') === '#F43F5E');

// ── 4. SIFIR-TOKEN SEMANTİK ÖNBELBEK ──────────────────────────────────────────
check('4a. fnv1a64 deterministik + ayırt edici', fnv1a64('profil') === fnv1a64('profil') && fnv1a64('a') !== fnv1a64('b'));

const cache = new SemanticQueryCache();
const profile: TelemetryProfile = { athleteId: 'at-1', metrics: { gctMs: 200, rsi: 1.8, hrv: 52 }, version: 1 };
const sameProfile: TelemetryProfile = { athleteId: 'at-1', metrics: { gctMs: 200, rsi: 1.8, hrv: 52 }, version: 1 };
const different: TelemetryProfile = { athleteId: 'at-1', metrics: { gctMs: 240, rsi: 1.5, hrv: 40 }, version: 1 };
check('4b. Aynı profil → aynı parmak izi', cache.fingerprint(profile) === cache.fingerprint(sameProfile));
check('4c. Farklı metrik → farklı parmak izi', cache.fingerprint(profile) !== cache.fingerprint(different));

let analyzerCalls = 0;
const analyzer = () => {
  analyzerCalls++;
  return { interpretation: 'Orta temas + iyi RSI — reaktif güç sağlıklı', insight: 'GCT 200ms hedef bandında', tokens: 120 };
};
const miss = await cache.analyzeCached(profile, analyzer);
const hit = await cache.analyzeCached(sameProfile, analyzer);
check('4d. İlk istek miss (LLM çalışır), ikinci hit ($0 token)', miss.hit === false && hit.hit === true && analyzerCalls === 1);
check('4e. Hit yorumu önbellekten döner', hit.result.interpretation === miss.result.interpretation);
const stats = cache.stats();
check('4f. Hit oranı %50 + 120 token tasarruf', stats.hitRatePct === 50 && stats.tokensSaved === 120 && stats.entries === 1);

// ── 5. SEZON HAFIZA VEKTÖR SIKIŞTIRMA ──────────────────────────────────────────
const mem = new SeasonMemoryBuffer();
mem.recordSession('at-2');
mem.recordSession('at-2');
mem.recordMilestone('at-2', 'Yeni PB 5-10m', 5);
mem.recordFlaw('at-2', 'Yüksek GCT');
mem.recordFlaw('at-2', 'Yüksek GCT');
mem.recordFlaw('at-2', 'L/R asimetri');
mem.recordRecovery('at-2', 'HRV', 'faster');
const m = mem.getMemory('at-2');
check('5a. Milestone + tekrarlayan kusur sayımı', m?.milestones.length === 1 && m?.flaws.find((f) => f.label === 'Yüksek GCT')?.count === 2 && m?.sessionCount === 2);

const compressed = mem.compressVector('at-2', 1);
check('5b. Sıkıştırma: en çok tekrarlayan kusur önde', compressed?.flaws.length === 1 && compressed?.flaws[0].label === 'Yüksek GCT');

const ctx = mem.injectContext('at-2');
check('5c. Ghost Avatar bağlamı: kusur + toparlanma trendi', ctx.recurringFlaws.includes('Yüksek GCT') && ctx.recoveryNote.includes('HRV: hızlandı'));
check('5d. Sezon bağlam bloğu formatı', mem.seasonContextBlock('at-2').includes('[Sezon Hafıza · at-2]') && mem.seasonContextBlock('at-2').includes('Yüksek GCT'));

const emptyCtx = new SeasonMemoryBuffer().injectContext('at-3');
check('5e. Boş sporcu → sıfır kusur + yok notu', emptyCtx.sessionCount === 0 && emptyCtx.recurringFlaws.length === 0);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

