// ============================================================================
// 🛠️ TRACK 6 — BATCH 16 SMOKE TESTİ (Adım 76-80)
// Maç Skoru • Scout Rapor • Video↔BLE Sync • Ağır Çekim • Bracket
// Çalıştırma: node scripts/track6Batch16SmokeTest.mts
// ============================================================================
import { newTennisScore, scoreTennisPoint, tennisPointDisplay, tennisDisplay, newBasketballScore, basketballScored, basketballShotClock, nextBasketballPeriod } from '../src/app/lib/match/matchScoreEngine.ts';
import { scoutGrade, gradeAll, buildScoutReport, reportPdfStructure, tierForGrade, type ScoutMetrics } from '../src/app/lib/scouting/scoutReportGenerator.ts';
import { computeVideoBleOffset, videoToBleTime, sliceTelemetryForVideo, estimateOffsetFromAnchors, type BleTelemetryFrame } from '../src/app/lib/video/videoBleSyncEngine.ts';
import { frameIndexAt, stepFrames, advancePlayback, jointAngle, lineAngle, racketSwingLine } from '../src/app/lib/video/videoPlayerEngine.ts';
import { generateBracket, registerWinner, assignCourt, roundOneMatches, seedDistributionOk, BRACKET_SIZES } from '../src/app/lib/tournament/bracketGenerator.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 76a: TENİS SKOR DURUM MAKİNESİ ───────────────────────────────────────
let t = newTennisScore('A');
t = scoreTennisPoint(t, 'A'); t = scoreTennisPoint(t, 'A'); t = scoreTennisPoint(t, 'A');
check('76a. 3 puan → 40-0', tennisPointDisplay(t).a === '40' && tennisPointDisplay(t).b === '0');
t = scoreTennisPoint(t, 'A');
check('76b. 4. puan → oyun kazanımı (1-0 oyun)', t.aGames === 1 && t.aPoints === 0 && tennisDisplay(t).includes('1-0'));

// Deuce + Avantaj
t = newTennisScore();
for (let i = 0; i < 3; i++) { t = scoreTennisPoint(t, 'A'); t = scoreTennisPoint(t, 'B'); }
check('76c. 3-3 → Deuce', t.deuce === true && tennisPointDisplay(t).a === 'Deuce');
t = scoreTennisPoint(t, 'A');
check('76d. Deuce + A → Avantaj A', t.ad === 'A' && tennisPointDisplay(t).a === 'Avantaj');
t = scoreTennisPoint(t, 'B');
check("76e. Karşı puan → Deuce'ya dönüş", t.ad === null && t.deuce === true);
t = scoreTennisPoint(t, 'A'); t = scoreTennisPoint(t, 'A');
check('76f. Ardışık 2 A → oyun kazanımı', t.aGames === 1);

// ── ADIM 76b: BASKETBOL ────────────────────────────────────────────────────────
let b = newBasketballScore();
b = basketballScored(b, 'home', 3);
b = basketballShotClock(b, 14);
check('76g. Basketbol: +3 sayı, shot clock 14s', b.homePoints === 3 && b.shotClockSec === 14 && b.period === 1);
b = nextBasketballPeriod(b);
check('76h. Sonraki periyot → 2', b.period === 2 && b.shotClockSec === 24);

// ── ADIM 77: SCOUT RAPOR (20-80 skala) ─────────────────────────────────────────
check('77a. Pro hız → 80, yarı hız → 50', scoutGrade('speedKmh', 30) === 80 && scoutGrade('speedKmh', 15) === 50);
check('77b. Tier eşikleri', tierForGrade(80) === 'A' && tierForGrade(60) === 'C');
const metrics: ScoutMetrics = { speedKmh: 24, reactivePower: 2.1, strikeMechanics: 72, staminaIndex: 78, mentalResilience: 66 };
const grades = gradeAll(metrics);
check('77c. 5 metrik, tümü 20-80 aralığında', grades.length === 5 && grades.every((g) => g.grade >= 20 && g.grade <= 80));
const report = buildScoutReport({ athleteName: 'Efe Yılmaz', metrics, notes: 'Çok yönlü; servis geliştirilmeli.' });
check('77d. Rapor: radar 5 eksen + genel + risk', report.radar.length === 5 && report.overall >= 20 && report.overall <= 80 && report.summary.includes('Efe'));
const pdf = reportPdfStructure(report);
check('77e. PDF yapısı: 3 bölüm + başlık + gizli not', pdf.sections.length === 3 && pdf.title.includes('Efe Yılmaz') && pdf.sections[2].heading.includes('Gizli'));

