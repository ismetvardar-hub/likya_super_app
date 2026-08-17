// ============================================================================
// 🤖 CLAUDE CODE AJAN ROL ŞABLONLARI (Hermes OS & PraisonAI uyumlu)
// Frontend Architect • Backend & DB Engineer • QA & Code Reviewer • Ops Sentinel
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type AgentRole = 'frontend-architect' | 'backend-db' | 'qa-reviewer' | 'ops-sentinel';

export interface AgentTemplate {
  role: AgentRole;
  name: string;
  emoji: string;
  systemPrompt: string;
  skills: string[];
  detect: RegExp[];
  targetModel: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    role: 'frontend-architect',
    name: 'Frontend Architect',
    emoji: '🎨',
    systemPrompt:
      'Sen Likya Frontend Mimarısın. React/Tailwind UI optimizasyonunda uzmansın; koyu mod + glassmorphism + neon (#00f2fe) tasarım dilini korursun. Daze centilmenlik filtresi tüm yanıtlarda zorunludur.',
    skills: ['JSX optimizasyonu', 'Tailwind/CSS', 'Responsive layout', 'PWA uyumu'],
    detect: [/ui/, /arayüz/, /tasarım/, /layout/, /stil/, /renk/, /tailwind/, /css/, /jsx/, /component/, /görsel/, /logo/],
    targetModel: 'gemini',
  },
  {
    role: 'backend-db',
    name: 'Backend & DB Engineer',
    emoji: '🗄️',
    systemPrompt:
      'Sen Likya Backend & DB Mühendisisin. Supabase sorguları, API rotaları ve edge function mimarisinde uzmansın; güvenlik (RLS, KVKK) ve graceful fallback prensiplerine sadık kalırsın.',
    skills: ['Supabase SQL', 'API route', 'Edge function', 'RLS güvenlik'],
    detect: [/backend/, /api/, /supabase/, /database/, /veritabanı/, /sql/, /sorgu/, /route/, /endpoint/, /migration/, /edge/],
    targetModel: 'deepseek',
  },
  {
    role: 'qa-reviewer',
    name: 'QA & Code Reviewer',
    emoji: '🧪',
    systemPrompt:
      'Sen Likya QA & Kod İnceleme Uzmanısın. Build öncesi hata ve tip denetiminde uzmansın; tsc, parantez dengesi ve modül bütünlüğü kontrollerini önceliklendirirsin.',
    skills: ['tsc denetimi', 'Tip kontrolü', 'Parantez dengesi', 'Kesinti tespiti'],
    detect: [/test/, /kontrol/, /doğrula/, /hata/, /bug/, /tip/, /tsc/, /derleme/, /review/, /incele/],
    targetModel: 'ollama',
  },
  {
    role: 'ops-sentinel',
    name: 'Operations Sentinel',
    emoji: '🔋',
    systemPrompt:
      'Sen Likya Operasyon Sentinelisin. Tesis, IoT sensörleri ve enerji dengelemede uzmansın; anomali tespitinde bakım biletleri açarsın, Daze nezaket tonunu korursun.',
    skills: ['IoT izleme', 'Enerji dengeleme', 'Anomali tespiti', 'Bakım bileti'],
    detect: [/tesis/, /iot/, /enerji/, /sensör/, /bakım/, /anomali/, /turnike/, /ısıtma/, /soğutma/],
    targetModel: 'ollama',
  },
];

// Görevi rol şablonuna yönlendir (deterministik)
export function templateForTask(task: string): AgentTemplate {
  const lower = task.toLowerCase();
  let best = AGENT_TEMPLATES[0];
  let bestScore = 0;
  for (const t of AGENT_TEMPLATES) {
    const score = t.detect.reduce((s, re) => (re.test(lower) ? s + 1 : s), 0);
    if (score > bestScore) { best = t; bestScore = score; }
  }
  return best;
}

// Rol şablonuyla üret (deterministik örnek yanıt)
export function runWithTemplate(task: string): { template: AgentTemplate; output: string } {
  const t = templateForTask(task);
  return {
    template: t,
    output: `${t.emoji} ${t.name}: "${task.slice(0, 50)}" talebi ${t.skills.join(', ')} uzmanlığıyla işlendi. (Hedef model: ${t.targetModel})`,
  };
}

export function agentTemplatesStatus(): string {
  return `Claude Code Şablonları [${AGENT_TEMPLATES.length} rol • Frontend/Backend/QA/Ops • Hermes+PraisonAI uyumlu]`;
}
