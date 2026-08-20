// ============================================================================
// 🎨 TAKTİK CANVAS MOTORU — node/edge modeli + otonom workflow zinciri
// Athlete Node (canlı vitaller) • Drill Node • AI Insight Node • Edge'ler
// Anomali → düzeltici drill eşleme + çok adımlı sezon raporu zinciri
// ============================================================================

export type CanvasNodeKind = 'athlete' | 'drill' | 'insight' | 'workflow';

export interface CanvasNode {
  id: string;
  kind: CanvasNodeKind;
  x: number;
  y: number;
  title: string;
  detail: string;
  emoji: string;
  accent: string;
  status?: 'pending' | 'running' | 'done';
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  color?: string;
}

export interface AthleteVitals {
  athlete: string;
  gctMs: number;
  rsi: number;
  hr: number;
  heelPct: number;
  loadingKnS: number;
}

// ---------------------------------------------------------------------------
// 1. Sporcu + Anomaliler → Düzeltici Drill Eşleme
// ---------------------------------------------------------------------------
export interface AnomalyDrillPair {
  anomaly: string;
  metric: string;
  drill: string;
  why: string;
  severity: 'low' | 'medium' | 'high';
}

export function detectAnomalies(v: AthleteVitals): AnomalyDrillPair[] {
  const pairs: AnomalyDrillPair[] = [];
  if (v.gctMs > 200) pairs.push({ anomaly: 'GCT uzaması', metric: `${v.gctMs}ms`, drill: 'Kısa Sıçrama Serisi (Plyo 2x8)', why: 'Zemin temasını kısaltır, reaktif gücü artırır', severity: 'medium' });
  if (v.rsi < 1.5) pairs.push({ anomaly: 'RSI düşük', metric: `${v.rsi}`, drill: 'Depth Jump + Hurdle Hops', why: 'Elastik enerjiyi yayla dönüşüne çevirir', severity: 'high' });
  if (v.heelPct > 50) pairs.push({ anomaly: 'Topuk basışı ağırlıklı', metric: `%${v.heelPct}`, drill: 'Forefoot Landing Skips (3x30s)', why: 'Diz şokunu azaltır, patlayıcılığı artırır', severity: 'medium' });
  if (v.loadingKnS > 2.5) pairs.push({ anomaly: 'Darbe yükü yüksek', metric: `${v.loadingKnS} kN/s`, drill: 'Yumuşak iniş tekniği drill', why: 'Stres kırığı riskini düşürür', severity: 'high' });
  if (v.hr > 185) pairs.push({ anomaly: 'Nabız yüksek', metric: `${v.hr} bpm`, drill: 'Nefes & toparlanma arası', why: 'Kardiyovasküler yükü dengeler', severity: 'low' });
  return pairs;
}

// ---------------------------------------------------------------------------
// 2. Canvas Node & Edge Üretimi (anomalilerden)
// ---------------------------------------------------------------------------
export function buildTacticalGraph(v: AthleteVitals, originX = 40, originY = 60): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const nodes: CanvasNode[] = [
    { id: 'athlete', kind: 'athlete', x: originX, y: originY, title: v.athlete, detail: `GCT ${v.gctMs}ms • RSI ${v.rsi} • ${v.hr}bpm • Topuk %${v.heelPct}`, emoji: '🏃', accent: '#38bdf8' },
  ];
  const edges: CanvasEdge[] = [];
  const pairs = detectAnomalies(v);

  pairs.forEach((p, i) => {
    const insightId = `insight-${i}`;
    const drillId = `drill-${i}`;
    nodes.push(
      { id: insightId, kind: 'insight', x: originX + 260, y: originY + i * 110 - (pairs.length - 1) * 55, title: `⚠️ ${p.anomaly}`, detail: `${p.metric} — ${p.why}`, emoji: p.severity === 'high' ? '🚨' : p.severity === 'medium' ? '⚠️' : 'ℹ️', accent: p.severity === 'high' ? '#fb7185' : '#facc15' },
      { id: drillId, kind: 'drill', x: originX + 540, y: originY + i * 110 - (pairs.length - 1) * 55, title: `🎯 ${p.drill}`, detail: p.why, emoji: '🎯', accent: '#4ade80' },
    );
    edges.push(
      { id: `e-a-${i}`, from: 'athlete', to: insightId, color: '#facc15', dashed: true, label: 'anomali' },
      { id: `e-i-${i}`, from: insightId, to: drillId, color: '#4ade80', label: 'düzelt' },
    );
  });
  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// 3. Otonom Sezon Raporu — çok adımlı workflow zinciri
// ---------------------------------------------------------------------------
export interface WorkflowStep {
  id: string;
  title: string;
  detail: string;
  emoji: string;
  durationMs: number;
}

export function buildSeasonWorkflow(): WorkflowStep[] {
  return [
    { id: 'ingest', title: 'Data Ingestion', detail: 'Sezon telemetri + rapor toplama (CSV/JSON)', emoji: '📥', durationMs: 1200 },
    { id: 'anomaly', title: 'Biyomekanik Anomali Kontrolü', detail: 'ACWR • RSI • GCT trend taraması', emoji: '🔍', durationMs: 1500 },
    { id: 'growth', title: 'Büyüme Atağı Korelasyonu', detail: 'Boy/kilo değişimi ↔ koordinasyon düşüşü', emoji: '📏', durationMs: 1500 },
    { id: 'pdf', title: 'Final PDF Özeti', detail: 'Sade dil sezon raporu + antrenör önerisi', emoji: '📄', durationMs: 1200 },
  ];
}

export function tacticalCanvasStatus(): string {
  return 'Taktik Canvas: Athlete, Insight, Drill node lar + otonom 4 adimli sezon raporu';
}
