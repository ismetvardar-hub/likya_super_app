// ============================================================================
// 🖥️ CANLI TELEMETRİ & KIYAS MOTORU SMOKE TESTİ
// Çalıştırma: npx tsx scripts/telemetrySmokeTest.mts
// ============================================================================
import { generateLiveSnapshot, buildComparisonRows, buildTimeSeries, dashboardSummary, liveTelemetryStatus } from '../src/app/lib/sports/liveTelemetryEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Canlı anlık değerler
const snap = generateLiveSnapshot(3);
check(snap.heartRate > 150 && snap.gctMs > 150 && snap.forefootPct > snap.heelPct, 'Anlık telemetri üretildi', `${snap.heartRate} bpm • GCT ${snap.gctMs}ms • %${snap.forefootPct} ön ayak`);

// 2) Kıyas satırları — 5 metrik + durum
const rows = buildComparisonRows(snap);
check(rows.length === 5 && rows.some((r) => r.status === 'ok'), '5 metrik referans kıyası', rows.map((r) => `${r.metric.split(' ')[0]}:${r.badge}`).join(' '));

// 3) Anlam/metrik detayı
check(rows.every((r) => r.meaning.length > 5), 'Kıyas anlamları üretildi', rows[0].meaning.slice(0, 40));

// 4) Zaman serisi
let hist: Parameters<typeof buildTimeSeries>[1] = [];
for (let i = 0; i < 16; i++) hist = buildTimeSeries(generateLiveSnapshot(i), hist);
check(hist.length === 14, 'Zaman serisi 14 noktaya sınırlı', `${hist.length} nokta`);

// 5) Durum özeti
const sum = dashboardSummary(snap);
check(sum.status === 'ok' || sum.status === 'warn', 'Panel durum rozeti', sum.text);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/5 geçti`);
console.log(liveTelemetryStatus());
process.exit(pass === 5 ? 0 : 1);
