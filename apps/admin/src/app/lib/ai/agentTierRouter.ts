// ============================================================================
// 👑 AGENT TIER ROUTER — Tier-S Ajan Yönlendirme Matrisi
// Gelen görev zorluk derecesine göre derecelendirilir:
//   Tier S: Otonom Ajan İcrası (kod/mutasyon → execute route + uzman ajan)
//   Tier B: İçerik Üretimi (kampanya/reklam/rapor → ajans/CMO motorları)
//   Tier C: Bilgi Sorgulama (soru/özet → RAG/vault + Plan A/Gemini)
// Deterministik skorlama; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type TierLevel = 'S' | 'B' | 'C';

export interface RoutedTask {
  task: string;
  tier: TierLevel;
  score: number;
  targetAgent: string;
  reasoning: string;
  confidence: number;
}

const TIER_S_KEYWORDS = ['kod', 'yaz', 'oluştur', 'düzelt', 'değiştir', 'ekle', 'geliştir', 'mutasyon', 'sil', 'taşı', 'kopyala', 'entegre'];
const TIER_B_KEYWORDS = ['kampanya', 'reklam', 'içerik', 'post', 'bülten', 'mail', 'senaryo', 'rapor', 'analiz', 'başlık', 'metin yaz'];
const TIER_C_KEYWORDS = ['nedir', 'nasıl', 'ne zaman', 'kim', 'özetle', 'bilgi', 'açıkla', 'durum', 'raporla', 'araştır', 'sorgula'];

// Görev skorlama (deterministik keyword matrisi)
export function scoreTask(task: string): { tier: TierLevel; score: number; hits: { s: number; b: number; c: number } } {
  const lower = task.toLowerCase();
  const hits = {
    s: TIER_S_KEYWORDS.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0),
    b: TIER_B_KEYWORDS.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0),
    c: TIER_C_KEYWORDS.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0),
  };
  let tier: TierLevel = 'C';
  if (hits.s >= hits.b && hits.s > 0) tier = 'S';
  else if (hits.b > 0 && hits.b >= hits.c) tier = 'B';
  const total = hits.s + hits.b + hits.c;
  return { tier, score: total, hits };
}

// Hedef ajan eşleştirme (deterministik)
export function routeTask(task: string): RoutedTask {
  const { tier, score, hits } = scoreTask(task);
  const confidence = score === 0 ? 0.4 : Math.min(0.97, 0.55 + score * 0.12);

  let targetAgent: string;
  let reasoning: string;
  if (tier === 'S') {
    targetAgent = 'Cline / Otonom Kod Ajanı (execute route)';
    reasoning = `Tier S — mutasyon niyeti (${hits.s} kod kelimesi): otonom icra, tsc doğrulama + rollback kapısı.`;
  } else if (tier === 'B') {
    targetAgent = 'Ajans Motoru / AI CMO (içerik üretimi)';
    reasoning = `Tier B — içerik niyeti (${hits.b} kelime): campaign→landing yetenek zinciri, Plan Z şablonları.`;
  } else {
    targetAgent = 'RAG / Gemini (bilgi sorgulama)';
    reasoning = `Tier C — sorgu niyeti (${hits.c} kelime): vault retrieval + OmniRoute Plan A→Z.`;
  }

  return { task, tier, score, targetAgent, reasoning, confidence };
}

// Örnek: görevleri toplu yönlendir (panolama için)
export function routeMany(tasks: string[]): RoutedTask[] {
  return tasks.map(routeTask);
}

export function tierRouterStatus(): string {
  return `Agent Tier Router [S: icra • B: içerik • C: sorgu • deterministik skorlama]`;
}
