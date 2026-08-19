// ============================================================================
// ⚡ OTONOM n8n İŞ AKIŞI ÜRETİCİSİ — standart Workflow JSON derleyicisi
// Trigger -> Node -> IF/Switch -> Action şemaları:
//   • FireEmergencyWorkflow         (yangın: Görsel 76 → itfaiye/PWA + kapı kilidi)
//   • QualityControlConveyorWorkflow (konveyör sayım/damga: Görsel 77 → stok düşüm)
//   • DazeReminderPeriodicWorkflow   (Cron 120s → mutfak gecikme → WhatsApp Cloud)
//   • MasterStylingFilterNode        (tüm müşteri yanıtlarına centilmen üslup filtresi)
// Deterministik; Plan Z güvenli; asla throw etmez.
// ============================================================================

export type N8nScenario = 'fire-emergency' | 'quality-conveyor' | 'daze-reminder' | 'master-styling';

export interface N8nNode {
  parameters: Record<string, unknown>;
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
}

export interface N8nConnection {
  [fromNode: string]: { main: { node: string; type: string; index: number }[][] };
}

export interface N8nWorkflowJson {
  name: string;
  nodes: N8nNode[];
  connections: N8nConnection;
  settings: { executionOrder: string; saveManualExecutions: boolean };
}

