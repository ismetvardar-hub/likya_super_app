// ============================================================================
// 🔌 MCP vs A2A HİBRİT ORKESTRATÖR
// MCP (Model Context Protocol — dış sistem entegrasyonu) + A2A (Agent-To-Agent
// çoklu ajan delegasyonu) tek çatı altında. Deterministik; Plan Z güvenli.
// ============================================================================

export type ProtocolType = 'mcp' | 'a2a';

export interface McpTool {
  id: string;
  name: string;
  system: string;
  status: 'bagli' | 'bekliyor' | 'kapali';
}

export interface A2aAgent {
  id: string;
  name: string;
  specialty: string;
  status: 'hazir' | 'mesgul' | 'uyuyor';
}

export interface HybridTask {
  id: string;
  description: string;
  protocol: ProtocolType;
  target: string;
  result: string;
}

// MCP dış sistem araçları
export const MCP_TOOLS: McpTool[] = [
  { id: 'mcp-db', name: 'Supabase Query', system: 'Veritabanı', status: 'bekliyor' },
  { id: 'mcp-push', name: 'Gotify Push', system: 'Bildirim', status: 'bekliyor' },
  { id: 'mcp-pay', name: 'Creem MoR', system: 'Ödeme', status: 'bekliyor' },
  { id: 'mcp-search', name: 'Web Search', system: 'Arama', status: 'bagli' },
  { id: 'mcp-email', name: 'E-posta Gönder', system: 'İletişim', status: 'bekliyor' },
];

// A2A uzman ajanlar
export const A2A_AGENTS: A2aAgent[] = [
  { id: 'a2a-fin', name: 'Finans Ajanı', specialty: 'fatura/mutabakat', status: 'hazir' },
  { id: 'a2a-ops', name: 'Operasyon Ajanı', specialty: 'vardiya/tesis', status: 'hazir' },
  { id: 'a2a-mkt', name: 'Pazarlama Ajanı', specialty: 'içerik/SEO', status: 'mesgul' },
  { id: 'a2a-cs', name: 'Müşteri Destek Ajanı', specialty: 'bilet/CRM', status: 'hazir' },
];

// Görevi protokole göre yönlendir (deterministik)
export function routeHybrid(task: string): HybridTask {
  const lower = task.toLowerCase();
  // MCP: dış sistem erişimi gerektiren görevler
  if (/(veritabanı|sorgula|kaydet|push|bildir|ödeme|mail|e-posta|arama)/.test(lower)) {
    const tool = MCP_TOOLS.find((t) => (/(db|sorgula|kaydet)/.test(lower) && t.id === 'mcp-db') || (/(push|bildir)/.test(lower) && t.id === 'mcp-push') || (/(ödeme)/.test(lower) && t.id === 'mcp-pay') || (/(arama)/.test(lower) && t.id === 'mcp-search')) ?? MCP_TOOLS[0];
    return { id: `hyb_${Date.now().toString(36)}`, description: task, protocol: 'mcp', target: tool.name, result: `🔌 MCP → ${tool.name} (${tool.system}) aracılığıyla işlendi` };
  }
  // A2A: ajan delegasyonu gerektiren görevler
  const agent = A2A_AGENTS.find((a) => lower.includes(a.specialty.split('/')[0])) ?? A2A_AGENTS[0];
  return { id: `hyb_${Date.now().toString(36)}`, description: task, protocol: 'a2a', target: agent.name, result: `🤝 A2A → ${agent.name} (${agent.specialty}) ajana delege edildi` };
}

export function hybridOrchestratorStatus(): string {
  return `MCP×A2A [${MCP_TOOLS.length} MCP araç • ${A2A_AGENTS.length} A2A ajan • hibrit yönlendirme]`;
}
