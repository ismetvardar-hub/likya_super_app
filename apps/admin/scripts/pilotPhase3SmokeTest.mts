// ============================================================================
// 🚀 PİLOT FAZ 3 SMOKE TESTİ — TRACK 10 UÇTAN UCA (Adım 111-115)
// Çoklu akademi liderlik + gizlilik • yorgunluk tahmini + taktik alarm •
// dijital ikiz interpolasyon/sınırlar • TID havuz PHV normalizasyonu •
// Track 10 bütünlüğü (111-115). Çalıştırma: node scripts/pilotPhase3SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  PILOT_ACADEMIES, percentile, median, computePowerIndex, aggregateAcademy, buildLeaderboard, verifyPrivacyIsolation,
  type AthleteTelemetryProfile,
} from '../src/app/lib/analytics/multiClubLeaderboardEngine.ts';
import {
  computeFatigueScore, forecastFatigue, forecastTFatigueMinutes, generateFatigueAlert, riskLevelFor, FATIGUE_TRIGGER_SCORE,
  type FatigueModelInput,
} from '../src/app/lib/ai/inMatchFatigueAdvisor.ts';
import {
  interpolateFrame, clampFrameIndex, playheadAt, playheadBounds, computeKinematics, frameIndexAt, type TwinFrame,
} from '../src/app/lib/three/digitalTwinReplayEngine.ts';
import {
  rankTalentPool, phvNormalizedReactivePower, projectedHeightCm, tierFor,
  type JuniorProfile,
} from '../src/app/lib/scouting/tidPoolRankingEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 111: ÇOKLU AKADEMİ LİDERLİK + GİZLİLİK ────────────────────────────
check('111a. Yüzdelik/medyan matematiği', median([3, 1, 2]) === 2 && percentile([1, 2, 3], 0) === 1 && percentile([1, 2, 3], 100) === 3);
check('111b. Academy Power Index: RSI80/3.3sn/streak8 → 74', computePowerIndex(80, 3300, 8) === 74);
const leaderProfiles: AthleteTelemetryProfile[] = [
  { athleteId: 'at-a1', academy: 'antalya', rsi: 82, sprintQuicknessMs: 3250, consistencyStreak: 8 },
  { athleteId: 'at-a2', academy: 'antalya', rsi: 76, sprintQuicknessMs: 3400, consistencyStreak: 6 },
  { athleteId: 'at-a3', academy: 'antalya', rsi: 88, sprintQuicknessMs: 3180, consistencyStreak: 9 },
  { athleteId: 'at-a4', academy: 'antalya', rsi: 71, sprintQuicknessMs: 3520, consistencyStreak: 4 },
  { athleteId: 'lr-1', academy: 'lara', rsi: 79, sprintQuicknessMs: 3340, consistencyStreak: 7 },
  { athleteId: 'lr-2', academy: 'lara', rsi: 84, sprintQuicknessMs: 3290, consistencyStreak: 5 },
  { athleteId: 'lr-3', academy: 'lara', rsi: 68, sprintQuicknessMs: 3580, consistencyStreak: 3 },
  { athleteId: 'lr-4', academy: 'lara', rsi: 87, sprintQuicknessMs: 3200, consistencyStreak: 8 },
  { athleteId: 'bk-1', academy: 'belek', rsi: 74, sprintQuicknessMs: 3410, consistencyStreak: 6 },
  { athleteId: 'bk-2', academy: 'belek', rsi: 90, sprintQuicknessMs: 3110, consistencyStreak: 10 },
  { athleteId: 'bk-3', academy: 'belek', rsi: 81, sprintQuicknessMs: 3300, consistencyStreak: 7 },
  { athleteId: 'bk-4', academy: 'belek', rsi: 70, sprintQuicknessMs: 3550, consistencyStreak: 5 },
];
const aggregates = PILOT_ACADEMIES.map((a) => aggregateAcademy(leaderProfiles, a));
check("111c. 3 akademi toplama: 4'er sporcu + anonim bayrağı", aggregates.length === 3 && aggregates.every((a) => a.athleteCount === 4 && a.anonymized === true && a.powerIndex > 0));
const leaderboard = buildLeaderboard(leaderProfiles);
check('111d. Liderlik tablosu: API sıralı + rank + cohortOnly', leaderboard.length === 3 && leaderboard[0].rank === 1 && leaderboard[0].powerIndex >= leaderboard[1].powerIndex && leaderboard.every((r) => r.cohortOnly === true));
const privacy = PILOT_ACADEMIES.every((a) => verifyPrivacyIsolation(leaderProfiles, a).isolated === true);
check('111e. Gizlilik izolasyonu: 3 akademide de sporcu kimliği sızmıyor', privacy === true, PILOT_ACADEMIES.map((a) => verifyPrivacyIsolation(leaderProfiles, a).athleteIdsLeaked.length).join('/'));
// ── ADIM 112: AI YORGUNLUK TAHMİNCİ & TAKTİK DANIŞMAN ──────────────────────
const fatigueInput: FatigueModelInput = { gctBaselineMs: 214, gctCurrentMs: 238, gctElongationVelocityMsPerSet: 3, activeDecelsPerSet: 20, cardioDriftBpm: 12, setMinutesPlayed: 20 };
check('112a. Yorgunluk skoru: GCT15 + desel23.3 + kardiyo10 → 48', computeFatigueScore(fatigueInput) === 48);
const forecast = forecastFatigue(fatigueInput);
const heavier = forecastFatigue({ ...fatigueInput, gctElongationVelocityMsPerSet: 8, activeDecelsPerSet: 40, cardioDriftBpm: 28 });
check('112b. T_fatigue tahmini: daha yüksek yorgunluk → daha az kalan dakika', forecast.tFatigueMinutes >= 0 && heavier.tFatigueMinutes < forecast.tFatigueMinutes && heavier.riskLevel === 'critical');
check('112c. Risk seviyeleri: 20→low · 40→moderate · 60→high · 75→critical', riskLevelFor(20) === 'low' && riskLevelFor(40) === 'moderate' && riskLevelFor(60) === 'high' && riskLevelFor(75) === 'critical');
const alert = generateFatigueAlert(fatigueInput); // gctElong 3 ≥ 2 → tetikler
const calmAlert = generateFatigueAlert({ ...fatigueInput, gctElongationVelocityMsPerSet: 1, activeDecelsPerSet: 10, cardioDriftBpm: 8 });
check('112d. Taktik alarm: tetik eşiği %50 + GCT/desel/kardiyo kuralı', FATIGUE_TRIGGER_SCORE === 50 && alert.triggered === true && calmAlert.triggered === false);
check('112e. Alarm içeriği: "4. oyunda" + "%27" + "reaktif gücü"', alert.alert.includes('4. oyunda') && alert.alert.includes('%27') && alert.alert.includes('reaktif gücü'), alert.alert);

