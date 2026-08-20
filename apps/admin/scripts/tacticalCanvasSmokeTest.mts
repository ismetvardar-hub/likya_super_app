// ============================================================================
// 🎨 TAKTİK CANVAS & OTONOM WORKFLOW SMOKE TESTİ
// Anomali tespiti • node/edge grafiği • 4 adımlı sezon raporu zinciri
// Çalıştırma: npx tsx scripts/tacticalCanvasSmokeTest.mts
// ============================================================================
import { detectAnomalies, buildTacticalGraph, buildSeasonWorkflow, tacticalCanvasStatus, type AthleteVitals } from '../src/app/lib/sports/tacticalCanvasEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Anomali tespiti — vitallerden
const vitals: AthleteVitals = { athlete: 'Arda G.', gctMs: 208, rsi: 1.4, hr: 172, heelPct: 56, loadingKnS: 2.6 };
const anomalies = detectAnomalies(vitals);
check(anomalies.length === 4, '4 anomali tespiti (GCT/RSI/topuk/darbe)', anomalies.map((a) => a.anomaly).join(', '));
check(anomalies.some((a) => a.severity === 'high'), 'Yüksek öncelik anomali', anomalies.find((a) => a.severity === 'high')?.anomaly ?? '');
check(anomalies.every((a) => a.drill.length > 5), 'Her anomaliye düzeltici drill', anomalies[0].drill);

// 2) Temiz vitaller → anomali yok
const clean = detectAnomalies({ athlete: 'Mert', gctMs: 182, rsi: 2.1, hr: 158, heelPct: 22, loadingKnS: 1.8 });
check(clean.length === 0, 'Temiz vitaller → sıfır anomali', '');

// 3) Node/edge grafiği
const graph = buildTacticalGraph(vitals);
check(graph.nodes.length === 1 + anomalies.length * 2, 'Node sayısı (athlete + insight + drill)', `${graph.nodes.length} node`);
check(graph.edges.length === anomalies.length * 2, 'Edge sayısı (anomali→insight→drill)', `${graph.edges.length} edge`);
check(graph.nodes.some((n) => n.kind === 'athlete' && n.emoji === '🏃'), 'Athlete node', graph.nodes[0].title);
check(graph.nodes.some((n) => n.kind === 'insight' && n.emoji === '🚨'), 'Insight node (yüksek öncelik)', '');

// 4) Otonom sezon raporu — 4 adım zinciri
const wf = buildSeasonWorkflow();
check(wf.length === 4, '4 adımlı workflow zinciri', wf.map((s) => s.title).join(' → '));
check(wf[0].id === 'ingest' && wf[3].id === 'pdf', 'Adım sırası (ingest → pdf)', `${wf[0].id}…${wf[3].id}`);
check(wf.every((s) => s.durationMs >= 1000), 'Adım süreleri', `${wf.reduce((a, s) => a + s.durationMs, 0)}ms toplam`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/11 geçti`);
console.log(tacticalCanvasStatus());
process.exit(pass === 11 ? 0 : 1);
