// ============================================================================
// 🛠️ TRACK 6 — BATCH 17 SMOKE TESTİ (Adım 81-85) + TRACK 6 BÜTÜNLÜK
// Yayın Görünümü • TID Endeks • Kort Kapsama • Highlight Klipçi • Adım 76-85
// Çalıştırma: node scripts/track6Batch17SmokeTest.mts
// ============================================================================
import { createBroadcastConfig, stageIdentifier, sponsorBanner, telemetryBanner, serializeBroadcastConfig, deserializeBroadcastConfig, broadcastTypography } from '../src/app/lib/broadcast/broadcastDisplayConfig.ts';
import { computeTidScore, maturationScore, tidCeilingForScore, assessTalentId } from '../src/app/lib/scouting/talentIdIndexEngine.ts';
import { zoneForPoint, analyzeCoverage, type PositionSample } from '../src/app/lib/tactics/courtCoverageEngine.ts';
import { clipInterval, evaluateHighlightRules, buildEdl, type HighlightEvent } from '../src/app/lib/video/videoHighlightClipper.ts';
// Track 6 bütünlük (Adım 76-85)
import { newTennisScore, scoreTennisPoint } from '../src/app/lib/match/matchScoreEngine.ts';
import { scoutGrade } from '../src/app/lib/scouting/scoutReportGenerator.ts';
import { computeVideoBleOffset } from '../src/app/lib/video/videoBleSyncEngine.ts';
import { jointAngle } from '../src/app/lib/video/videoPlayerEngine.ts';
import { generateBracket, seedDistributionOk } from '../src/app/lib/tournament/bracketGenerator.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 81: SEYİRCİ YAYIN GÖRÜNÜMÜ ───────────────────────────────────────────
const bc = createBroadcastConfig({ stage: 'Final', court: 'Court 1', sponsor: 'Likya', showTelemetry: true });
check('81a. Aşama+kort etiketi', stageIdentifier(bc) === 'Final · Court 1');
check('81b. Sponsor banner', sponsorBanner(bc) !== null && (sponsorBanner(bc) as string).includes('Likya'));
const tb = telemetryBanner(bc, { serveVelocityKmh: 188, rallyShots: 12, heartZone: 'Zon 4' });
check('81c. Telemetri banner içerik', tb !== null && tb.includes('188 km/h') && tb.includes('12'));
const rt = deserializeBroadcastConfig(serializeBroadcastConfig(bc));
check('81d. Serileştirme yuvarlak geçiş', rt !== null && rt.stage === 'Final' && rt.court === 'Court 1');
check('81e. Büyük ekran tipografi (72px skor)', broadcastTypography('big').scoreFont === 72 && broadcastTypography('compact').scoreFont === 40);
check('81f. Telemetri kapalı → banner yok', telemetryBanner(createBroadcastConfig({ showTelemetry: false }), { serveVelocityKmh: 180, rallyShots: 5, heartZone: 'Zon 2' }) === null);

// ── ADIM 82: TID BİLEŞİK ENDEKS ───────────────────────────────────────────────
check('82a. PHV olgunlaşma skoru', maturationScore(0) === 100 && maturationScore(12) === 62 && maturationScore(24) === 23);
const eliteFactors = { maturationOffsetMonths: 6, reactivePowerVelocity: 1.2, cognitiveReactionMs: 200, brakeEfficiencyPct: 85, injuryResiliencePct: 90 };
const eliteScore = computeTidScore(eliteFactors);
check('82b. Elit TID skoru ≈79 + National tavan', eliteScore === 79 && tidCeilingForScore(eliteScore) === 'National');
check('82c. Tavan kademeleri', tidCeilingForScore(90) === 'Pro Prospect' && tidCeilingForScore(82) === 'International' && tidCeilingForScore(50) === 'Developmental');
const devScore = computeTidScore({ maturationOffsetMonths: 18, reactivePowerVelocity: 0.5, cognitiveReactionMs: 290, brakeEfficiencyPct: 55, injuryResiliencePct: 60 });
check('82d. Gelişen atlet → düşük skor + öneri', devScore < eliteScore && assessTalentId({ ...eliteFactors }).recommendation.includes('TID'));

// ── ADIM 83: KORT POZİSYON KAPSAMA ────────────────────────────────────────────
check('83a. Bölge eşleme (4 taktik bölge)', zoneForPoint(0.5, 0.9) === 'baseline-defense' && zoneForPoint(0.5, 0.45) === 'transition' && zoneForPoint(0.5, 0.1) === 'net-attack' && zoneForPoint(0.05, 0.7) === 'lateral-alley');
const covSamples: PositionSample[] = [
  { x: 0.5, y: 0.9, tMs: 0 },
  { x: 0.5, y: 0.2, tMs: 100 },
  { x: 0.5, y: 0.45, tMs: 200 },
  { x: 0.05, y: 0.7, tMs: 300 },
];
const cov = analyzeCoverage(covSamples);
check('83b. Bölge süre yüzdeleri (4 × %25)', cov.zonePcts['baseline-defense'] === 25 && cov.zonePcts['net-attack'] === 25 && cov.zonePcts['lateral-alley'] === 25);
check('83c. Toplam mesafe ≈30.3m', cov.totalDistanceM === 30.3);
check('83d. L/R yön önyargısı (tam sol)', cov.leftPct === 100 && cov.rightPct === 0 && cov.bias === 'left');

// ── ADIM 84: HIGHLIGHT YER İMİ & KLİPÇİ ───────────────────────────────────────
const ci = clipInterval(10000);
check('84a. Klip aralığı (3s öncesi + 5s sonrası = 8s)', ci.clipStartMs === 7000 && ci.clipEndMs === 15000 && ci.durationSec === 8);
const events: HighlightEvent[] = [
  { tMs: 1000, type: 'serve', value: 180 },
  { tMs: 5000, type: 'cod', value: -6.5 },
  ...Array.from({ length: 12 }, (_, i) => ({ tMs: 10000 + i * 1000, type: 'rally-shot' as const, value: i + 1 })),
];
const bookmarks = evaluateHighlightRules(events);
check('84b. 3 highlight (servis + COD + ralli)', bookmarks.length === 3 && bookmarks.some((b) => b.trigger === 'serve-speed') && bookmarks.some((b) => b.trigger === 'explosive-cod') && bookmarks.some((b) => b.trigger === 'extended-rally'));
check('84c. Klip sınırları geçerli', bookmarks.every((b) => b.clipStartMs < b.tMs && b.clipEndMs > b.tMs && b.durationSec >= 6 && b.durationSec <= 8));
const edl = buildEdl(bookmarks, 'match_1.mp4');
check('84d. EDL yapısı (başlık + dosya + satırlar)', edl.includes('Likya Highlight') && edl.includes('match_1.mp4') && edl.split('\n').length >= 4);

// ── TRACK 6 BÜTÜNLÜK (Adım 76-85) ──────────────────────────────────────────────
let t = newTennisScore();
for (let i = 0; i < 4; i++) t = scoreTennisPoint(t, 'A');
check('76. Tenis oyun kazanımı', t.aGames === 1);
check('77. Scout skala', scoutGrade('speedKmh', 30) === 80);
check('78. Video↔BLE ofset', computeVideoBleOffset(5000, 1000) === 4000);
check('79. Diz açısı 90°', jointAngle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }) === 90);
check('80. Bracket seed dağılım + tur sayısı', seedDistributionOk(8) === true && generateBracket(8).rounds.length === 3);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

