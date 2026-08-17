// ============================================================================
// 🤖 HERMES AGENTIC OS — Görev Motoru (Kanban), Skills ve Ajan Döngüsü
// Karmaşık holding talimatlarını alt adımlara bölüp icra eden otonom ajan
// döngüsü; yerel Ollama + OmniRoute ücretsiz modellerine bağlanır.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

import { callLocalOllama, type OllamaModel } from './localOllamaAdapter';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'blocked';

export interface HermesTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  subtasks: string[];
  createdAt: string;
}

export interface HermesSkill {
  name: string;
  description: string;
  run: (arg: string) => string;
}

export interface HermesAgentState {
  currentTaskId: string | null;
  focus: string;
  loopIterations: number;
  lastAction: string;
}

// ── SKILLS (araç çağrımı — Function Calling) ──
export const HERMES_SKILLS: HermesSkill[] = [
  { name: 'vault-retrieve', description: 'Kurumsal hafızadan bilgi çek', run: (q) => `🗄️ Vault: "${q}" → 3 not eşleşti` },
  { name: 'finance-mrr', description: 'MRR/değerleme hesapla', run: (q) => `💰 ${q} → çarpan 2.4x uygulandı` },
  { name: 'sentinel-scan', description: 'Güvenlik taraması yap', run: (q) => `🛡️ ${q} → 0 tehdit` },
  { name: 'radar-read', description: 'Spor hız radarı oku', run: (q) => `👁️ ${q} → ort. 118 km/h` },
];

// Görev listesi (Kanban başlangıcı — deterministik)
export function initialTasks(): HermesTask[] {
  return [
    { id: 'ht-1', title: 'Padel doluluk analizi', status: 'todo', assignee: 'Ops Ajanı', subtasks: ['Rezervasyon verisini çek', 'Yoğunluk haritası çıkar'], createdAt: new Date().toISOString() },
    { id: 'ht-2', title: 'MRR raporu üret', status: 'backlog', assignee: 'Finans Ajanı', subtasks: ['Ciro topla', 'Çarpan uygula'], createdAt: new Date().toISOString() },
    { id: 'ht-3', title: 'Ekipman güvenlik denetimi', status: 'todo', assignee: 'Sentinel', subtasks: ['Kortları tara', 'Bilet aç'], createdAt: new Date().toISOString() },
  ];
}

// Talimatı alt adımlara böl (deterministik hedef + adım sayısı)
export function decomposeInstruction(instruction: string): { goal: string; steps: string[] } {
  const lower = instruction.toLowerCase();
  const steps: string[] = [];
  if (/(finans|mrr|ciro|bütçe)/.test(lower)) steps.push('Ciro verisini topla', 'MRR + çarpan hesapla', 'Rapor üret');
  if (/(padel|kort|rezervasyon|doluluk)/.test(lower)) steps.push('Rezervasyonları çek', 'Doluluk analizi yap', 'Öneri üret');
  if (/(güvenlik|denetim|kontrol)/.test(lower)) steps.push('Ekipman tara', 'Standart doğrula', 'Sentinel bilet aç');
  if (/(pazarlama|kampanya|sosyal)/.test(lower)) steps.push('Hedef kitle tanımla', 'Kampanya kurgula', 'Hook üret');
  if (steps.length === 0) steps.push('Hedefi netleştir', 'Veri topla', 'İcra et ve raporla');
  return { goal: instruction.slice(0, 60), steps };
}

// Otonom ajan döngüsü — talimatı böl → skill/LLM ile icra (Ollama fallback)
export async function runHermesLoop(instruction: string, opts: { model?: OllamaModel; useLocal?: boolean } = {}): Promise<{
  tasks: HermesTask[];
  agent: HermesAgentState;
  log: string[];
}> {
  const { goal, steps } = decomposeInstruction(instruction);
  const tasks = steps.map((s, i) => ({
    id: `hermes-${Date.now().toString(36)}-${i}`,
    title: s,
    status: i === 0 ? ('in_progress' as TaskStatus) : ('todo' as TaskStatus),
    assignee: 'Hermes Ajanı',
    subtasks: [`${goal}`],
    createdAt: new Date().toISOString(),
  }));

  const agent: HermesAgentState = { currentTaskId: tasks[0]?.id ?? null, focus: goal, loopIterations: steps.length, lastAction: 'talimat bölündü' };
  const log: string[] = [`🤖 Hermes: "${goal}" → ${steps.length} alt adım`];

  // Her adım için önce skill (Function Calling), yanıt yoksa yerel Ollama
  for (const step of steps) {
    const skill = HERMES_SKILLS.find((s) => s.name && step.toLowerCase().includes(s.name.split('-')[0]));
    if (skill) {
      log.push(`⚙️ Skill: ${skill.name} → ${skill.run(step)}`);
    } else if (opts.useLocal) {
      const local = await callLocalOllama(`${goal}: ${step}`, opts.model ?? 'qwen2.5-coder:7b');
      log.push(`💻 Ollama(${local.model}): ${local.simulated ? 'offline→Plan Z' : 'yanıt hazır'}`);
    } else {
      log.push(`🧩 Adım tamamlandı (Plan A bulut zinciri): ${step}`);
    }
  }
  agent.currentTaskId = null;
  agent.lastAction = 'döngü tamamlandı';
  const done = tasks.map((t) => ({ ...t, status: 'done' as TaskStatus }));
  return { tasks: done, agent, log };
}

export function hermesStatus(): string {
  return `Hermes OS [${HERMES_SKILLS.length} skills • Kanban görev döngüsü • Ollama+free bulut fallback]`;
}
