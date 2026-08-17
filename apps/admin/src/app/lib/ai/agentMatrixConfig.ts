// ============================================================================
// 🧩 CLAUDE UYUMLU AJAN MATRİSİ ORKESTRATÖRÜ
// .md (standing brief) • Skills (çağrılabilir iş akışı) • Hooks (otomatik olay)
// Subagents (uzman ajanlar) • MCP (dış sistem bağlayıcıları).
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface StandingBrief {
  file: string;
  title: string;
  content: string;
  priority: number;
}

export interface AgentSkill {
  name: string;
  description: string;
  callable: (arg: string) => string;
}

export interface AgentHook {
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface Subagent {
  id: string;
  name: string;
  specialty: string;
  model: string;
}

export interface McpConnector {
  id: string;
  system: string;
  protocol: 'http' | 'websocket' | 'stdin';
  status: 'bagli' | 'bekliyor' | 'kapali';
}

// ── STANDING BRIEFS (.md) ──
export const STANDING_BRIEFS: StandingBrief[] = [
  { file: 'DazeStyleRules.md', title: 'Daze Nezaket Filtresi', content: 'Tüm otomatik yanıt ve metinlerde centilmen, nazik ve naif iletişim master kuraldır.', priority: 100 },
  { file: 'AGENTS.md', title: 'Holding Ajan Yapısı', content: '6 domain, 43 görünüm, Daze mimarisi (Mind/Hub/Crew/Vision/Chef/Reminder) korunur.', priority: 95 },
  { file: 'likya-brand-brief.md', title: 'Marka Sesi', content: 'Lüks, sıcak ve Patron odaklı ton; teknik jargon müşteriye sadeleştirilir.', priority: 80 },
];

// ── SKILLS (çağrılabilir iş akışları) ──
export const AGENT_SKILLS: AgentSkill[] = [
  { name: 'vault-retrieve', description: 'Kurumsal hafızadan bilgi çek', callable: (q) => `🗄️ Vault arama: ${q} → 3 not eşleşti (deterministik)` },
  { name: 'finance-report', description: 'MRR/değerleme raporu üret', callable: (q) => `💰 ${q} → TrustMRR raporu hazır` },
  { name: 'polite-tone', description: 'Metni Daze nezaket filtresinden geçir', callable: (q) => `💬 "${q}" → nazik tona çevrildi` },
  { name: 'radar-scan', description: 'Spor hız radarı okuması', callable: (q) => `👁️ ${q} → ort. 118 km/h, reaksiyon 410ms` },
];

// ── HOOKS (otomatik olay kuralları) ──
export const AGENT_HOOKS: AgentHook[] = [
  { trigger: 'on:new-member', action: 'Hoş geldin mesajı + üyelik paketi önerisi gönder', enabled: true },
  { trigger: 'on:daze-chef-120s', action: 'Gotify push: sipariş hazır bildirimi', enabled: true },
  { trigger: 'on:court-booking', action: 'Rezervasyon onayı + iptal penceresi hatırlatıcısı', enabled: true },
  { trigger: 'on:fraud-flag', action: 'Ledger anormalliği → CEO onay akışına yönlendir', enabled: true },
];

// ── SUBAGENTS (uzman ajanlar) ──
export const SUBAGENTS: Subagent[] = [
  { id: 'sub-fin', name: 'Finans Uzmanı', specialty: 'fatura/mutabakat/nakit', model: 'gemini' },
  { id: 'sub-ops', name: 'Operasyon Uzmanı', specialty: 'vardiya/tesis/lojistik', model: 'deepseek' },
  { id: 'sub-market', name: 'Pazaryeri Uzmanı', specialty: 'stok/sipariş/TBYB', model: 'groq' },
  { id: 'sub-sport', name: 'Spor Uzmanı', specialty: 'biyomekanik/scouting/PHV', model: 'ollama' },
];

// ── MCP (dış sistem bağlayıcıları) ──
export const MCP_CONNECTORS: McpConnector[] = [
  { id: 'mcp-supabase', system: 'Supabase DB', protocol: 'http', status: 'bekliyor' },
  { id: 'mcp-gotify', system: 'Gotify Push', protocol: 'http', status: 'bekliyor' },
  { id: 'mcp-creem', system: 'Creem MoR', protocol: 'http', status: 'bekliyor' },
  { id: 'mcp-socket', system: 'WebSocket Bildirim', protocol: 'websocket', status: 'bagli' },
];

// Matris özeti (UI için)
export function agentMatrixStatus(): string {
  return `Agent Matrix [${STANDING_BRIEFS.length} .md • ${AGENT_SKILLS.length} skills • ${AGENT_HOOKS.length} hooks • ${SUBAGENTS.length} subagents • ${MCP_CONNECTORS.length} MCP]`;
}
