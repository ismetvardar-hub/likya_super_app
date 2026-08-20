// ============================================================================
// 🛠️ TRACK 3 — BATCH 9 SMOKE TESTİ (Adım 41-45) + TRACK 3 BÜTÜNLÜK
// EPOC • Sprint Profil • Pronasyon/Supinasyon • Sözlük • Adım 31-45 doğrulama
// Çalıştırma: node scripts/track3Batch9SmokeTest.mts
// ============================================================================
import { estimateEpoc, assessRecovery, recoveryProfileFor } from '../src/app/lib/sports/analytics/recoveryDurationEngine.ts';
import { computeSprintProfile } from '../src/app/lib/sports/kinetics/sprintProfileEngine.ts';
import { classifyFootPosture, assessPronation, postureTierLabel } from '../src/app/lib/sports/kinetics/pronationSupinationEngine.ts';
import { glossaryFor, listGlossary, SPORTS_SCIENCE_GLOSSARY } from '../src/app/lib/sports/ui/sportsScienceGlossary.ts';
// Track 3 bütünlük (Adım 31-45)
import { computeAcwrEwma } from '../src/app/lib/sports/analytics/acwrEngine.ts';
import { computeBanisterTrimp } from '../src/app/lib/sports/analytics/trimpEngine.ts';
import { classifyRsiTier, rsiAgeGroupForAge } from '../src/app/lib/sports/analytics/rsiTierEngine.ts';
import { isBrakingEvent } from '../src/app/lib/sports/kinetics/decelerationStressEngine.ts';
import { assessMechanicalFatigue } from '../src/app/lib/sports/analytics/fatigueCurveEngine.ts';
import { assessGrowthSpurt } from '../src/app/lib/sports/analytics/growthSpurtAnomalyEngine.ts';
import { approximateVerticalGrf, type GrfCalibration } from '../src/app/lib/sports/kinetics/grfApproximationEngine.ts';
import { classifyTennisStroke, sampleTennisStroke } from '../src/app/lib/sports/kinetics/tennisStrokeClassifier.ts';
import { assessRsiNormative } from '../src/app/lib/sports/analytics/rsiTierEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 41: EPOC & TOPARLANMA SÜRESİ ─────────────────────────────────────────
const light = recoveryProfileFor('light');
const moderate = recoveryProfileFor('moderate');
const extreme = recoveryProfileFor('extreme');
check('41a. EPOC eğrisi: light < moderate < extreme', light.epocMlKg < moderate.epocMlKg && moderate.epocMlKg < extreme.epocMlKg);
check('41b. Işık seans → 24h pencere + hazır', light.restWindow === '24h' && light.nextDayReadiness === 'hazir');
check('41c. Orta seans → 48h pencere', moderate.restWindow === '48h' && moderate.nextDayReadiness === 'kismen');
check('41d. Aşırı seans → 72h + toparlanma gerekli', extreme.restWindow === '72h' && extreme.nextDayReadiness === 'toparlanma_gerekli');
check('41e. EPOC formülü α·TRIMP·(HRm/HRmax)² (orta: 31.2)', estimateEpoc({ trimp: 100, hrMean: 150, hrMax: 190 }) === 31.2);

// ── ADIM 42: SPRINT PROFİLİ (0-5m / 5-10m) ────────────────────────────────────
const spr = computeSprintProfile({ splits: [{ distanceM: 5, timeS: 1.0 }, { distanceM: 10, timeS: 1.9 }], bodyMassKg: 70 });
check('42a. Split süreleri: 0-5m 1.0s, 5-10m 0.9s', spr.split05 === 1.0 && spr.split510 === 0.9);
check('42b. Hızlar: v05=5.0, v510=5.56 m/s', spr.v05 === 5.0 && spr.v510 === 5.56);
check('42c. F-V eğimi S_fv = F0/v0 = 62.9 kg/s', spr.fvSlope === 62.9 && spr.f0N === 350);
check('42d. Plato tespiti (hız kazanımı %0)', computeSprintProfile({ splits: [{ distanceM: 5, timeS: 1.0 }, { distanceM: 10, timeS: 2.0 }] }).plateauDetected === true);
const sprAccel = computeSprintProfile({ splits: [{ distanceM: 5, timeS: 1.0 }, { distanceM: 10, timeS: 1.9 }], accelSamplesMps2: [3, 5.5, 7.2, 6] });
check('42e. Tepe ivme a_max=7.2 m/s²', sprAccel.peakAccelMps2 === 7.2);

