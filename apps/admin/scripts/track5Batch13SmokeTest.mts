// ============================================================================
// 🛠️ TRACK 5 — BATCH 13 SMOKE TESTİ (Adım 61-65)
// XP Seviye • Rozetler • Streak • Kohort Radar • 3D Ayak Basınç Shader
// Çalıştırma: node scripts/track5Batch13SmokeTest.mts
// ============================================================================
import { levelForXp, levelProgress, awardXp, unlockedTitles } from '../src/app/lib/gamification/athleteXpEngine.ts';
import { evaluateBadges, getBadge, BADGE_REGISTRY } from '../src/app/lib/gamification/badgeRegistry.ts';
import { computeStreak, computeAdherence, type StreakDay } from '../src/app/lib/gamification/streakTracker.ts';
import { percentileOf, buildCohortRadar, validateAnonymity, type RadarInput } from '../src/app/lib/analytics/cohortRadarEngine.ts';
import { pressureToColor, pressureToCss, footMeshConfig, footVertexHeights, buildFootHeatmapFrame } from '../src/app/lib/three/footPressureShader.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 61: XP SEVİYE EĞRİSİ ─────────────────────────────────────────────────
check('61a. Seviye sınırları (0→1, 100→2, 400→3, 900→4)', levelForXp(0) === 1 && levelForXp(100) === 2 && levelForXp(400) === 3 && levelForXp(900) === 4);
check('61b. Sınır öncesi (99 XP → hâlâ 1)', levelForXp(99) === 1);

const prog = levelProgress(250);
check('61c. Seviye ilerleme: 250 XP → L2, %50, 150 XP kaldı', prog.level === 2 && prog.progressPct === 50 && prog.xpNeededForNext === 150);
const prog2 = levelProgress(100);
check('61d. 100 XP → L2 başlangıcı (%0)', prog2.level === 2 && prog2.progressPct === 0);

const awarded = awardXp([{ kind: 'session' }, { kind: 'session' }, { kind: 'rsi_pb' }, { kind: 'weekly_streak' }]);
check('61e. XP toplamı: 100+100+250+300 = 750 → L3', awarded.xp === 750 && awarded.level === 3);
check('61f. Rütbe başlıkları eşikleri', unlockedTitles(250).includes('Çaylak') && unlockedTitles(250).includes('Gelişen Atlet') === false && unlockedTitles(1000).includes('Çevik Atlet'));

// ── ADIM 62: ROZET KRİTERLERİ ─────────────────────────────────────────────────
check('62a. SPEED_DEMON (split<1.0s)', evaluateBadges({ sprintSplit5m: 0.95 }).some((b) => b.id === 'SPEED_DEMON'));
check('62b. IRON_STAMINA (TRIMP>150)', evaluateBadges({ trimp: 200 }).some((b) => b.id === 'IRON_STAMINA'));
check('62c. PERFECT_BALANCE (asimetri<%3)', evaluateBadges({ asymmetryPct: 2 }).some((b) => b.id === 'PERFECT_BALANCE'));
check('62d. CONSISTENCY_KING (10 gün seri)', evaluateBadges({ streakDays: 10 }).some((b) => b.id === 'CONSISTENCY_KING'));
check('62e. FIRST_SERVE_ACE', evaluateBadges({ serveAces: 1 }).some((b) => b.id === 'FIRST_SERVE_ACE'));
check('62f. Eşik altı bağlam → rozet yok', evaluateBadges({ trimp: 100, sprintSplit5m: 1.2, asymmetryPct: 8, streakDays: 5 }).length === 0);
check('62g. Kayıt 5 rozet + getBadge', BADGE_REGISTRY.length === 5 && getBadge('SPEED_DEMON')?.id === 'SPEED_DEMON');

// ── ADIM 63: STREAK & TUTARLILIK (dondurma koruması) ──────────────────────────
const streakDays: StreakDay[] = [
  { date: '2026-08-01', attended: true },
  { date: '2026-08-02', attended: true },
  { date: '2026-08-03', attended: false },
  { date: '2026-08-04', attended: true },
  { date: '2026-08-05', attended: true },
];
const withFreeze = computeStreak(streakDays, true);
const noFreeze = computeStreak(streakDays, false);
check('63a. Dondurma: 1 günlük ara seriyi korur (4 gün)', withFreeze.currentStreak === 4 && withFreeze.frozenDays === 1);
check('63b. Dondurma kapalıyken ara seriyi bozar (2 gün)', noFreeze.currentStreak === 2 && noFreeze.frozenDays === 0);
check('63c. Katılım skoru %80 (4/5)', withFreeze.adherencePct === 80 && computeAdherence(streakDays, 5) === 80);
check('63d. Best streak 4', withFreeze.bestStreak === 4);

// ── ADIM 64: ANONİM KOHORT YÜZDELİK RADAR ─────────────────────────────────────
const cohort10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
check('64a. Yüzdelik: 5 → %50, 10 → %100', percentileOf(5, cohort10) === 50 && percentileOf(10, cohort10) === 100);

const radarInput: RadarInput = {
  athlete: { sprintSpeed: 7.5, rsi: 2.0, gct: 180, trimp: 120, symmetry: 5 },
  cohort: {
    sprintSpeed: [6, 6.5, 7, 7.5, 8],
    rsi: [1.0, 1.5, 2.0, 2.5],
    gct: [200, 220, 240, 260],
    trimp: [50, 80, 110, 140],
    symmetry: [3, 5, 8, 12],
  },
};
const radar = buildCohortRadar(radarInput);
const rsiAxis = radar.find((a) => a.key === 'rsi');
const gctAxis = radar.find((a) => a.key === 'gct');
check('64b. RSI 2.0 kohortta %75', rsiAxis?.value === 75);
check('64c. GCT 180 → ters yüzdelik %100', gctAxis?.value === 100 && gctAxis.athleteRaw === 180);
check('64d. 5 eksen + aralık doğruluğu', radar.length === 5 && radar.every((a) => a.value >= 0 && a.value <= 100));
check('64e. Anonimlik sözleşmesi', validateAnonymity(radarInput.cohort) === true);

// ── ADIM 65: 3D AYAK BASINÇ SHADER / GEOMETRİ ─────────────────────────────────
const c0 = pressureToColor(0), c50 = pressureToColor(50), c100 = pressureToColor(100);
check('65a. Renk gradyanı: Mavi→Yeşil→Kırmızı', c0.b === 255 && c50.g === 255 && c100.r === 255 && c0.r < c100.r);
check('65b. CSS rengi', pressureToCss(50) === 'rgb(40,255,100)');
const mesh = footMeshConfig();
check('65c. Mesh konfig: 100×250mm, 12×24 segment', mesh.width === 100 && mesh.length === 250 && mesh.segmentsX === 12 && mesh.segmentsY === 24);
const heights = footVertexHeights([[100], [50], [0]]);
check('65d. Dikey deformasyon: %100→6, %50→3, %0→0', heights[0][0] === 6 && heights[1][0] === 3 && heights[2][0] === 0);

const grid = Array.from({ length: 8 }, (_, y) => Array.from({ length: 16 }, (_, x) => (Math.abs(x - 8) + Math.abs(y - 4)) % 40 + 30));
const frame = buildFootHeatmapFrame(grid);
check('65e. Eliptik ayak maskesi hücre üretir + renkli', frame.cells.length > 0 && frame.cells.every((c) => c.color && c.pressure > 0));

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

