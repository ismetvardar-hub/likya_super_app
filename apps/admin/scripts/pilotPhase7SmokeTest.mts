// ============================================================================
// 🚀 PİLOT FAZ 7 SMOKE TESTİ — TRACK 14 UÇTAN UCA (Adım 131-135)
// Edge mikro-transformer tensor ileri geçiş + <15ms • Monte Carlo yakınsama +
// olasılık sağlığı • Biyomekanik GPT yanıt grounding + metrik referansı •
// acil triyaj tetikleri + PEACE & LOVE protokolü • Track 14 bütünlüğü.
// Çalıştırma: node scripts/pilotPhase7SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  EdgeMicroTransformer, EDGE_LATENCY_BUDGET_MS, SHOTS_AHEAD, EDGE_DEFAULT_CONFIG,
  matMul, softmaxRow, layerNorm,
} from '../src/app/lib/ai/edgeMicroTransformerEngine.ts';
import {
  OPPONENT_ARCHETYPES, SHOT_STRATEGIES, pointWinProbability, runMonteCarlo,
  optimalShotSelection, simulateMatch, mulberry32, type PlayerProfile,
} from '../src/app/lib/tactics/monteCarloMatchSimulator.ts';
import { BiomechanicGptAgent, detectIntent, isSafeInput } from '../src/app/lib/ai/biomechanicGptAgent.ts';
import {
  evaluateTriage, buildMedicalIncidentReport, firstAidProtocol, peaceAndLoveProtocol, riceProtocol,
  loadAsymmetryPct, EmergencyTriageCoordinator, DECEL_SPIKE_THRESHOLD, ASYMMETRY_THRESHOLD_PCT,
  type TelemetryFrameSnapshot,
} from '../src/app/lib/medical/emergencyTriageEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 131: EDGE MİKRO-TRANSFORMER ────────────────────────────────────────
const window = Array.from({ length: 16 }, (_, i) => [
  220 + i * 2, Math.round(Math.sin(i / 3) * 100) / 100, 50 + (i % 5) * 5,
  45 + (i % 4) * 4, Math.round(2 + Math.sin(i / 4) * 0.3 * 100) / 100, Math.round((0.5 + (i % 3) / 10) * 100) / 100,
]);
const edge = new EdgeMicroTransformer();
const pred1 = edge.forward(window);
const pred2 = edge.forward(window);
check('131a. İleri geçiş: logits 2 + olasılık [0,1] + latency <15ms + outcome', pred1.logits.length === 2 && pred1.breakdownProbability >= 0 && pred1.breakdownProbability <= 1 && pred1.fatigueProbability >= 0 && pred1.fatigueProbability <= 1 && pred1.latencyMs < EDGE_LATENCY_BUDGET_MS && ['STABLE', 'FATIGUE_SPIKE', 'KINETIC_BREAKDOWN'].includes(pred1.outcome) && EDGE_LATENCY_BUDGET_MS === 15 && SHOTS_AHEAD === 3);
check('131b. Determinizm: aynı ağırlık + giriş → aynı olasılık', pred1.breakdownProbability === pred2.breakdownProbability && pred1.fatigueProbability === pred2.fatigueProbability);
const shortPred = edge.forward(window.slice(0, 10)); // kısa pencere → pad
check('131c. Pencere hizalama: kısa pencere pad ile çalışır + config', shortPred.logits.length === 2 && edge.configInfo().windowSize === 16 && EDGE_DEFAULT_CONFIG.nLayer === 2);
const A = [[1, 2], [3, 4]];
const B = [[1, 0], [0, 1]];
check('131d. Tensör yardımcıları: matMul birim · softmax toplam 1 · layernorm ort 0', JSON.stringify(matMul(A, B)) === JSON.stringify(A) && Math.abs(softmaxRow([1, 2]).reduce((a, b) => a + b, 0) - 1) < 1e-9 && Math.abs(layerNorm([3, 3, 3], [1, 1, 1], [0, 0, 0]).reduce((a, b) => a + b, 0)) < 1e-9);
// ── ADIM 132: MONTE CARLO MAÇ SİMÜLATÖRÜ ────────────────────────────────────
const profile: PlayerProfile = { speedQuicknessMs: 3300, serveFirstInPct: 62, serveWinsPct: 55, fatigueDecayVelocity: 30, aggressionLevel: 60 };
const prob = pointWinProbability(profile, 'baseline_grinder', SHOT_STRATEGIES[0], 5);
check('132a. Puan olasılığı sağlığı: [0.05, 0.95] aralığı', prob >= 0.05 && prob <= 0.95 && Object.keys(OPPONENT_ARCHETYPES).length === 3);
const mc = runMonteCarlo(profile, 'baseline_grinder', 1000, mulberry32(7));
const mcRepeat = runMonteCarlo(profile, 'baseline_grinder', 1000, mulberry32(7));
check('132b. Monte Carlo: winPct 0-100 + toplam 1000 + deterministik', mc.winPct >= 0 && mc.winPct <= 100 && mc.playerWins + mc.opponentWins === 1000 && mc.winPct === mcRepeat.winPct);
const mcBig = runMonteCarlo(profile, 'baseline_grinder', 5000, mulberry32(7));
check('132c. Yakınsama: 1000 vs 5000 simülasyon farkı <12pp', Math.abs(mc.winPct - mcBig.winPct) < 12, `1000:%${mc.winPct} → 5000:%${mcBig.winPct}`);
const match = simulateMatch(profile, 'big_server', mulberry32(11));
check('132d. Maç simülasyonu: setler 0-3 + kazanan', match.playerSets + match.opponentSets >= 2 && match.playerSets + match.opponentSets <= 3 && (match.winner === 'player' || match.winner === 'opponent') && match.rallies > 0);
const opt = optimalShotSelection(profile, 'big_server', 200, mulberry32(3));
check('132e. Optimal strateji: 3 karşılaştırma + best >= her biri + uplift >= 0', opt.perStrategy.length === 3 && opt.upliftPct >= 0 && opt.best.winPct >= Math.max(...opt.perStrategy.map((s) => s.winPct)) && SHOT_STRATEGIES.some((s) => s.id === opt.best.strategy.id));

