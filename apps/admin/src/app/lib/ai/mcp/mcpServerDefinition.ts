// ============================================================================
// 🛰️ MCP SUNUCU TANIMLARI — Likya platform primitiflerini harici AI
// istemcilerine (Claude Desktop, Cursor, local ajanlar) açan Tool & Resource'lar
// MCP protokolü: JSON-RPC 2.0 üzerinden tools/list, tools/call, resources
// ============================================================================

export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Record<string, unknown>;
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: () => string;
}

// Mock-first deterministik veri kaynağı (donanım/AI/Stripe yokken)
const TELEMETRY_DB: Record<string, { gctMs: number; rsi: number; hr: number; loadingKnS: number; heelPct: number }> = {
  'athlete-001': { gctMs: 208, rsi: 1.4, hr: 172, loadingKnS: 2.6, heelPct: 56 },
  'athlete-002': { gctMs: 182, rsi: 2.1, hr: 158, loadingKnS: 1.8, heelPct: 22 },
  'athlete-003': { gctMs: 195, rsi: 1.7, hr: 165, loadingKnS: 2.1, heelPct: 34 },
};

const DRILLS_DB = ['plyo-short-hop', 'depth-jump-hurdle', 'forefoot-skip', 'soft-landing', 'reaction-ladder'];
const FINANCIAL_DB: Record<string, { revenue: number; members: number; renewals: number; churnPct: number }> = {
  '2026-08': { revenue: 124000, members: 96, renewals: 12, churnPct: 3.1 },
  '2026-07': { revenue: 118500, members: 92, renewals: 9, churnPct: 2.4 },
};

// TOOL 1: get_athlete_telemetry
function toolGetAthleteTelemetry(args: Record<string, unknown>) {
  const id = String(args.athleteId ?? 'athlete-001');
  const date = String(args.date ?? '2026-08-20');
  const row = TELEMETRY_DB[id];
  if (!row) return { error: `Sporcu bulunamadi: ${id}` };
  return { athleteId: id, date, ...row, status: 'FETCHED' };
}

// TOOL 2: dispatch_drill
function toolDispatchDrill(args: Record<string, unknown>) {
  const athleteId = String(args.athleteId ?? 'athlete-001');
  const drillId = String(args.drillId ?? DRILLS_DB[0]);
  if (!DRILLS_DB.includes(drillId)) return { error: `Bilinmeyen drill: ${drillId}` };
  const row = TELEMETRY_DB[athleteId] ?? { gctMs: 0, rsi: 0, hr: 0, loadingKnS: 0, heelPct: 0 };
  const reason = row.rsi < 1.5 ? 'RSI dusuk — reaktif guc acigi' : row.gctMs > 200 ? 'GCT uzun — temas suresi acigi' : 'Performans bakimi';
  return { assignmentId: `drill-${athleteId}-${Date.now()}`, athleteId, drillId, reason, status: 'ASSIGNED' };
}

// TOOL 3: trigger_parent_alert
function toolTriggerParentAlert(args: Record<string, unknown>) {
  const athleteId = String(args.athleteId ?? 'athlete-001');
  const alertType = String(args.alertType ?? 'SESSION_REPORT');
  const message = String(args.message ?? 'Antrenman ozeti hazir');
  return { alertId: `alert-${Date.now()}`, athleteId, alertType, message, channels: ['whatsapp', 'push'], status: 'SENT' };
}

// TOOL 4: get_academy_financial_summary
function toolFinancialSummary(args: Record<string, unknown>) {
  const month = String(args.month ?? '2026-08');
  const row = FINANCIAL_DB[month];
  if (!row) return { error: `Ay verisi yok: ${month}` };
  return { month, revenueTl: row.revenue, members: row.members, renewals: row.renewals, churnPct: row.churnPct, source: 'stripe' };
}

// Tool kaydı
export const MCP_TOOLS: McpToolSchema[] = [
  {
    name: 'get_athlete_telemetry',
    description: 'Sporcunun GCT, RSI, kalp atisi ve darbe yuku (Loading Rate) telemetrisini getirir.',
    inputSchema: { type: 'object', properties: { athleteId: { type: 'string', description: 'Sporcu kimligi' }, date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' } }, required: ['athleteId'] },
    handler: toolGetAthleteTelemetry,
  },
  {
    name: 'dispatch_drill',
    description: 'Performans acigina gore sporcuya taktik drill atar.',
    inputSchema: { type: 'object', properties: { athleteId: { type: 'string', description: 'Sporcu kimligi' }, drillId: { type: 'string', description: 'Drill kodu' } }, required: ['athleteId', 'drillId'] },
    handler: toolDispatchDrill,
  },
  {
    name: 'trigger_parent_alert',
    description: 'Veliye aninda bildirim (WhatsApp/Push) gonderir.',
    inputSchema: { type: 'object', properties: { athleteId: { type: 'string', description: 'Sporcu kimligi' }, alertType: { type: 'string', description: 'Uyari tipi (SESSION_REPORT, INJURY_RISK)' }, message: { type: 'string', description: 'Veliye gonderilecek mesaj' } }, required: ['athleteId', 'message'] },
    handler: toolTriggerParentAlert,
  },
  {
    name: 'get_academy_financial_summary',
    description: 'Stripe/uyelik aylik gelir ve uye toplamlarini getirir.',
    inputSchema: { type: 'object', properties: { month: { type: 'string', description: 'Ay (YYYY-MM)' } }, required: ['month'] },
    handler: toolFinancialSummary,
  },
];

export function findMcpTool(name: string): McpToolSchema | undefined {
  return MCP_TOOLS.find((t) => t.name === name);
}

export function listMcpTools(): { name: string; description: string; inputSchema: McpToolSchema['inputSchema'] }[] {
  return MCP_TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
}

// MCP Resource'lar
export const MCP_RESOURCES: McpResource[] = [
  {
    uri: 'likya://athletes/athlete-001/telemetry',
    name: 'Sporcu Telemetri Akisi',
    description: 'athlete-001 icin canli GCT/RSI/HR/loading akisi',
    mimeType: 'application/json',
    read: () => JSON.stringify(TELEMETRY_DB['athlete-001']),
  },
  {
    uri: 'likya://academy/finance/2026-08',
    name: 'Akademi Finans Ozeti',
    description: 'Agustos 2026 gelir ve uyelik toplamlari',
    mimeType: 'application/json',
    read: () => JSON.stringify(FINANCIAL_DB['2026-08']),
  },
];

export function listMcpResources(): Pick<McpResource, 'uri' | 'name' | 'description' | 'mimeType'>[] {
  return MCP_RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType }));
}

export function readMcpResource(uri: string): string | null {
  const res = MCP_RESOURCES.find((r) => r.uri === uri);
  return res ? res.read() : null;
}

export function mcpServerDefinitionStatus(): string {
  return `MCP: ${MCP_TOOLS.length} tool + ${MCP_RESOURCES.length} resource hazir`;
}