// ── ADIM 43: PRONASYON / SUPİNASYON ───────────────────────────────────────────
check('43a. 5 kademe eşleme', classifyFootPosture(-12) === 'SevereOverpronation' && classifyFootPosture(-7) === 'MildPronation' && classifyFootPosture(0) === 'Neutral' && classifyFootPosture(7) === 'MildSupination' && classifyFootPosture(12) === 'SevereSupination');
const pron = assessPronation({ rollAngleDeg: -7, medialPressurePct: 55, lateralPressurePct: 45 });
check('43b. Hafif pronasyon + basınç farkı %10', pron.posture === 'MildPronation' && pron.pressureBiasPct === 10);
check('43c. Sade dil içgörü + ayakkabı önerisi', pron.insight.length > 10 && pron.recommendation.includes('ayakkabı'));
check('43d. Tier etiketi', postureTierLabel('SevereSupination') === 'Şiddetli Supinasyon');

// ── ADIM 44: SÖZLÜK ───────────────────────────────────────────────────────────
check('44a. Zorunlu terimler mevcut (RSI/GCT/TRIMP/ACWR/EPOC/GRF/CDL/Pronation)', ['RSI', 'GCT', 'TRIMP', 'ACWR', 'EPOC', 'GRF', 'CDL', 'Pronation'].every((t) => glossaryFor(t) !== undefined));
check('44b. Sade dil veli notu', glossaryFor('RSI')?.forAudience === 'parent' && (glossaryFor('GCT')?.plainLanguage.length ?? 0) > 30);
check('44c. Sözlük boyutu + filtre', SPORTS_SCIENCE_GLOSSARY.length === 10 && listGlossary('parent').length >= 8);

// ── TRACK 3 BÜTÜNLÜK (Adım 31-45) ──────────────────────────────────────────────
// Adım 31: ACWR
const acwrOpt = computeAcwrEwma(Array.from({ length: 28 }, (_, i) => ({ date: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`, load: 100 })));
check('31. ACWR EWMA dengeli → optimal', acwrOpt.zone === 'optimal');
// Adım 32: Yorgunluk
const freshFatigue = assessMechanicalFatigue({ gctBaselineMs: 200, gctCurrentMs: 205, rsiBaseline: 2.0, rsiCurrent: 1.95, hrBaseline: 120, hrCurrent: 124, powerBaseline: 80, powerCurrent: 82 });
check('32. Yorgunluk sağlıklı → taze', freshFatigue.level === 'taze');
// Adım 33: Spektral HRV hazırlığı
// Adım 34: GRF yaklaşımı
const grfCal: GrfCalibration = { kToe: 0.2, kHeel: 0.1, tareToe: 40, tareHeel: 40 };
check('34. GRF Fz ≈ 699N', Math.round(approximateVerticalGrf(70, grfCal, { toePct: 90, heelPct: 60 })) === 699);
// Adım 35: Tenis vuruş
check('35. Serve sınıflandırma', classifyTennisStroke(sampleTennisStroke('Serve')).label === 'Serve');
// Adım 36: RSI tier
check('36. RSI Advanced + Pro yüzdelik', classifyRsiTier(2.0) === 'Advanced' && assessRsiNormative(2.2, 20, 'M').ageGroup === 'Pro');
// Adım 37: Deselerasyon
check('37. Fren eşiği a<-3.0', isBrakingEvent(-3.5) === true);
// Adım 38: TRIMP
const trimpM = computeBanisterTrimp({ durationMin: 60, avgHr: 150, restHr: 60, maxHr: 190, sex: 'M' });
check('38. TRIMP erkek ≈100 Maintenance', trimpM.category === 'Maintenance' && trimpM.trimp > 95 && trimpM.trimp < 105);
// Adım 39: AI reçete
// Adım 40: Büyüme atağı
const gs = assessGrowthSpurt({ heightHistory: [{ measuredAt: '2026-01-01', heightCm: 150 }, { measuredAt: '2026-04-01', heightCm: 152.5 }], rsiBaseline: 2.0, rsiCurrent: 1.5, asymPct: 12 });
check('40. PHV anomali + güvence', gs.anomaly === true && gs.reassurance.includes('geçici koordinasyon'));
// Adım 41-44 bu dosyada yukarıda doğrulandı
check('42. Sprint F-V + split doğru', spr.fvSlope > 0 && spr.split05 > 0 && spr.split510 > 0);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

