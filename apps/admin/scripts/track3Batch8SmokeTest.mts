// ============================================================================
// 🛠️ TRACK 3 — BATCH 8 SMOKE TESTİ (Adım 36-40)
// RSI Tier • Deselerasyon Stresi • Banister TRIMP • AI Drill Reçete • Büyüme Atağı
// Çalıştırma: node scripts/track3Batch8SmokeTest.mts
// ============================================================================
import { classifyRsiTier, rsiAgeGroupForAge, rsiPercentile, assessRsiNormative } from '../src/app/lib/sports/analytics/rsiTierEngine.ts';
import { isBrakingEvent, analyzeDecelerationLoad, type AccelSample } from '../src/app/lib/sports/kinetics/decelerationStressEngine.ts';
import { computeBanisterTrimp } from '../src/app/lib/sports/analytics/trimpEngine.ts';
import { prescribeDrills, buildWorkoutPlan } from '../src/app/lib/sports/drills/aiDrillPrescriptionEngine.ts';
import { getDrill, listDrills, DRILL_VAULT } from '../src/app/lib/sports/drills/drillVaultEngine.ts';
import { assessGrowthSpurt, growthCmPerQuarter, PARENTAL_REASSURANCE } from '../src/app/lib/sports/analytics/growthSpurtAnomalyEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 36: RSI TIER (demografik normlar) ─────────────────────────────────────
check('36a. Tier sınıflandırma (Novice/Dev/Adv/Elite)', classifyRsiTier(1.0) === 'Novice' && classifyRsiTier(1.5) === 'Developing' && classifyRsiTier(2.0) === 'Advanced' && classifyRsiTier(2.6) === 'Elite');
check('36b. Yaş → yaş grubu eşleme', rsiAgeGroupForAge(11) === 'U12' && rsiAgeGroupForAge(14) === 'U14' && rsiAgeGroupForAge(16) === 'U16' && rsiAgeGroupForAge(20) === 'Pro');

const pct = rsiPercentile(2.1, 14, 'M');
check('36c. U14 erkek RSI 2.1 → %75 dilim (p75)', pct === 75);
const elite = assessRsiNormative(3.2, 17, 'M');
check('36d. Pro yüksek RSI 3.2 → elit dilim (%93)', elite.percentile >= 90 && elite.tier === 'Elite' && elite.comparison.includes('Elit'));

// ── ADIM 37: DESELERASYON STRESİ (CDL + diz riski) ─────────────────────────────
check('37a. Fren eşiği (a<-3.0)', isBrakingEvent(-3.5) === true && isBrakingEvent(-2.0) === false);

const decelSamples: AccelSample[] = [
  { tMs: 0, a: -3.5 }, { tMs: 50, a: -4 }, { tMs: 100, a: 1 },
  { tMs: 200, a: -7 }, { tMs: 250, a: -8 }, { tMs: 300, a: 0.5 },
  { tMs: 400, a: -6 }, { tMs: 450, a: -5.5 },
];
const decel = analyzeDecelerationLoad(decelSamples);
check('37b. 3 frenleme olayı + 2 yüksek darbe', decel.eventCount === 3 && decel.highImpactCount === 2);
check('37c. CDL = 0.9 m/s hız kaybı', decel.cdl === 0.9);
check('37d. Yüksek darbe → diz tork riski (orta)', decel.kneeTorqueRisk === true && decel.riskLevel === 'orta');

const highImpact = analyzeDecelerationLoad(
  Array.from({ length: 6 }, (_, i) => [
    { tMs: i * 100, a: -7 },
    { tMs: i * 100 + 50, a: -7.5 },
    { tMs: i * 100 + 80, a: 1 }, // kırıcı örnek (fren değil → olayı böler)
  ]).flat(),
);
check('37e. 5+ yüksek darbe → yüksek risk', highImpact.highImpactCount >= 5 && highImpact.riskLevel === 'yuksek');

