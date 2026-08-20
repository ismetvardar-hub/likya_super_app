// ============================================================================
// TRACK 3 DOĞRULAMA TESTİ — ACWR • exp-TRIMP • Yorgunluk • EPOC • HRV • GRF
// RSI Tier • Sprint Profil • AI Koç Önerisi • Büyüme Atağı (Adım 31-45)
// Çalıştırma: node sportScienceBatch.test.mts
// ============================================================================
import { computeAcwr, trimpExponential, acwrLoadStatus } from './src/app/lib/sports/acwrLoadEngine.ts';
import { buildFatigueCurve, estimateEpoc } from './src/app/lib/sports/fatigueRecoveryEngine.ts';
import { computeTimeDomainHrv, computeSpectralHrv } from './src/app/lib/sports/spectralHrvEngine.ts';
import { analyzeGrfVector, computeGrfAsymmetry } from './src/app/lib/sports/grfVectorEngine.ts';
import { assessRsiTiered, sprintAccelerationProfile, ageGroupForAge } from './src/app/lib/sports/developmentProfileEngine.ts';
import { recommendDrills, detectGrowthSpurtAnomaly } from './src/app/lib/sports/aiCoachAdvisorEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// ── ADIM 31: ACWR ────────────────────────────────────────────────────────────
const optimalLoads = Array.from({ length: 28 }, (_, i) => ({ date: `2026-0${i < 10 ? '7' : '8'}-${String((i % 10) + 1).padStart(2, '0')}`, load: 100 }));
const acwrOpt = computeAcwr(optimalLoads);
check('ACWR: dengeli yük → optimal bölge', acwrOpt.zone === 'optimal' && acwrOpt.ratio >= 0.8 && acwrOpt.ratio <= 1.3);

const redLoads = [...Array.from({ length: 21 }, () => ({ date: '2026-07-01', load: 100 })), ...Array.from({ length: 7 }, () => ({ date: '2026-08-01', load: 200 }))];
const acwrRed = computeAcwr(redLoads);
check('ACWR: ani yük artışı → kırmızı bölge', acwrRed.zone === 'kirmizi' && acwrRed.ratio > 1.5);

// ── ADIM 38: exp-TRIMP ───────────────────────────────────────────────────────
const trimpM = trimpExponential({ durationMin: 60, avgHr: 150, restHr: 60, maxHr: 190, sex: 'M' });
const trimpF = trimpExponential({ durationMin: 60, avgHr: 150, restHr: 60, maxHr: 190, sex: 'F' });
check('exp-TRIMP: erkek katsayısı (b=1.92) kadından yüksek', trimpM.trimp > trimpF.trimp && trimpM.trimp > 120);
check('exp-TRIMP: ΔHR oranı aralıkta (0-1)', trimpM.deltaHrRatio > 0.6 && trimpM.deltaHrRatio < 0.8);

// ── ADIM 32: Yorgunluk Eğrisi ────────────────────────────────────────────────
const curveLow = buildFatigueCurve(60, 'low');
const curveHigh = buildFatigueCurve(60, 'high');
const lastLow = curveLow[curveLow.length - 1];
const lastHigh = curveHigh[curveHigh.length - 1];
check('Yorgunluk: yüksek yoğunluk daha hızlı tükenir', lastHigh.fatigueIndex > lastLow.fatigueIndex && lastHigh.glycogenPct < lastLow.glycogenPct);
check('Yorgunluk: bitiş indeksi yüksek yoğunlukta >60', lastHigh.fatigueIndex > 60 && curveHigh.length > 10);

// ── ADIM 41: EPOC ────────────────────────────────────────────────────────────
const epocHigh = estimateEpoc({ avgHr: 165, restHr: 60, maxHr: 190, durationMin: 60 });
const epocLow = estimateEpoc({ avgHr: 120, restHr: 60, maxHr: 190, durationMin: 60 });
check('EPOC: yüksek efor → daha uzun toparlanma', epocHigh.epocMlKg > epocLow.epocMlKg && epocHigh.recoveryHours > epocLow.recoveryHours);
check('EPOC: yoğun seans >4 saat toparlanma önerir', epocHigh.recoveryHours >= 4);

// ── ADIM 33: Spektral HRV ─────────────────────────────────────────────────────
const td = computeTimeDomainHrv([800, 810, 790, 805, 800]);
check('HRV zaman ekseni: SDNN/rMSSD hesaplanır', td.sdnnMs === 6.6 && td.rmssdMs === 13.7 && td.meanRrMs === 801);

