// ============================================================================
// 🧱 THE LLM STACK MİMARİSİ STANDARTLARI
// Tool Access (MCP) • Guardrails (Daze üslup kalkanı) • Memory (context yöneticisi)
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

// ── 1. TOOL ACCESS — Model Context Protocol (MCP) adaptör stub'ı ──
export interface McpToolRegistration {
  name: string;
  description: string;
  access: 'public' | 'owner' | 'system';
  inputSchema: Record<string, string>;
}

export const MCP_TOOL_REGISTRY: McpToolRegistration[] = [
  { name: 'vault_retrieve', description: 'Kurumsal hafızadan bilgi çek', access: 'public', inputSchema: { query: 'string' } },
  { name: 'booking_create', description: 'Rezervasyon oluştur', access: 'public', inputSchema: { text: 'string' } },
  { name: 'finance_mrr', description: 'MRR/değerleme raporu', access: 'owner', inputSchema: { period: 'string' } },
  { name: 'sentinel_scan', description: 'Güvenlik taraması', access: 'system', inputSchema: { zone: 'string' } },
  { name: 'database_query', description: 'Supabase sorgusu', access: 'owner', inputSchema: { table: 'string' } },
];

// Araca erişim kontrolü (deterministik)
export function canAccessTool(toolName: string, role: 'public' | 'owner' | 'system'): { ok: boolean; message: string } {
  const tool = MCP_TOOL_REGISTRY.find((t) => t.name === toolName);
  if (!tool) return { ok: false, message: `MCP aracı bulunamadı: ${toolName}` };
  const levelOrder = { system: 3, owner: 2, public: 1 };
  const ok = (levelOrder[role] ?? 0) >= levelOrder[tool.access];
  return { ok, message: ok ? `✅ ${toolName} erişimi verildi (${tool.access})` : `⛔ ${toolName} erişimi reddedildi — ${tool.access} gereklidir` };
}

// ── 2. GUARDRAILS — Daze Centilmenlik ve Üslup Kalkanı ──
const IMPOLITE_PATTERNS = [/!!!+/g, /\b(aptal|salak|berbat|rezalet|nefret)\b/gi, /\b(bok|pis)\b/gi, /\b(aşağıla|küçümse)\w*/gi];

export interface GuardrailResult {
  ok: boolean;
  sanitized: string;
  flagged: string[];
}

export function applyDazeGuardrail(text: string): GuardrailResult {
  let sanitized = text;
  const flagged: string[] = [];
  IMPOLITE_PATTERNS.forEach((re, i) => {
    if (re.test(sanitized)) {
      flagged.push(`kaba#${i + 1}`);
      sanitized = sanitized.replace(re, '');
    }
  });
  // Nezaket kuralı: emir kipi → "Lütfen"
  sanitized = sanitized.replace(/^(Yap|Oluştur|Gönder|Çalıştır|Sil|Düzelt|Aç|Kapat)\b/gi, 'Lütfen $1');
  return { ok: flagged.length === 0, sanitized, flagged };
}

// ── 3. MEMORY — Oturum ve Konuşma Bağlamı Yöneticisi ──
export interface ContextEntry {
  role: 'user' | 'assistant' | 'system';
  text: string;
  tokens: number;
}

export class ContextWindowManager {
  private entries: ContextEntry[] = [];
  private maxTokens: number;
  private systemPrompt: string | null = null;

  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
  }

  setSystemPrompt(p: string): void {
    this.systemPrompt = p;
  }

  add(role: ContextEntry['role'], text: string): void {
    this.entries.push({ role, text, tokens: Math.ceil(text.length / 4) });
    this.trim();
  }

  private trim(): void {
    let total = this.entries.reduce((s, e) => s + e.tokens, 0);
    while (total > this.maxTokens && this.entries.length > 1) {
      const removed = this.entries.shift();
      if (removed) total -= removed.tokens;
    }
  }

  snapshot(): string[] {
    const parts = this.systemPrompt ? [this.systemPrompt] : [];
    return [...parts, ...this.entries.map((e) => `${e.role}: ${e.text}`)];
  }

  stats(): { entries: number; tokens: number; maxTokens: number } {
    return { entries: this.entries.length, tokens: this.entries.reduce((s, e) => s + e.tokens, 0), maxTokens: this.maxTokens };
  }
}

export function llmStackStatus(): string {
  return `LLM Stack [${MCP_TOOL_REGISTRY.length} MCP araç • Daze guardrail • context yöneticisi]`;
}
