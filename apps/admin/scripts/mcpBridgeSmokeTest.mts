// ============================================================================
// 🛰️ MCP BRIDGE SMOKE TESTİ
// Tool tanımları • tools/list • tools/call • resources • JSON-RPC • Connector'lar
// Çalıştırma: npx tsx scripts/mcpBridgeSmokeTest.mts
// ============================================================================
import { listMcpTools, listMcpResources, readMcpResource, findMcpTool, MCP_TOOLS, mcpServerDefinitionStatus } from '../src/app/lib/ai/mcp/mcpServerDefinition';
import { handleJsonRpc, handleLine, mcpBridgeStatus } from '../src/app/lib/ai/mcp/mcpJsonRpc';
import { createSentryConnector, createDriveNotionExporter, createStripeBillingSync } from '../src/app/lib/ai/mcp/mcpConnectors';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. TOOL TANIMLARI ──────────────────────────────────────────────────────
check(MCP_TOOLS.length === 4, '4 MCP tool kayıtlı', MCP_TOOLS.map((t) => t.name).join(', '));
check(listMcpTools().every((t) => t.inputSchema?.type === 'object' && t.description.length > 10), 'Her tool JSON Schema giriş tanımına sahip', '');
check(findMcpTool('get_athlete_telemetry') !== undefined, 'Tool arama', 'get_athlete_telemetry bulundu');

// ── 2. tools/list + tools/call ──────────────────────────────────────────────
const listed = handleJsonRpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
check(listed.result && Array.isArray((listed.result as { tools: unknown[] }).tools) && (listed.result as { tools: unknown[] }).tools.length === 4, 'tools/list → 4 tool', `${(listed.result as { tools: unknown[] }).tools.length}`);

const tel = handleJsonRpc({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_athlete_telemetry', arguments: { athleteId: 'athlete-001' } } });
const telText = JSON.stringify(tel.result);
check(telText.includes('gctMs') && telText.includes('208'), 'get_athlete_telemetry → GCT 208', '');
const dispatch = handleJsonRpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'dispatch_drill', arguments: { athleteId: 'athlete-001', drillId: 'plyo-short-hop' } } });
check(JSON.stringify(dispatch.result).includes('ASSIGNED') && JSON.stringify(dispatch.result).includes('RSI dusuk'), 'dispatch_drill → atama + sebep', '');
const alert = handleJsonRpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'trigger_parent_alert', arguments: { athleteId: 'athlete-001', message: 'Maç özeti hazır' } } });
check(JSON.stringify(alert.result).includes('SENT') && JSON.stringify(alert.result).includes('whatsapp'), 'trigger_parent_alert → WhatsApp/push', '');
const fin = handleJsonRpc({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'get_academy_financial_summary', arguments: { month: '2026-08' } } });
check(JSON.stringify(fin.result).includes('124000'), 'get_academy_financial_summary → 124.000₺', '');
const badTool = handleJsonRpc({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'hack_llm' } });
check(badTool.error !== undefined && badTool.error.code === -32602, 'Bilinmeyen tool → -32602', '');

// ── 3. RESOURCES ────────────────────────────────────────────────────────────
check(listMcpResources().length === 2, '2 MCP resource', listMcpResources().map((r) => r.uri).join(', '));
check(readMcpResource('likya://athletes/athlete-001/telemetry')?.includes('208') === true, 'Resource okuma → telemetri', '');
check(readMcpResource('likya://olmayan') === null, 'Olmayan resource → null', '');

// ── 4. JSON-RPC PROTOKOL ────────────────────────────────────────────────────
const init = handleJsonRpc({ jsonrpc: '2.0', id: 7, method: 'initialize' });
check((init.result as { serverInfo: { name: string } }).serverInfo?.name === 'likya-mcp-bridge', 'initialize → likya-mcp-bridge', '');
const line = handleLine(JSON.stringify({ jsonrpc: '2.0', id: 8, method: 'ping' }));
check(line !== null && line.includes('pong'), 'Stdio satır transport → ping/pong', '');
check(handleLine('{geçersiz') === null, 'Bozuk satır → null (çökmez)', '');

// ── 5. CONNECTOR'LAR ────────────────────────────────────────────────────────
const sentry = createSentryConnector();
const drop = sentry.reportBluetoothDropout({ deviceId: 'esp32-insole-1', occurredAt: new Date().toISOString(), rssiDbm: -92, consecutiveDropouts: 3, errorMessage: 'GATT disconnected' });
check(drop.level === 'error' && drop.sentTo === 'mock-sink' && drop.tags.service === 'web-bluetooth', 'Sentry connector → BLE dropout log', `rssi ${drop.extra.rssiDbm}dBm`);

const exporter = createDriveNotionExporter();
const exp = exporter.exportSessionReport({ athlete: 'Arda G.', date: '2026-08-20', gctMs: 208, rsi: 1.4, loadingKnS: 2.6, plainSummary: 'Maç özeti' }, 'gdrive');
check(exp.status === 'UPLOADED' && exp.payloadType === 'application/pdf' && exp.destination.startsWith('drive-'), 'Drive exporter → PDF upload', exp.destination);
const notExp = exporter.exportSessionReport({ athlete: 'Arda G.', date: '2026-08-20', gctMs: 208, rsi: 1.4, loadingKnS: 2.6, plainSummary: 'Maç özeti' }, 'notion');
check(notExp.payloadType === 'application/json', 'Notion exporter → JSON page', '');

const stripe = createStripeBillingSync();
const sub = stripe.syncMembershipToStripe({ id: 'U-042', email: 'veli@likya.com' }, 'ELITE');
check(sub.customerId === 'cus_U-042' && sub.status === 'ACTIVE' && sub.priceId === 'price_elite_99', 'Stripe sync → ELITE abonelik', `${sub.priceId}`);
const basic = stripe.syncMembershipToStripe({ id: 'U-055', email: 'a@b.com' }, 'BASIC');
check(basic.status === 'TRIALING', 'BASIC katman → TRIALING', '');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/20 geçti`);
console.log(mcpBridgeStatus());
process.exit(pass === 20 ? 0 : 1);
