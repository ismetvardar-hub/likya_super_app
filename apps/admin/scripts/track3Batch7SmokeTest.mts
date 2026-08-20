// ============================================================================
// 🛠️ TRACK 3 — BATCH 7 SMOKE TESTİ (Adım 31-35)
// ACWR (EWMA+Rolling) • Yorgunluk Degradasyonu • Spektral HRV • GRF • Tenis Vuruş
// Çalıştırma: node scripts/track3Batch7SmokeTest.mts
// ============================================================================
import { computeAcwrEwma, computeAcwrRolling, ewmaLoad, classifyAcwrZone, type DailyLoad } from '../src/app/lib/sports/analytics/acwrEngine.ts';
import { assessMechanicalFatigue } from '../src/app/lib/sports/analytics/fatigueCurveEngine.ts';
import { analyzeHrvRecovery, recoveryReadinessScore } from '../src/app/lib/sports/analytics/spectralHrvEngine.ts';
import { approximateVerticalGrf, analyzeGroundReaction, type GrfCalibration } from '../src/app/lib/sports/kinetics/grfApproximationEngine.ts';
import { classifyTennisStroke, sampleTennisStroke, type TennisStrokeKind } from '../src/app/lib/sports/kinetics/tennisStrokeClassifier.ts';
import { computeTimeDomainHrv, computeSpectralHrv } from '../src/app/lib/sports/spectralHrvEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