// ── ADIM 78: VİDEO↔BLE SAAT SENKRONİZASYONU ───────────────────────────────────
const offset = computeVideoBleOffset(5000, 1000);
check('78a. Ofset: Δt = 5000 − 1000 = 4000ms', offset === 4000);
check('78b. Video→BLE eşleme', videoToBleTime(5000, offset) === 1000);
const bleFrames: BleTelemetryFrame[] = [{ tMs: 1000, hr: 150 }, { tMs: 2000, gctMs: 200 }, { tMs: 3000, rsi: 1.9 }];
const matched = sliceTelemetryForVideo(bleFrames, 5000, offset);
check('78c. ±10ms eşleşme (delta 0)', matched.matched === true && matched.frame?.tMs === 1000 && matched.deltaMs === 0);
const missed = sliceTelemetryForVideo(bleFrames, 5100, offset);
check('78d. Pencere dışı (100ms) → eşleşme yok', missed.matched === false);
const est = estimateOffsetFromAnchors([5000, 6000], [1000, 2000]);
check('78e. Çoklu anchor kestirimi', est === 4000);

// ── ADIM 79: AĞIR ÇEKİM KARE + AÇI MATEMATİĞİ ────────────────────────────────
check('79a. 30fps kare indeksi (1000ms → 30)', frameIndexAt(1000) === 30);
check('79b. Kare adımı ~33.33ms', Math.abs(stepFrames(0, 1) - 33.33) < 0.01 && stepFrames(1000, 3) === 1100);
check('79c. 0.5× oynatma (500ms → 250ms)', advancePlayback(0, 0.5, 500) === 250);
check('79d. Diz açısı 90°', jointAngle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }) === 90);
check('79e. Doğrusal 180° + çizgi açısı 45°', jointAngle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }) === 180 && lineAngle({ x: 0, y: 0 }, { x: 1, y: 1 }) === 45);
const swing = racketSwingLine({ x: 0, y: 0 }, 0, 10);
check('79f. Savrulma çizgisi ucu (10,0)', swing.end.x === 10 && swing.end.y === 0);

// ── ADIM 80: TURNUV BRAKET ────────────────────────────────────────────────────
check('80a. Boyutlar 4/8/16/32/64', JSON.stringify(BRACKET_SIZES) === JSON.stringify([4, 8, 16, 32, 64]));
check("80b. 8'lik standart ilk tur (1-8, 4-5, 2-7, 3-6)", JSON.stringify(roundOneMatches(8)) === JSON.stringify([[1, 8], [4, 5], [2, 7], [3, 6]]));
check('80c. Seed 1-2 zıt yarıda', seedDistributionOk(8) === true && seedDistributionOk(16) === true);

const br = generateBracket(8, 'single');
check('80d. 3 tur (4-2-1 maç)', br.rounds.length === 3 && br.rounds[0].length === 4 && br.rounds[1].length === 2);
let b2 = registerWinner(br, 'r1m0', 1);
b2 = registerWinner(b2, 'r1m1', 2);
check('80e. Kazananlar yarı finalde eşleşir (1 vs 2)', b2.rounds[1][0].players[0] === 1 && b2.rounds[1][0].players[1] === 2);
b2 = assignCourt(b2, 'r1m2', 'Kort 3');
check('80f. Kort ataması', b2.rounds[0][2].court === 'Kort 3');
b2 = registerWinner(b2, 'r2m0', 1);
b2 = registerWinner(b2, 'r2m1', 4);
b2 = registerWinner(b2, 'r3m0', 1);
check('80g. Final kazananı Seed 1', b2.winner === 1);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

