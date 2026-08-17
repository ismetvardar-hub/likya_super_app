// ============================================================================
// 🦙 OLLAMA YEREL RAG MOTORU — kırılmasız retrieval
// Ollama (localhost:11434) kapalıysa SESSİZCE deterministik keyword+skor
// fallback'ine düşer (Plan Z). Plan A (Gemini) hiç bloklanmaz.
// ============================================================================

export interface VaultNote {
  id: string;
  title: string;
  category: string;
  content: string;
  tags?: string[];
}

export interface RagResult {
  ok: boolean;
  notes: VaultNote[];
  engine: 'ollama' | 'keyword';
  latencyMs: number;
  note: string;
}

const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = 'nomic-embed-text';

export function isOllamaAvailable(): boolean {
  return typeof process !== 'undefined' && !!process.env.OLLAMA_URL;
}

// Yerel Ollama embeddings (kapalıysa hata fırlatır — çağıran fallback'e düşer)
export async function ollamaEmbed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text.slice(0, 1000) }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = (await res.json()) as { embedding?: number[] };
  if (!data.embedding) throw new Error('Ollama boş embedding');
  return data.embedding;
}

// Vektör benzerliği (kosinüs)
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Deterministik keyword skoru (fallback) — Türkçe kök eşleşme
export function keywordScore(query: string, note: VaultNote): number {
  const q = query.toLowerCase();
  const hay = `${note.title} ${note.category} ${note.content}`.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) return 0;
  return tokens.reduce((s, t) => (hay.includes(t) ? s + 1 : s), 0) / tokens.length;
}

// Retrieval köprüsü — Ollama açıksa embedding, kapalıysa keyword fallback
export async function retrieveVault(query: string, notes: VaultNote[], topK = 5): Promise<RagResult> {
  const startedAt = Date.now();
  try {
    if (isOllamaAvailable()) {
      const qEmb = await ollamaEmbed(query);
      const scored = await Promise.all(
        notes.map(async (n) => ({ n, s: cosineSimilarity(qEmb, await ollamaEmbed(n.content)) })),
      );
      const top = scored.sort((a, b) => b.s - a.s).slice(0, topK).map((x) => x.n);
      return { ok: true, notes: top, engine: 'ollama', latencyMs: Date.now() - startedAt, note: `Ollama embedding retrieval (${top.length} sonuç)` };
    }
    throw new Error('Ollama kapalı');
  } catch {
    // 🦙 OLLAMA KAPALI → sessizce Plan Z keyword fallback (asla hata gösterme)
    const scored = notes
      .map((n) => ({ n, s: keywordScore(query, n) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, topK)
      .map((x) => x.n);
    return { ok: true, notes: scored, engine: 'keyword', latencyMs: Date.now() - startedAt, note: 'Ollama kapalı — deterministik keyword fallback (Plan Z) devrede' };
  }
}

export function localRagStatus(): string {
  return isOllamaAvailable() ? 'Ollama: yerel RAG hazır (localhost:11434)' : 'Ollama: kapalı — keyword fallback (Plan Z)';
}