// 0.25 Hz'lik RR salınımı (HF bandı) → HF baskın olmalı
const hfSignal = Array.from({ length: 60 }, (_, i) => 1000 + 50 * Math.sin(2 * Math.PI * 0.25 * i));
const spec = computeSpectralHrv(hfSignal);
check('HRV spektral: 0.25Hz sinyal → HF > LF', spec.hfMs2 > spec.lfMs2 && spec.dominantBand === 'HF');
check('HRV spektral: sayılar sonlu', Number.isFinite(spec.lfHfRatio) && spec.totalPowerMs2 > 0);

// ── ADIM 34: GRF Vektör ──────────────────────────────────────────────────────
const grf = analyzeGrfVector({ bodyMassKg: 70, accelX: 0.5, accelY: 1, accelZ: 2 });
check('GRF: dikey kuvvet F=m(g+a)', grf.verticalGrfN === 827 && grf.grfMultiplier === 1.2);
check('GRF: vektör açısı dikeye yakın (küçük sapma)', grf.vectorAngleDeg > 4 && grf.vectorAngleDeg < 7 && grf.totalMagnitudeN > grf.verticalGrfN);

const asym = computeGrfAsymmetry(1200, 900);
check('GRF asimetri: %25 → uyarı + dominant sol', asym.asymPct === 25 && asym.dominantSide === 'L' && asym.advisory.includes('Asimetri'));

// ── ADIM 36: RSI Tier ─────────────────────────────────────────────────────────
check('RSI tier: yaş eşleme', ageGroupForAge(16) === 'U15' && ageGroupForAge(9) === 'U9' && ageGroupForAge(21) === 'Yetiskin');
const tierAssess = assessRsiTiered(0.9, 17, 'M');
check('RSI tier: U17 erkek 0.9 → IYI bant', tierAssess.band === 'IYI' && tierAssess.percentile >= 60 && tierAssess.percentile <= 85);

// ── ADIM 42: Sprint Profil ────────────────────────────────────────────────────
const spr = sprintAccelerationProfile([{ distanceM: 5, timeS: 1.0 }, { distanceM: 10, timeS: 1.9 }]);
check('Sprint: 5-10m ivmelenme pozitif, plato yok', spr.plateauDetected === false && spr.accel5to10 > 0 && spr.topSpeedKmh === 20);
const plate = sprintAccelerationProfile([{ distanceM: 5, timeS: 1.0 }, { distanceM: 10, timeS: 2.0 }]);
check('Sprint: hız kazanımı %0 → plato tespiti', plate.plateauDetected === true);

// ── ADIM 39: AI Koç Önerisi ───────────────────────────────────────────────────
const drills = recommendDrills({ rsi: 0.5, gctMs: 260, loadingRateKnS: 3.2, forefootPct: 50, trimp: 150, asymPct: 20, angularLoadPct: 40, hrvStress: true });
check('Koç önerisi: 8 zayıf bölge → 8 reçete', drills.length === 8 && drills.some((d) => d.priority === 'KRITIK'));
check('Koç önerisi: RSI reçetesi öncelikli', drills.some((d) => d.focus === 'Reaktif güç (RSI)' && d.priority === 'KRITIK'));
const healthy = recommendDrills({ rsi: 0.95, gctMs: 190, loadingRateKnS: 2.2, forefootPct: 70, trimp: 80, asymPct: 8, angularLoadPct: 20, hrvStress: false });
check('Koç önerisi: sağlıklı metrikler → bakım reçetesi', healthy.length === 1 && healthy[0].focus === 'Bakım');

// ── ADIM 40: Büyüme Atağı Anomali ────────────────────────────────────────────
const growth = detectGrowthSpurtAnomaly([
  { measuredAt: '2026-01-01', heightCm: 150, weightKg: 40, gctMs: 180, loadingRateKnS: 2.0 },
  { measuredAt: '2026-04-01', heightCm: 152.5, weightKg: 42, gctMs: 205, loadingRateKnS: 2.6 },
]);
check('Büyüme atağı: PHV + GCT kayması → anomali', growth.phvDetected === true && growth.anomaly === true);
const steady = detectGrowthSpurtAnomaly([
  { measuredAt: '2026-01-01', heightCm: 170, weightKg: 60, gctMs: 190, loadingRateKnS: 2.1 },
  { measuredAt: '2026-04-01', heightCm: 170.6, weightKg: 61, gctMs: 192, loadingRateKnS: 2.1 },
]);
check('Büyüme atağı: normal büyüme → anomali yok', steady.phvDetected === false && steady.anomaly === false);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