// ── ADIM 38: BANISTER TRIMP ────────────────────────────────────────────────────
const male = computeBanisterTrimp({ durationMin: 60, avgHr: 150, restHr: 60, maxHr: 190, sex: 'M' });
check('38a. Erkek TRIMP ≈100 → Maintenance', male.trimp > 95 && male.trimp < 105 && male.category === 'Maintenance');
const female = computeBanisterTrimp({ durationMin: 60, avgHr: 150, restHr: 60, maxHr: 190, sex: 'F' });
check('38b. Kadın katsayısı (y=1.67) daha düşük TRIMP', female.trimp < male.trimp && female.category === 'Maintenance');
const recovery = computeBanisterTrimp({ durationMin: 20, avgHr: 110, restHr: 60, maxHr: 190 });
check('38c. Hafif seans → Recovery (<50)', recovery.category === 'Recovery' && recovery.trimp < 50);
const extreme = computeBanisterTrimp({ durationMin: 90, avgHr: 180, restHr: 60, maxHr: 190 });
check('38d. Yüksek efor → Extreme (>250)', extreme.category === 'Extreme' && extreme.trimp > 250);

// ── ADIM 39: AI DRILL REÇETE (eksik → drill vault eşleştirme) ─────────────────
const weak = prescribeDrills({ gctMs: 260, rsi: 1.5, asymPct: 12, cdl: 15, loadingRateKnS: 3.0, forefootPct: 60, hrvStress: false });
check('39a. Yüksek GCT + düşük RSI → Drop Jumps (KRITIK)', weak.some((p) => p.drill.id === 'drop-jumps' && p.priority === 'KRITIK'));
check('39b. Asimetri >%10 → Unilateral Balance', weak.some((p) => p.drill.id === 'unilateral-balance' && p.deficit.includes('asimetri')));
check('39c. Yüksek CDL → Aktif Toparlanma + Düşük Etkili', weak.some((p) => p.drill.id === 'active-recovery') && weak.some((p) => p.drill.id === 'low-impact-cycle'));

const plan = buildWorkoutPlan({ gctMs: 260, rsi: 1.5, asymPct: 12, cdl: 15, loadingRateKnS: 3.0, forefootPct: 60, hrvStress: false });
check('39d. Seans planı: KRITIK önce + özet var', plan.sessionOrder.length >= 5 && plan.summary.includes('kritik'));
check('39e. Drill Vault bütünlüğü', DRILL_VAULT.length === 8 && getDrill('drop-jumps')?.category === 'plyometric' && listDrills('recovery').length === 2);

const healthy = prescribeDrills({ gctMs: 200, rsi: 2.2, asymPct: 6, cdl: 5, loadingRateKnS: 2.0, forefootPct: 70, hrvStress: false });
check('39f. Sağlıklı metrikler → tek bakım reçetesi', healthy.length === 1 && healthy[0].drill.id === 'hip-mobility');

// ── ADIM 40: BÜYÜME ATAĞI (PHV) ANOMALİ + VELİ GÜVENCESİ ─────────────────────
const g = growthCmPerQuarter([{ measuredAt: '2026-01-01', heightCm: 150 }, { measuredAt: '2026-04-01', heightCm: 152.5 }]);
check('40a. 3 aylık 2.5cm → çeyrek başına 2.5cm (PHV eşiği >2)', g === 2.5 && g > 2);

const anomaly = assessGrowthSpurt({
  heightHistory: [{ measuredAt: '2026-01-01', heightCm: 150 }, { measuredAt: '2026-04-01', heightCm: 152.5 }],
  rsiBaseline: 2.0,
  rsiCurrent: 1.5,
  asymPct: 12,
});
check('40b. PHV + RSI -%25 + asimetri → anomali', anomaly.phvDetected === true && anomaly.anomaly === true && anomaly.status === 'phv_anomali');
check('40c. Veli güvence mesajı tam eşleşir', anomaly.reassurance === PARENTAL_REASSURANCE && anomaly.reassurance.includes('geçici koordinasyon'));

const healthyGrowth = assessGrowthSpurt({
  heightHistory: [{ measuredAt: '2026-01-01', heightCm: 150 }, { measuredAt: '2026-04-01', heightCm: 151.2 }],
  rsiBaseline: 2.0,
  rsiCurrent: 1.95,
  asymPct: 6,
});
check('40d. Normal büyüme + stabil RSI → anomali yok', healthyGrowth.anomaly === false && healthyGrowth.growthCmPerQuarter < 2);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