const day = (i: number, load: number): DailyLoad => ({ date: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`, load });

// ── ADIM 31: ACWR (EWMA + Rolling) ────────────────────────────────────────────
check('31a. ewmaLoad temel hesap (λ=0.5: [10,20] → 15)', ewmaLoad([10, 20], 0.5) === 15);

const balanced = Array.from({ length: 28 }, (_, i) => day(i, 100));
const ewmaOpt = computeAcwrEwma(balanced);
check('31b. EWMA: dengeli yük → ACWR 1.0 optimal', ewmaOpt.acwr === 1 && ewmaOpt.zone === 'optimal' && ewmaOpt.badge === '🟢');

const spike = [...Array.from({ length: 21 }, (_, i) => day(i, 100)), ...Array.from({ length: 7 }, (_, i) => day(i + 21, 300))];
const ewmaSpike = computeAcwrEwma(spike);
check('31c. EWMA: %300 spike → danger + SPIKE ALERT', ewmaSpike.zone === 'danger' && ewmaSpike.spikeAlert === true && ewmaSpike.acwr >= 1.5 && ewmaSpike.advisory.includes('SPIKE'));

const under = [...Array.from({ length: 21 }, (_, i) => day(i, 100)), ...Array.from({ length: 7 }, (_, i) => day(i + 21, 50))];
const ewmaUnder = computeAcwrEwma(under);
check('31d. EWMA: düşük akut → under_training', ewmaUnder.zone === 'under_training' && ewmaUnder.acwr < 0.8);

const roll = computeAcwrRolling([...Array.from({ length: 21 }, (_, i) => day(i, 100)), ...Array.from({ length: 7 }, (_, i) => day(i + 21, 200))]);
check('31e. Rolling: 200/125 → 1.6 danger', roll.method === 'rolling' && roll.acwr === 1.6 && classifyAcwrZone(1.6).zone === 'danger');

// ── ADIM 32: YORGUNLUK DEGRADASYONU ───────────────────────────────────────────
const fatigued = assessMechanicalFatigue({
  gctBaselineMs: 200, gctCurrentMs: 235, rsiBaseline: 2.0, rsiCurrent: 1.5,
  hrBaseline: 120, hrCurrent: 150, powerBaseline: 80, powerCurrent: 75,
}, 10);
check('32a. GCT +%17.5 > %15 → kritik yorgunluk', fatigued.gctDriftPct > 15 && fatigued.level === 'kritik' && fatigued.staminaPct <= 20);
check('32b. RSI -%25 > %20 + dekouple → indeks yüksek', fatigued.rsiDropPct > 20 && fatigued.decouplingDetected === true && fatigued.fatigueIndex >= 85);
check('32c. Decay hızı %/dk', fatigued.decayVelocity === fatigued.fatigueIndex / 10);

const fresh = assessMechanicalFatigue({
  gctBaselineMs: 200, gctCurrentMs: 205, rsiBaseline: 2.0, rsiCurrent: 1.95,
  hrBaseline: 120, hrCurrent: 124, powerBaseline: 80, powerCurrent: 82,
});
check('32d. Sağlıklı seans → taze + yüksek stamina', fresh.level === 'taze' && fresh.fatigueIndex < 25 && fresh.staminaPct > 75);

// ── ADIM 33: SPEKTRAL HRV + HAZIR OLMA SKORU ───────────────────────────────────
const rr = [800, 810, 790, 805, 800];
const td = computeTimeDomainHrv(rr);
const hrv = analyzeHrvRecovery(rr);
check('33a. Zaman ekseni: RMSSD 13.7 / SDNN 6.6', hrv.rmssdMs === 13.7 && hrv.sdnnMs === 6.6);
check('33b. Hazır olma skoru 1-10 aralığında', hrv.readiness >= 1 && hrv.readiness <= 10 && Number.isInteger(hrv.readiness));

// Sağlıklı: yüksek varyans + HF baskın (0.25Hz salınım) → yüksek hazırlık
const healthyRr = Array.from({ length: 90 }, (_, i) => 900 + 90 * Math.sin(2 * Math.PI * 0.25 * i) + ((i * 13) % 20));
const healthy = analyzeHrvRecovery(healthyRr);
check('33c. HF baskın → hazır olma ≥6', healthy.dominantBand === 'HF' && healthy.readiness >= 6);

const lowTd = computeTimeDomainHrv([820, 815, 810, 805, 812, 808, 815, 811]);
const lowSpec = computeSpectralHrv([820, 815, 810, 805, 812, 808, 815, 811]);
check('33d. Düşük varyans → hazır olma ≤5', recoveryReadinessScore(lowTd, lowSpec) <= 5);

// ── ADIM 34: GRF YAKLAŞIMI (Fz ≈ m·g + k·ΔP) ──────────────────────────────────
const cal: GrfCalibration = { kToe: 0.2, kHeel: 0.1, tareToe: 40, tareHeel: 40 };
const fz = approximateVerticalGrf(70, cal, { toePct: 90, heelPct: 60 });
check('34a. Fz = 70·9.81 + 0.2·50 + 0.1·20 ≈ 699N', Math.round(fz) === 699);

const stanceSamples = [
  { tMs: 0, toePct: 40, heelPct: 40 },
  { tMs: 10, toePct: 60, heelPct: 50 },
  { tMs: 20, toePct: 80, heelPct: 55 },
  { tMs: 30, toePct: 95, heelPct: 60 },
  { tMs: 40, toePct: 90, heelPct: 58 },
  { tMs: 50, toePct: 75, heelPct: 52 },
  { tMs: 60, toePct: 60, heelPct: 48 },
  { tMs: 70, toePct: 50, heelPct: 45 },
];
const grf = analyzeGroundReaction({ bodyMassKg: 70, calibration: cal, samples: stanceSamples, timeToImpactMs: 30 });
check('34b. IP≈696N (ilk %35), AP≈700N (aktif faz)', grf.impactPeakN === 696 && grf.activePeakN === 700);
check('34c. Loading rate ≈ 0.3 kN/s', grf.loadingRateKnS === 0.3);
check('34d. GRF çarpanı ~1.02 BW + sonuç kuvvet ≥ dikey', grf.grfMultiplier === 1.02 && grf.resultantN >= grf.verticalGrfN);

// ── ADIM 35: TENİS VURUŞ SINIFLANDIRICISI ─────────────────────────────────────
const kinds: TennisStrokeKind[] = ['ForehandTopspin', 'ForehandFlat', 'Backhand1H', 'Backhand2H', 'Serve', 'OverheadSmash', 'ForehandVolley', 'BackhandVolley'];
let strokeOk = 0;
for (const k of kinds) {
  const r = classifyTennisStroke(sampleTennisStroke(k));
  if (r.label === k && r.confidence > 0.4) strokeOk++;
}
check(`35a. 8 vuruş sınıfı doğru sınıflandırıldı (${strokeOk}/8)`, strokeOk === 8);

const serve = classifyTennisStroke(sampleTennisStroke('Serve'));
check('35b. Serve: kol hızı 178 km/h + güven yüksek', serve.armSwingKmh === 178 && serve.confidence > 0.9);

const topspin = classifyTennisStroke(sampleTennisStroke('ForehandTopspin'));
check('35c. Kinetik zincir skoru 0-100 aralığında', topspin.kineticChainScore >= 0 && topspin.kineticChainScore <= 100);
check('35d. Zincir gecikmesi = raket − ayak (Topspin 55ms)', topspin.chainTimingLagMs === 55);
check('35e. Kanıt dizisi dolu', topspin.evidence.length === 3 && topspin.evidence[1].includes('topuk→önayak'));

const volley = classifyTennisStroke(sampleTennisStroke('ForehandVolley'));
check('35f. Volley: düşük kol hızı + yüksek zincir skoru', volley.armSwingKmh < 70 && volley.label === 'ForehandVolley');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