/** Deterministik node id (seeded). */
export function n8nNodeId(seed: string, salt = ''): string {
  let h = 0;
  const s = seed + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1e9;
  const hex = (h ^ 0x5bf03635).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(4)}-${h.toString(16).slice(0, 4)}-a4b1-${h.toString(16).padStart(12, '0').slice(0, 12)}`;
}

function webhookNode(name: string, method: string, path: string, x: number, y: number): N8nNode {
  return { parameters: { httpMethod: method, path }, id: n8nNodeId(name), name, type: 'n8n-nodes-base.webhookTrigger', typeVersion: 1, position: [x, y] };
}
function cronNode(name: string, expression: string, x: number, y: number): N8nNode {
  return { parameters: { rule: { interval: [{ field: 'cronExpression', expression }] } }, id: n8nNodeId(name), name, type: 'n8n-nodes-base.cron', typeVersion: 1, position: [x, y] };
}
function ifNode(name: string, condition: string, x: number, y: number): N8nNode {
  return { parameters: { conditions: { options: { caseSensitive: true, typeValidation: 'strict' }, combinator: 'and', conditions: [{ id: 'cond-1', leftValue: `={{ $json.${condition} }}`, rightValue: true, operator: { type: 'boolean', operation: 'true' } }] } }, id: n8nNodeId(name), name, type: 'n8n-nodes-base.if', typeVersion: 2, position: [x, y] };
}
function httpRequestNode(name: string, url: string, method: string, body = ''): N8nNode {
  return { parameters: { method, url, sendBody: Boolean(body), specifyBody: body ? 'json' : 'auto', jsonBody: body, options: {} }, id: n8nNodeId(name), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4, position: [0, 0] };
}
function noOpNode(name: string, x: number, y: number): N8nNode {
  return { parameters: {}, id: n8nNodeId(name), name, type: 'n8n-nodes-base.noOp', typeVersion: 1, position: [x, y] };
}

function connect(from: string, to: string): N8nConnection {
  return { [from]: { main: [[{ node: to, type: 'main', index: 0 }]] } };
}

// ── 1) YANGIN ACİL DURUM AKIŞI ──────────────────────────────────────────────
export function fireEmergencyWorkflow(): N8nWorkflowJson {
  const trigger = webhookNode('Vision Yangın Webhook', 'POST', 'daze/fire-alert', 0, 0);
  const fireIf = ifNode('Yangın Doğrulama (76)', 'isFire', 220, 0);
  const pwa = httpRequestNode('PWA Acil Uyarı', 'https://likya-ceo.vercel.app/api/v1/notification/fire', 'POST', '{"severity":"critical"}');
  const itfaiye = httpRequestNode('İtfaiye 112 Çağrısı', 'https://hook.likya.app/emergency/fire', 'POST', '{"channel":"itfaiye"}');
  const gate = httpRequestNode('Kapı Kilidi Aç', 'https://hook.likya.app/iot/gates', 'POST', '{"action":"unlock_all"}');
  const end = noOpNode('Son', 220, 260);

  return {
    name: 'Daze Fire Emergency (Görsel 76)',
    nodes: [trigger, fireIf, pwa, itfaiye, gate, end],
    connections: {
      ...connect('Vision Yangın Webhook', 'Yangın Doğrulama (76)'),
      'Yangın Doğrulama (76)': { main: [[{ node: 'PWA Acil Uyarı', type: 'main', index: 0 }], [{ node: 'Son', type: 'main', index: 0 }]] },
      'PWA Acil Uyarı': { main: [[{ node: 'İtfaiye 112 Çağrısı', type: 'main', index: 0 }]] },
      'İtfaiye 112 Çağrısı': { main: [[{ node: 'Kapı Kilidi Aç', type: 'main', index: 0 }]] },
      'Kapı Kilidi Aç': { main: [[{ node: 'Son', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1', saveManualExecutions: true },
  };
}

// ── 2) KONVEYÖR KALİTE KONTROL AKIŞI ────────────────────────────────────────
export function qualityControlConveyorWorkflow(): N8nWorkflowJson {
  const trigger = webhookNode('Konveyör Sayım Webhook', 'POST', 'daze/conveyor-count', 0, 0);
  const qc = ifNode('Kalite Kontrol (77)', 'passed', 220, 0);
  const stamp = httpRequestNode('Damgalama', 'https://hook.likya.app/iot/stamp', 'POST', '{"stamp":"QC-OK"}');
  const stock = httpRequestNode('Stok Düşümü', 'https://likya-ceo.vercel.app/api/v1/ops/stock', 'POST', '{"action":"decrement"}');
  const reject = httpRequestNode('Red Hattı', 'https://hook.likya.app/iot/reject', 'POST', '{"action":"reject"}');
  const end = noOpNode('Son', 220, 260);

  return {
    name: 'Daze Quality Control Conveyor (Görsel 77)',
    nodes: [trigger, qc, stamp, stock, reject, end],
    connections: {
      ...connect('Konveyör Sayım Webhook', 'Kalite Kontrol (77)'),
      'Kalite Kontrol (77)': { main: [[{ node: 'Damgalama', type: 'main', index: 0 }], [{ node: 'Red Hattı', type: 'main', index: 0 }]] },
      'Damgalama': { main: [[{ node: 'Stok Düşümü', type: 'main', index: 0 }]] },
      'Stok Düşümü': { main: [[{ node: 'Son', type: 'main', index: 0 }]] },
      'Red Hattı': { main: [[{ node: 'Son', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1', saveManualExecutions: true },
  };
}


// ── 3) DAZE-REMINDER PERİYODİK (CRON) AKIŞI ─────────────────────────────────
export function dazeReminderPeriodicWorkflow(): N8nWorkflowJson {
  const cron = cronNode('120s Kronometre', '*/2 * * * *', 0, 0);
  const delay = ifNode('Mutfak Gecikme Kontrolü', 'overdue', 220, 0);
  const whatsapp = httpRequestNode('WhatsApp Cloud API', 'https://graph.facebook.com/v19.0/me/messages', 'POST', '{"messaging_product":"whatsapp"}');
  const log = httpRequestNode('Daze-Reminder Log', 'https://likya-ceo.vercel.app/api/v1/ops/reminder', 'POST', '{}');
  const end = noOpNode('Son', 220, 260);

  return {
    name: 'Daze Reminder Periodic (Cron 120s)',
    nodes: [cron, delay, whatsapp, log, end],
    connections: {
      ...connect('120s Kronometre', 'Mutfak Gecikme Kontrolü'),
      'Mutfak Gecikme Kontrolü': { main: [[{ node: 'WhatsApp Cloud API', type: 'main', index: 0 }], [{ node: 'Son', type: 'main', index: 0 }]] },
      'WhatsApp Cloud API': { main: [[{ node: 'Daze-Reminder Log', type: 'main', index: 0 }]] },
      'Daze-Reminder Log': { main: [[{ node: 'Son', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1', saveManualExecutions: true },
  };
}

// ── 4) MASTER STYLING FİLTRE DÜĞÜMÜ ─────────────────────────────────────────
export function masterStylingFilterNode(): N8nWorkflowJson {
  const trigger = webhookNode('Müşteri Yanıt Girişi', 'POST', 'daze/master-style', 0, 0);
  const filter = httpRequestNode('Centilmen/Naif/Esprili Üslup Filtresi', 'https://likya-ceo.vercel.app/api/v1/ai/style', 'POST', '{"tone":"noble-simple-witty"}');
  const end = noOpNode('Son', 220, 0);

  return {
    name: 'Daze Master Styling Filter',
    nodes: [trigger, filter, end],
    connections: { ...connect('Müşteri Yanıt Girişi', 'Centilmen/Naif/Esprili Üslup Filtresi'), 'Centilmen/Naif/Esprili Üslup Filtresi': { main: [[{ node: 'Son', type: 'main', index: 0 }]] } },
    settings: { executionOrder: 'v1', saveManualExecutions: true },
  };
}

export function generateN8nWorkflow(scenario: N8nScenario): N8nWorkflowJson {
  switch (scenario) {
    case 'fire-emergency': return fireEmergencyWorkflow();
    case 'quality-conveyor': return qualityControlConveyorWorkflow();
    case 'daze-reminder': return dazeReminderPeriodicWorkflow();
    case 'master-styling': return masterStylingFilterNode();
  }
}

/** Üretilen JSON'u doğrula (node/connection bütünlüğü + trigger varlığı). */
export function validateN8nWorkflow(wf: N8nWorkflowJson): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!wf.name) issues.push('workflow adı boş');
  if (wf.nodes.length < 2) issues.push('en az 2 düğüm gerekli');
  const hasTrigger = wf.nodes.some((n) => n.type.includes('Trigger') || n.type.includes('cron'));
  if (!hasTrigger) issues.push('Trigger/Cron düğümü yok');
  const nodeNames = new Set(wf.nodes.map((n) => n.name));
  Object.values(wf.connections).forEach((conns) => conns.main.flat().forEach((c) => { if (!nodeNames.has(c.node)) issues.push(`bağlantı hedefi yok: ${c.node}`); }));
  return { ok: issues.length === 0, issues };
}

export function n8nAutonomousGeneratorStatus(): string {
  return 'n8n Üretici [4 senaryo: yangın • konveyör • 120s reminder • master üslup]';
}

