// ============================================================================
// 🧬 SPOR BİLİMİ MOTORU SMOKE TESTİ — 3 eksen + benchmark + export
// Çalıştırma: npx tsx scripts/sportsScienceSmokeTest.mts
// ============================================================================
import { generateLiveSnapshot } from '../src/app/lib/sports/liveTelemetryEngine';
import { computeSportsScienceMetrics, buildBenchmarkComparison, percentileRank, fatigueToPerformanceRatio, exportSessionDataset, sportsScienceStatus, type FatiguePerformancePoint } from '../src/app/lib/sports/sportsScienceEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

const base = generateLiveSnapshot(4);
const m = computeSportsScienceMetrics(base);

// 1) RSI = flight / gct
check(m.rsi === Number((m.flightMs / base.gctMs).toFixed(2)) && m.rsi > 0, 'RSI = uçuş/temas', `RSI ${m.rsi} • flight ${m.flightMs}ms • GCT ${base.gctMs}ms`);
check(m.jumpHeightCm > 0 && m.jumpHeightCm < 50, 'Sıçrama yüksekliği (flight²·g/8)', `${m.jumpHeightCm} cm`);

// 2) Dinamik loading rate + deselerasyon sayacı
check(m.loadingRateKnS === base.loadingRateKnS, 'Dinamik yükleme oranı (dF/dt)', `${m.loadingRateKnS} kN/s`);
check(m.decelerationCount >= 0 && m.decelerationCount <= 3, 'Sert frenleme sayacı (> -3.5 m/s²)', `${m.decelerationCount} adet`);

// 3) Foot strike + propulsion
check(m.footStrike.forefootPct + m.footStrike.midfootPct + m.footStrike.heelPct === 100, 'Ayak vuruş paterni (%100)', `Ön ${m.footStrike.forefootPct} • Orta ${m.footStrike.midfootPct} • Topuk ${m.footStrike.heelPct}`);
check(m.propulsionMs > 80, 'İtiş fazı süresi', `${m.propulsionMs} ms`);

// 4) TRIMP + HRR + HRV
check(m.trimp > 0, 'TRIMP (zon ağırlıklı yük)', `${m.trimp} AU`);
check(m.hrr60Bpm >= 22 && m.hrr60Bpm <= 34, 'HRR 60s toparlanma', `${m.hrr60Bpm} bpm`);
check(m.hrvRmssdMs > 0, 'HRV rMSSD', `${m.hrvRmssdMs} ms`);

// 5) Yüzdelik sıralama (elit benchmark)
const p = percentileRank('RSI', m.rsi);
check(p >= 0 && p <= 100, 'Elit benchmark yüzdelik', `RSI %${p}`);
const bm = buildBenchmarkComparison(m);
check(bm.length === 8 && bm.some((r) => r.status === 'ELITE' || r.status === 'DEVELOPING'), '8 benchmark satırı + durum', bm.slice(0, 3).map((r) => `${r.metric.split(' ')[0]}:${r.status}`).join(' '));

// 6) Yorgunluk/performans oranı
const hist: FatiguePerformancePoint[] = [
  { rsi: 0.9, trimp: 20, timestamp: 1 },
  { rsi: 0.85, trimp: 30, timestamp: 2 },
  { rsi: 0.78, trimp: 45, timestamp: 3 },
  { rsi: 0.7, trimp: 60, timestamp: 4 },
];
const fp = fatigueToPerformanceRatio(hist);
check(fp.trend === 'düşüyor' || fp.trend === 'stabil', 'Yorgunluk/performans oranı', `${fp.ratio} • ${fp.trend} • ${fp.recommendation.slice(0, 30)}`);

// 7) CSV + JSON export
const rows = [m, computeSportsScienceMetrics(generateLiveSnapshot(5))];
const exp = exportSessionDataset(rows);
check(exp.csv.startsWith('timestamp,') && exp.csv.split('\n').length === 3, 'CSV export (header + 2 satır)', `${exp.csv.split('\n').length} satır`);
check(exp.json.includes('"rsi"'), 'JSON export yapısal', `${exp.json.length} karakter`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/14 geçti`);
console.log(sportsScienceStatus());
process.exit(pass === 14 ? 0 : 1);