// ── ADIM 113: KİNETİK DİJİTAL İKİZ 3D REPLAY ────────────────────────────────
const twinFrames: TwinFrame[] = [
  { tsMs: 0, insoleLeft: { toePct: 10, heelPct: 50, gctMs: 200 }, insoleRight: { toePct: 12, heelPct: 55, gctMs: 205 }, imu: { x: 0.2, y: 0.1, z: 0 } },
  { tsMs: 10, insoleLeft: { toePct: 20, heelPct: 40, gctMs: 220 }, insoleRight: { toePct: 22, heelPct: 45, gctMs: 225 }, imu: { x: 0.6, y: 0.3, z: 0.1 } },
  { tsMs: 20, insoleLeft: { toePct: 60, heelPct: 30, gctMs: 240 }, insoleRight: { toePct: 65, heelPct: 35, gctMs: 245 }, imu: { x: 1.0, y: 0.5, z: 0.2 } },
];
const mid = interpolateFrame(twinFrames, 5);
check('113a. Lineer interpolasyon: t=5ms → sol toe 15 (10+20 ortası)', mid.insoleLeft.toePct === 15 && mid.insoleRight.toePct === 17);
check('113b. Çerçeve sınırları: negatif→0 · taşma→son · playhead geçerli', clampFrameIndex(-5, 3) === 0 && clampFrameIndex(99, 3) === 2 && playheadAt(3, 1).valid === true && playheadAt(3, 99).valid === false);
check('113c. Zaman çizelgesi: 100Hz → 1000ms = çerçeve 100 + sınır ms', frameIndexAt(1000, 0) === 100 && playheadBounds(3).durationMs === 20);
const stanceKin = computeKinematics(twinFrames[2]); // yüksek yük → duruş
const swingKin = computeKinematics({ tsMs: 30, insoleLeft: { toePct: 5, heelPct: 6, gctMs: 150 }, insoleRight: { toePct: 6, heelPct: 5, gctMs: 150 }, imu: { x: 2.0, y: 2.0, z: 0.3 } }); // düşük yük → sallanma
check('113d. Kinematik: duruş/sallanma fazı + açı aralıkları', stanceKin.phase === 'stance' && swingKin.phase === 'swing' && stanceKin.footStrikeAngleDeg >= 0 && stanceKin.footStrikeAngleDeg <= 45 && stanceKin.kneeFlexionDeg >= 20 && stanceKin.kneeFlexionDeg <= 120 && typeof stanceKin.groundImpactVector.y === 'number');
// ── ADIM 114: TID HAVUZ SIRALAMA & PHV NORMALİZASYONU ───────────────────────
check('114a. PHV normalize: erken olgun cezalandırılır, geç olgun ödüllendirilir', phvNormalizedReactivePower(1.0, 6) === 0.88 && phvNormalizedReactivePower(1.0, -6) === 1.12);
check('114b. Projeksiyon boyu: geç olgunlaşan büyümeyle hesaplanır', projectedHeightCm(160, -6) === 163.6 && projectedHeightCm(160, 6) === 160);
const early = { athleteId: 'early-1', academy: 'Antalya', age: 13, heightCm: 170, weightKg: 56, phvOffsetMonths: 6, reactivePowerVelocity: 1.0, cognitiveReactionMs: 250, brakeEfficiencyPct: 75, injuryResiliencePct: 80 };
const late = { athleteId: 'late-1', academy: 'Lara', age: 13, heightCm: 160, weightKg: 48, phvOffsetMonths: -6, reactivePowerVelocity: 1.0, cognitiveReactionMs: 250, brakeEfficiencyPct: 75, injuryResiliencePct: 80 };
const twoRanked = rankTalentPool([early, late]);
check('114c. Aynı ham veri + farklı PHV → geç olgunlaşan önde (önyargı kaldırıldı)', twoRanked[0].athleteId === 'late-1' && twoRanked[0].tidScore > twoRanked[1].tidScore);
const pool: JuniorProfile[] = [
  { ...early, athleteId: 'p01' },
  { ...late, athleteId: 'p02', reactivePowerVelocity: 1.3, cognitiveReactionMs: 235, brakeEfficiencyPct: 82, injuryResiliencePct: 85, rawUpside: 90 },
  { athleteId: 'p03', academy: 'Belek', age: 12, heightCm: 152, weightKg: 42, phvOffsetMonths: -9, reactivePowerVelocity: 0.95, cognitiveReactionMs: 240, brakeEfficiencyPct: 72, injuryResiliencePct: 78, rawUpside: 88 },
  { athleteId: 'p04', academy: 'Antalya', age: 13, heightCm: 164, weightKg: 50, phvOffsetMonths: -2, reactivePowerVelocity: 1.05, cognitiveReactionMs: 248, brakeEfficiencyPct: 79, injuryResiliencePct: 83, rawUpside: 76 },
  { athleteId: 'p05', academy: 'Lara', age: 14, heightCm: 172, weightKg: 58, phvOffsetMonths: 7, reactivePowerVelocity: 1.15, cognitiveReactionMs: 260, brakeEfficiencyPct: 80, injuryResiliencePct: 81, rawUpside: 72 },
  { athleteId: 'p06', academy: 'Belek', age: 12, heightCm: 149, weightKg: 40, phvOffsetMonths: -10, reactivePowerVelocity: 0.85, cognitiveReactionMs: 245, brakeEfficiencyPct: 68, injuryResiliencePct: 75, rawUpside: 85 },
  { athleteId: 'p07', academy: 'Antalya', age: 13, heightCm: 161, weightKg: 47, phvOffsetMonths: 0, reactivePowerVelocity: 1.0, cognitiveReactionMs: 252, brakeEfficiencyPct: 77, injuryResiliencePct: 80, rawUpside: 70 },
  { athleteId: 'p08', academy: 'Lara', age: 12, heightCm: 155, weightKg: 44, phvOffsetMonths: -5, reactivePowerVelocity: 1.0, cognitiveReactionMs: 238, brakeEfficiencyPct: 74, injuryResiliencePct: 82, rawUpside: 78 },
  { athleteId: 'p09', academy: 'Belek', age: 14, heightCm: 175, weightKg: 62, phvOffsetMonths: 10, reactivePowerVelocity: 1.2, cognitiveReactionMs: 270, brakeEfficiencyPct: 85, injuryResiliencePct: 84, rawUpside: 68 },
  { athleteId: 'p10', academy: 'Antalya', age: 13, heightCm: 158, weightKg: 45, phvOffsetMonths: -4, reactivePowerVelocity: 0.9, cognitiveReactionMs: 242, brakeEfficiencyPct: 71, injuryResiliencePct: 77, rawUpside: 82 },
];
const ranked = rankTalentPool(pool);
const sortedOk = ranked.every((r, i) => i === 0 || ranked[i - 1].tidScore >= r.tidScore);
check('114d. Havuz sıralaması: TID desc + rank/percentile dolgulu', ranked.length === pool.length && sortedOk && ranked[0].rank === 1 && ranked[0].percentile === 100 && ranked[9].rank === 10);
check('114e. Tier kademeleri: top %5 → Elit · ham upside → Upside tier', ranked[0].tier === 'Top 5% Elite National Prospect' && ranked.some((r) => r.tier === 'High Upside Raw Athlete') && ranked.some((r) => r.tier === 'Developmental Tier 1') && ranked.some((r) => r.tier === 'Developmental Tier 2'));

// ── ADIM 115: TRACK 10 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track10Files = [
  'src/app/lib/analytics/multiClubLeaderboardEngine.ts',
  'src/app/lib/ai/inMatchFatigueAdvisor.ts',
  'src/app/lib/three/digitalTwinReplayEngine.ts',
  'src/app/lib/scouting/tidPoolRankingEngine.ts',
  'src/modules/analytics/MultiClubLeaderboard.tsx',
  'src/modules/three/KineticDigitalTwinReplay.tsx',
  'src/modules/scouting/TalentPoolRankerView.tsx',
  'scripts/pilotPhase3SmokeTest.mts',
];
check('115a. Track 10 dosyaları: 4 motor + 3 komponent + smoke mevcut', track10Files.every((f) => existsSync(f)));
const cross = buildLeaderboard(leaderProfiles).length === 3 && rankTalentPool(pool).length === pool.length && forecastFatigue(fatigueInput).tFatigueMinutes >= 0 && interpolateFrame(twinFrames, 10).insoleLeft.gctMs > 0 && computeKinematics(twinFrames[1]).phase.length > 0;
check('115b. Track 10 veri hattı: liderlik + TID + yorgunluk + ikiz uçtan uca çalışıyor', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