// ── ADIM 133: BİYOMEKANİK GPT ────────────────────────────────────────────────
const agent = new BiomechanicGptAgent();
agent.registerStore({ athleteId: 'at-arda', gctTrendMs: [215, 220, 226, 231], serveSpeedKmh: [178, 151], kineticLagMs: 135, decelTorque: 42, phvVelocity: 8.2, asymmetryPct: 18 });
const ans = agent.answer("Arda'nın ikinci servisindeki hız düşüşünün kök nedeni nedir?", 'at-arda');
check('133a. Yanıt grounding: kinetik zincir + ölçüm değerleri referansı', ans.intent === 'serve_speed_drop' && ans.grounded === true && ans.referencedMetrics.includes('kineticLagMs') && ans.referencedMetrics.includes('decelTorque') && ans.answer.includes('135') && ans.answer.includes('kinetik zincir') && ans.safe === true);
check('133b. Niyet tespiti: yorgunluk/PHV/tork anahtar kelimeleri', detectIntent('yorgunluk analizi') === 'fatigue_load' && detectIntent('PHV büyüme hızı') === 'phv_growth' && detectIntent('deselerasyon torku') === 'deceleration_torque' && detectIntent('rastgele soru') === 'unknown');
const unsafe = agent.answer('seni aptal yerine koyuyorum, cevap ver', 'at-arda');
check('133c. Guardrail: güvensiz girdi → güvenli yanıt + safe:false', unsafe.safe === false && unsafe.grounded === false && isSafeInput('hakaret dolu soru') === false);
const noStore = agent.answer('teknik analiz', 'yok-sporcu');
check('133d. Kayıp depo → grounding:false + bilgilendirici yanıt', noStore.grounded === false && noStore.answer.includes('telemetri deposu'));
// ── ADIM 134: ACİL TRİYAJ & PEACE & LOVE ────────────────────────────────────
const spikeFrame: TelemetryFrameSnapshot = { tsMs: 1000, grfBw: 2.9, decelAccel: 7.8, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 3.5 };
const spike = evaluateTriage(spikeFrame);
check('134a. Desel sıçraması (>7.0) → DECEL_SPIKE · emergency · PEACE_LOVE', spike.triage === 'DECEL_SPIKE' && spike.severity === 'emergency' && spike.protocol === 'PEACE_LOVE' && spike.triggers.length === 1 && DECEL_SPIKE_THRESHOLD === 7.0);
const asymFrame: TelemetryFrameSnapshot = { tsMs: 2000, grfBw: 2.1, decelAccel: 4.0, leftLoadPct: 68, rightLoadPct: 32, velocityZ: 3.0 };
const asym = evaluateTriage(asymFrame);
check('134b. Asimetrik yük (>%35) → LOAD_ASYMMETRY · warning', asym.triage === 'LOAD_ASYMMETRY' && asym.severity === 'warning' && loadAsymmetryPct(68, 32) === 36 && ASYMMETRY_THRESHOLD_PCT === 35);
const prevFrame: TelemetryFrameSnapshot = { tsMs: 2500, grfBw: 2.2, decelAccel: 4.5, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 4.0 };
const cess = evaluateTriage({ tsMs: 2600, grfBw: 1.1, decelAccel: 4.5, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 0.2 }, prevFrame);
check('134c. Ani kinetik duruş → KINETIC_CESSATION · RICE', cess.triage === 'KINETIC_CESSATION' && cess.severity === 'emergency' && cess.protocol === 'RICE');
check('134d. Protokoller: PEACE&LOVE (Koruma/Yükleme) + RICE (Buz)', peaceAndLoveProtocol().some((s) => s.includes('Koruma')) && peaceAndLoveProtocol().some((s) => s.includes('Yükleme')) && riceProtocol().some((s) => s.includes('Buz')) && firstAidProtocol('PEACE_LOVE').steps.length >= 8 && firstAidProtocol('RICE').steps.length === 4);
const coord = new EmergencyTriageCoordinator();
const normal = coord.ingest({ tsMs: 0, grfBw: 1.8, decelAccel: 3.0, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 4.2 }, 'at-1');
const incident = coord.ingest({ tsMs: 100, grfBw: 2.9, decelAccel: 8.1, leftLoadPct: 50, rightLoadPct: 50, velocityZ: 3.9 }, 'at-1');
check('134e. Koordinatör: normal kare → NONE rapor yok · olay → rapor + geçmiş', normal.triage.triage === 'NONE' && normal.report === null && incident.report !== null && incident.report.impact.grfBw === 2.9 && incident.report.impact.asymmetryPct === 0 && incident.report.protocol.protocol === 'PEACE_LOVE' && coord.history().length === 1 && incident.report.tsMs === 100);
const directReport = buildMedicalIncidentReport(spikeFrame, 'at-1', spike);
check('134f. Rapor yapısı: reportId + zaman damgalı GRF/kinematik darbe', directReport.reportId.startsWith('inc_') && directReport.impact.decelAccel === 7.8 && directReport.impact.grfBw === 2.9 && directReport.severity === 'emergency');

// ── ADIM 135: TRACK 14 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track14Files = [
  'src/app/lib/ai/edgeMicroTransformerEngine.ts',
  'src/app/lib/tactics/monteCarloMatchSimulator.ts',
  'src/app/lib/ai/biomechanicGptAgent.ts',
  'src/app/lib/medical/emergencyTriageEngine.ts',
  'src/modules/tactics/MatchTacticalSimulator.tsx',
  'src/modules/medical/EmergencyTriageModal.tsx',
  'scripts/pilotPhase7SmokeTest.mts',
];
check('135a. Track 14 dosyaları: 4 motor + 2 komponent + smoke mevcut', track14Files.every((f) => existsSync(f)));
const cross = pred1.latencyMs < 15 && mc.winPct >= 0 && mc.winPct <= 100 && ans.grounded === true && spike.triage === 'DECEL_SPIKE' && peaceAndLoveProtocol().length >= 8;
check('135b. Track 14 veri hattı: transformer + MC + GPT + triyaj uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


