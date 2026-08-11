// ============================================================================
// LİKYA ÇOKLU MODEL YÖNLENDİRİCİ (Multi-Model Failover Router)
// Öncelik: 1) DeepSeek  2) Gemini  3) Local Ollama
// Bir model başarısız olursa otomatik olarak bir sonrakine geçer.
// ============================================================================

export type ModelProvider = 'deepseek' | 'gemini' | 'ollama';

export type ModelResult = {
  provider: ModelProvider;
  content: string;
  latencyMs: number;
};

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'qwen2.5-coder:7b';

// ============================================================================
// DEEPSEEK (Birincil)
// ============================================================================
async function callDeepSeek(prompt: string, systemPrompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek API key yok');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek hata: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ============================================================================
// DEEPSEEK-R1 (Reasoning - Karmaşık mimari kararlar, zor hatalar)
// ============================================================================
async function callDeepSeekR1(prompt: string, systemPrompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek API key yok');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek-R1 hata: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ============================================================================
// GEMINI (İkincil)
// ============================================================================
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key yok');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: prompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini hata: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================================
// LOCAL OLLAMA (Üçüncül / Yedek)
// ============================================================================
async function callOllama(prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama hata: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

// ============================================================================
// ÇOKLU MODEL YÖNLENDİRİCİ - Failover mantığı
// ============================================================================
// ============================================================================
// REASONING YÖNLENDİRİCİ - DeepSeek-R1 öncelikli (karmaşık görevler)
// ============================================================================
export async function routeToReasoningModel(prompt: string, systemPrompt: string): Promise<ModelResult> {
  const providers: { name: ModelProvider; fn: () => Promise<string> }[] = [
    { name: 'deepseek', fn: () => callDeepSeekR1(prompt, systemPrompt) },
    { name: 'gemini', fn: () => callGemini(prompt, systemPrompt) },
    { name: 'ollama', fn: () => callOllama(prompt, systemPrompt) },
  ];

  const errors: string[] = [];
  for (const provider of providers) {
    const start = Date.now();
    try {
      const content = await provider.fn();
      if (content && content.trim()) {
        return {
          provider: provider.name,
          content: content.trim(),
          latencyMs: Date.now() - start,
        };
      }
      errors.push(`${provider.name}: boş yanıt`);
    } catch (err: any) {
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  throw new Error(`Tüm modeller başarısız: ${errors.join(' | ')}`);
}

// ============================================================================
// ÇOKLU MODEL YÖNLENDİRİCİ - Failover mantığı
// ============================================================================
export async function routeToModel(prompt: string, systemPrompt: string): Promise<ModelResult> {
  const providers: { name: ModelProvider; fn: () => Promise<string> }[] = [
    { name: 'deepseek', fn: () => callDeepSeek(prompt, systemPrompt) },
    { name: 'gemini', fn: () => callGemini(prompt, systemPrompt) },
    { name: 'ollama', fn: () => callOllama(prompt, systemPrompt) },
  ];

  const errors: string[] = [];
  for (const provider of providers) {
    const start = Date.now();
    try {
      const content = await provider.fn();
      if (content && content.trim()) {
        return {
          provider: provider.name,
          content: content.trim(),
          latencyMs: Date.now() - start,
        };
      }
      errors.push(`${provider.name}: boş yanıt`);
    } catch (err: any) {
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  throw new Error(`Tüm modeller başarısız: ${errors.join(' | ')}`);
}

// ============================================================================
// MODEL DURUM KONTROLÜ
// ============================================================================
export async function checkModelHealth(): Promise<{ provider: ModelProvider; status: 'online' | 'offline'; latencyMs: number }[]> {
  const results: { provider: ModelProvider; status: 'online' | 'offline'; latencyMs: number }[] = [];

  // DeepSeek
  try {
    const start = Date.now();
    await callDeepSeek('Merhaba', 'Kısa yanıt ver');
    results.push({ provider: 'deepseek', status: 'online', latencyMs: Date.now() - start });
  } catch {
    results.push({ provider: 'deepseek', status: 'offline', latencyMs: 0 });
  }

  // Gemini
  try {
    const start = Date.now();
    await callGemini('Merhaba', 'Kısa yanıt ver');
    results.push({ provider: 'gemini', status: 'online', latencyMs: Date.now() - start });
  } catch {
    results.push({ provider: 'gemini', status: 'offline', latencyMs: 0 });
  }

  // Ollama
  try {
    const start = Date.now();
    await callOllama('Merhaba', 'Kısa yanıt ver');
    results.push({ provider: 'ollama', status: 'online', latencyMs: Date.now() - start });
  } catch {
    results.push({ provider: 'ollama', status: 'offline', latencyMs: 0 });
  }

  return results;
}
