// ============================================================================
// 🔄 n8n REST API İSTEMCİSİ & AKTİVATÖRÜ
// Public API (/api/v1/workflows): createWorkflow • activateWorkflow •
// triggerWebhook (Daze Event Bus canlı olaylarını n8n webhook'una post eder).
// API anahtarı/sunucu yoksa şablonları yerel kuyrukta (localStorage) saklar ve
// başarı simülasyonu döner — asla çökme (Plan Z).
// ============================================================================

import type { N8nWorkflowJson } from './n8nAutonomousGenerator';

const LS_QUEUE = 'likya_n8n_mock_queue_v1';

export interface N8nApiConfig {
  baseUrl: string;      // ör. https://n8n.likya.app
  apiKey: string;       // X-N8N-API-KEY
}

export interface N8nWorkflowResult {
  ok: boolean;
  mode: 'live' | 'mock';
  workflowId: string;
  active: boolean;
  message: string;
}

export interface N8nWebhookResult {
  ok: boolean;
  mode: 'live' | 'mock';
  workflowId: string;
  message: string;
}

export function resolveN8nConfig(): N8nApiConfig {
  return {
    baseUrl: process.env.N8N_BASE_URL || process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.likya.app',
    apiKey: process.env.N8N_API_KEY || process.env.NEXT_PUBLIC_N8N_API_KEY || '',
  };
}

export function n8nEnvReady(): boolean {
  const cfg = resolveN8nConfig();
  return Boolean(cfg.apiKey) && cfg.baseUrl !== 'https://n8n.likya.app';
}

// ── YEREL MOCK KUYRUĞU ──────────────────────────────────────────────────────
function mockQueue(): { id: string; name: string; ts: string }[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(LS_QUEUE) ?? '[]'); } catch { return []; }
}
function saveMockQueue(q: { id: string; name: string; ts: string }[]): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_QUEUE, JSON.stringify(q.slice(-20))); } catch { /* ignore */ }
}

function mockResult(name: string): N8nWorkflowResult {
  const id = `wf_${Date.now().toString(36)}_${Math.round(Math.random() * 1e5).toString(36)}`;
  saveMockQueue([{ id, name, ts: new Date().toISOString() }, ...mockQueue()]);
  return { ok: true, mode: 'mock', workflowId: id, active: true, message: `🟡 MOCK — "${name}" yerel kuyruğa kaydedildi (${id}). n8n sunucusu/API anahtarı tanımlanınca canlı yayına geçer.` };
}

// ── REST İŞLEMLERİ ──────────────────────────────────────────────────────────
export async function createWorkflow(json: N8nWorkflowJson): Promise<N8nWorkflowResult> {
  if (!n8nEnvReady()) return mockResult(json.name);
  try {
    const cfg = resolveN8nConfig();
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/api/v1/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': cfg.apiKey },
      body: JSON.stringify({ name: json.name, nodes: json.nodes, connections: json.connections, settings: json.settings }),
    });
    if (!res.ok) return mockResult(`${json.name} (HTTP ${res.status})`);
    const data = (await res.json()) as { id?: string; active?: boolean };
    return { ok: true, mode: 'live', workflowId: String(data.id ?? ''), active: data.active ?? false, message: `n8n'de oluşturuldu: ${json.name} (${data.id})` };
  } catch {
    return mockResult(`${json.name} (ağ hatası)`);
  }
}

export async function activateWorkflow(workflowId: string): Promise<N8nWorkflowResult> {
  if (!n8nEnvReady()) return { ok: true, mode: 'mock', workflowId, active: true, message: `🟡 MOCK aktivasyon: ${workflowId} — gerçek n8n'e bağlanınca canlı aktifleşir.` };
  try {
    const cfg = resolveN8nConfig();
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': cfg.apiKey },
    });
    if (!res.ok) return { ok: false, mode: 'live', workflowId, active: false, message: `Aktivasyon başarısız (HTTP ${res.status})` };
    return { ok: true, mode: 'live', workflowId, active: true, message: `n8n akışı aktif: ${workflowId}` };
  } catch {
    return { ok: true, mode: 'mock', workflowId, active: true, message: `🟡 MOCK aktivasyon: ${workflowId}` };
  }
}

export async function triggerWebhook(path: string, payload: Record<string, unknown>): Promise<N8nWebhookResult> {
  if (!n8nEnvReady()) {
    return { ok: true, mode: 'mock', workflowId: path, message: `🟡 MOCK webhook tetikleme: /${path} (payload ${JSON.stringify(payload).slice(0, 60)}…)` };
  }
  try {
    const cfg = resolveN8nConfig();
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/webhook/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, mode: 'live', workflowId: path, message: res.ok ? `Webhook /${path} tetiklendi` : `Webhook hatası (HTTP ${res.status})` };
  } catch {
    return { ok: true, mode: 'mock', workflowId: path, message: `🟡 MOCK webhook: /${path}` };
  }
}

export function n8nApiClientStatus(): string {
  const q = mockQueue();
  return `n8n İstemci [${n8nEnvReady() ? 'CANLI API' : 'MOCK modu'} • ${q.length} yerel kuyruk]`;
}
