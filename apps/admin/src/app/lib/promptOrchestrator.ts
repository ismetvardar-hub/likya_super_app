// ============================================================================
// 🧠 LİKYA 3 KATMANLI PROMPT & BELLEK ORKESTRATÖRÜ
// Katmanlar: Memory (kişi profili) + RAG (Tesis & BESYO Kuralı) + Live Context
// (anlık veri). Token bütçesi öncelik sırasıyla dağıtılır; taşan katman
// zarifçe kısaltılır. RAG katmanı Bilgi Vault'u (enterpriseKnowledge) kullanır.
// ============================================================================

import { buildKnowledgeContext } from './enterpriseKnowledge';

export interface MemoryLayer {
  profile: string;        // kişi profili: ad, rol, geçmiş tercihler
}

export interface RagLayer {
  question: string;       // RAG sorgusu (bilgi vault'una yönlendirilir)
}

export interface LiveLayer {
  context: string;        // anlık durum: skor, hava, sayaçlar vb.
}

export type ContextMode = 'ceo' | 'coach' | 'staff' | 'customer';

// Kabaca token tahmini: ~4 karakter/token (Türkçe için güvenli)
export function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

// Uzunluğu token bütçesine göre kırp (kelime sınırından, ortadan bölmez)
export function truncateToTokens(text: string, maxTokens: number): string {
  if (maxTokens <= 0) return '';
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut) + '… [kesildi]';
}

export interface OrchestrationLayers {
  memory?: MemoryLayer;
  rag?: RagLayer;
  live?: LiveLayer;
}

export interface OrchestratorOptions {
  mode?: ContextMode;
  maxTokens?: number;             // toplam bağlam bütçesi
  brand?: string;                 // sistem kimliği
  includeVault?: boolean;         // RAG'ı vault üzerinden mi doldursun
}

export interface OrchestratorResult {
  prompt: string;
  usedTokens: number;
  budget: {
    memory: number;
    live: number;
    rag: number;
    instruction: number;
  };
  layersIncluded: string[];
  vaultSnippet?: string;
}

// Öncelik & bütçe: Kullanıcı mesajı daima korunur; bağlam katmanları sırayla
// Memory %35 → Live %30 → RAG %25 → Sistem direktifi %10 (göreli).
export function orchestratePrompt(
  userMessage: string,
  layers: OrchestrationLayers,
  opts: OrchestratorOptions = {}
): OrchestratorResult {
  const maxTokens = opts.maxTokens ?? 12000;
  const mode = opts.mode ?? 'ceo';
  const brand = opts.brand ?? 'Likya Kampüsü — "önce insan, sonra teknoloji" ilkesiyle çalışan spor & yaşam ekosistemi';

  const budgetMemory = Math.floor(maxTokens * 0.35);
  const budgetLive = Math.floor(maxTokens * 0.3);
  const budgetRag = Math.floor(maxTokens * 0.25);
  const budgetInstruction = maxTokens - budgetMemory - budgetLive - budgetRag;

  const layersIncluded: string[] = [];
  const parts: string[] = [];
  const usedTokens: number[] = [];

  // 1) Memory — kişi profili
  if (layers.memory?.profile) {
    layersIncluded.push('memory');
    const memoryText = `[KİŞİ PROFİLİ]\n${layers.memory.profile}`;
    const mem = truncateToTokens(memoryText, budgetMemory);
    parts.push(mem);
    usedTokens.push(estimateTokens(mem));
  }

  // 2) Live Context — anlık veri
  if (layers.live?.context) {
    layersIncluded.push('live');
    const liveText = `[ANLIK DURUM]\n${layers.live.context}`;
    const live = truncateToTokens(liveText, budgetLive);
    parts.push(live);
    usedTokens.push(estimateTokens(live));
  }

  // 3) RAG — Tesis & BESYO Kuralı (Bilgi Vault'u)
  let vaultSnippet: string | undefined;
  if (layers.rag?.question) {
    layersIncluded.push('rag');
    const question = layers.rag.question;
    if (opts.includeVault !== false) {
      vaultSnippet = buildKnowledgeContext(question);
    } else {
      vaultSnippet = 'Vault devre dışı (opts.includeVault=false)';
    }
    const ragText = `[TESİS & BESYO KURALI — RAG]\n${vaultSnippet}`;
    const rag = truncateToTokens(ragText, budgetRag);
    parts.push(rag);
    usedTokens.push(estimateTokens(rag));
  }

  // 4) Sistem direktifi (mode'a göre)
  const modeInstruction: Record<ContextMode, string> = {
    ceo: 'Sen Likya Holding Baş Yöneticisisin. Kararlarında bütçe, hukuk (KVKK) ve sürdürülebilirlik dengesi kur.',
    coach: 'Sen Sport Vision baş antrenör asistanısın. Bilimsel (deterministik) veriyi sade Türkçe anlat.',
    staff: 'Sen Daze Hub operasyon görevlisisin. Stok, vardiya ve prim kurallarına harfiyen uy.',
    customer: 'Sen Likya misafirine dostça yardım eden müşteri temsilcisisin. Nezih ve kısa konuş.',
  };
  const instruction = `[SİSTEM]\n${brand}\n${modeInstruction[mode]}\n\nKullanıcı mesajı:\n${userMessage}`;
  const finalInstruction = truncateToTokens(instruction, budgetInstruction);
  parts.push(finalInstruction);

  const prompt = parts.join('\n\n');
  const totalTokens = estimateTokens(prompt);

  return {
    prompt,
    usedTokens: totalTokens,
    budget: { memory: budgetMemory, live: budgetLive, rag: budgetRag, instruction: budgetInstruction },
    layersIncluded,
    vaultSnippet,
  };
}

// Hızlı tek çağrı: CEO sohbeti için hazır bağlam
export function composeCeoContext(profile: string, liveStatus: string, question: string): OrchestrationLayers {
  return {
    memory: { profile },
    live: { context: liveStatus },
    rag: { question },
  };
}
