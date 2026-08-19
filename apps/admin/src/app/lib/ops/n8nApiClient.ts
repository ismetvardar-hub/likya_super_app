// ============================================================================
// 🔄 n8n API İSTEMCİSİ & AKTİVATÖRÜ (server-side proxy köprülü)
// Tüm istekler /api/v1/n8n/proxy üzerinden gider — N8N_API_KEY asla tarayıcıya
// inmez. Proxy env yoksa güvenli MOCK JSON döner; istemci sonucu yansıtır.
// Plan Z: asla çökme.
// ============================================================================

import type { N8nWorkflowJson } from './n8nAutonomousGenerator';

const PROXY = '/api/v1/n8n/proxy';

const LS_QUEUE = 'likya_n8n_mock_queue_v1';

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

export interface N8nLiveStatus {
  ok: boolean;
  live: boolean;
  mode: 'live' | 'mock';
  n8nStatus: string;
  baseUrl: string | null;
  note: string;
}

// ── YEREL MOCK KUYRUĞU (proxy mock yanıtlarını yansıtır) ─────────────────────
function mockQueue(): { id: string; name: string; ts: string }[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(LS_QUEUE) ?? '[]'); } catch { return []; }
}
function saveMockQueue(q: { id: string; name: string; ts: string }[]): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_QUEUE, JSON.stringify(q.slice(-20))); } catch { /* ignore */ }
}

async function proxyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PROXY}/${path}`, init);
  return (await res.json()) as T;
}

/** Proxy sağlığı → canlı/mock durum (N8nOrchestratorCard rozeti için). */
export async function checkN8nLiveStatus(): Promise<N8nLiveStatus> {
  try {
    return await proxyFetch<N8nLiveStatus>('health');
  } catch {
    return { ok: false, live: false, mode: 'mock', n8nStatus: 'standby', baseUrl: null, note: 'Proxy erişilemedi — MOCK modu' };
  }
}

export async function createWorkflow(json: N8nWorkflowJson): Promise<N8nWorkflowResult> {
  try {
    const data = await proxyFetch<N8nWorkflowResult & { path?: string; method?: string }>('workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: json.name, nodes: json.nodes, connections: json.connections, settings: json.settings }),
    });
    if (data.mode === 'mock') saveMockQueue([{ id: data.workflowId, name: json.name, ts: new Date().toISOString() }, ...mockQueue()]);
    return { ok: data.ok, mode: data.mode, workflowId: data.workflowId, active: data.active ?? false, message: data.message };
  } catch {
    return { ok: false, mode: 'mock', workflowId: '', active: false, message: 'Proxy çağrısı hatalı — MOCK modunda deneyin' };
  }
}

export async function activateWorkflow(workflowId: string): Promise<N8nWorkflowResult> {
  try {
    const data = await proxyFetch<N8nWorkflowResult>(`workflows/${workflowId}/activate`, { method: 'POST' });
    return { ok: data.ok, mode: data.mode, workflowId, active: data.active ?? true, message: data.message };
  } catch {
    return { ok: true, mode: 'mock', workflowId, active: true, message: `🟡 MOCK aktivasyon: ${workflowId}` };
  }
}

export async function triggerWebhook(path: string, payload: Record<string, unknown>): Promise<N8nWebhookResult> {
  try {
    const data = await proxyFetch<N8nWebhookResult>(`webhook/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: data.ok, mode: data.mode, workflowId: data.workflowId ?? path, message: data.message };
  } catch {
    return { ok: true, mode: 'mock', workflowId: path, message: `🟡 MOCK webhook: /${path}` };
  }
}

export function n8nApiClientStatus(): string {
  const q = mockQueue();
  return `n8n İstemci [server-side proxy köprülü • ${q.length} yerel mock kuyruk]`;
}

