// ============================================================================
// 🛠️ LİKYA 100+ AI ARAÇ & MODEL YÖNLENDİRİCİSİ (toolRegistry.ts)
// Görev tipine göre (Metin, Kod, Görsel, Analiz, Ses, Veri) en optimize aracı
// ve API fallback zincirini deterministik seçen yetki motoru.
// ============================================================================

export type TaskType =
  | 'METİN' | 'KOD' | 'GÖRSEL' | 'ANALİZ' | 'SES' | 'VERİ' | 'ÇEVİRİ' | 'ÖZET';

export interface ToolEntry {
  id: string;
  name: string;
  category: TaskType;
  provider: string;          // API/model sağlayıcı
  priority: number;          // düşük = öncelik
  capability: string;
  requiresKey?: boolean;
}

// 8 görev tipi için araç kayıtları (öncelik sıralı fallback zinciri)
const TOOL_REGISTRY: Record<TaskType, ToolEntry[]> = {
  METİN: [
    { id: 'txt-gemini', name: 'Gemini Pro Text', category: 'METİN', provider: 'Google Gemini', priority: 1, capability: 'Uzun bağlamlı üretim', requiresKey: true },
    { id: 'txt-groq', name: 'Llama-3.3 Groq', category: 'METİN', provider: 'Groq', priority: 2, capability: 'Hızlı üretim', requiresKey: true },
    { id: 'txt-openrouter', name: 'OpenRouter Free', category: 'METİN', provider: 'OpenRouter', priority: 3, capability: 'Yedek üretim', requiresKey: true },
    { id: 'txt-rule', name: 'Kural Motoru (Plan Z)', category: 'METİN', provider: 'Yerel Deterministik', priority: 4, capability: 'Anahtar yoksa kurallı yanıt', requiresKey: false },
  ],
  KOD: [
    { id: 'code-deepseek', name: 'DeepSeek V3', category: 'KOD', provider: 'DeepSeek', priority: 1, capability: 'Kod üretimi/düzeltme', requiresKey: true },
    { id: 'code-groq', name: 'Qwen Coder', category: 'KOD', provider: 'Groq', priority: 2, capability: 'Hızlı kod', requiresKey: true },
    { id: 'code-mistral', name: 'Codestral', category: 'KOD', provider: 'Mistral', priority: 3, capability: 'Kod tamamlama', requiresKey: true },
    { id: 'code-shield', name: 'Syntax Shield', category: 'KOD', provider: 'tsc/transpileModule', priority: 4, capability: 'Derleme doğrulama', requiresKey: false },
  ],
  GÖRSEL: [
    { id: 'img-vision', name: 'Vision Analyzer', category: 'GÖRSEL', provider: 'Gemini Vision', priority: 1, capability: 'Görüntüden açıklama', requiresKey: true },
    { id: 'img-shape', name: 'Shape Detector', category: 'GÖRSEL', provider: 'OpenCV kuralı', priority: 2, capability: 'Şekil/çizgi tespiti', requiresKey: false },
    { id: 'img-blur', name: 'Face Blur Shield', category: 'GÖRSEL', provider: 'KVKK Anonim', priority: 3, capability: 'Yüz bulanıklaştırma', requiresKey: false },
  ],
  ANALİZ: [
    { id: 'an-radar', name: 'Speed Radar', category: 'ANALİZ', provider: 'sportVision/speedRadar', priority: 1, capability: 'Piksel→km/s hız', requiresKey: false },
    { id: 'an-science', name: 'Sports Science', category: 'ANALİZ', provider: 'sportVision/sportsScience', priority: 2, capability: 'PHV/VO2Max kalori', requiresKey: false },
    { id: 'an-erp', name: 'ERP Engine', category: 'ANALİZ', provider: 'dazeHub/erpEngine', priority: 3, capability: 'Stok/bordro analizi', requiresKey: false },
    { id: 'an-llm', name: 'Deep Analysis', category: 'ANALİZ', provider: 'Gemini', priority: 4, capability: 'Derin yorum', requiresKey: true },
  ],
  SES: [
    { id: 'au-music', name: 'Daze DJ Tempo', category: 'SES', provider: 'dazeSentinel/music', priority: 1, capability: 'BPM önerisi', requiresKey: false },
    { id: 'au-tts', name: 'TTS', category: 'SES', provider: 'Sesli asistan', priority: 2, capability: 'Metin→ses', requiresKey: true },
  ],
  VERİ: [
    { id: 'dt-clean', name: 'Data Cleaner', category: 'VERİ', provider: 'stopSlop/security', priority: 1, capability: 'Üslup+enjeksiyon temizliği', requiresKey: false },
    { id: 'dt-memory', name: 'Infinite Memory', category: 'VERİ', provider: 'db/infiniteMemory', priority: 2, capability: 'Kalıcı hafıza/arşiv', requiresKey: false },
  ],
  ÇEVİRİ: [
    { id: 'tr-gemini', name: 'Gemini Translate', category: 'ÇEVİRİ', provider: 'Google Gemini', priority: 1, capability: 'Doğal çeviri', requiresKey: true },
    { id: 'tr-rule', name: 'Dictionary Fallback', category: 'ÇEVİRİ', provider: 'Yerel sözlük', priority: 2, capability: 'Temel çeviri', requiresKey: false },
  ],
  ÖZET: [
    { id: 'su-llm', name: 'Summarizer', category: 'ÖZET', provider: 'Groq/Gemini', priority: 1, capability: 'Özet üretimi', requiresKey: true },
    { id: 'su-live', name: 'Live Context', category: 'ÖZET', provider: 'promptOrchestrator', priority: 2, capability: 'Bütçe kırpma özeti', requiresKey: false },
  ],
};

export const ALL_TASK_TYPES: TaskType[] = ['METİN', 'KOD', 'GÖRSEL', 'ANALİZ', 'SES', 'VERİ', 'ÇEVİRİ', 'ÖZET'];

export const TOOL_COUNT = Object.values(TOOL_REGISTRY).reduce((a, t) => a + t.length, 0);

// Görev tipini doğal dil komutundan tahmin et (deterministik)
export function detectTaskType(command: string): TaskType {
  const lower = command.toLowerCase();
  if (/(kod|yaz|düzelt|dosya|fonksiyon|bileşen|component|tsx)/.test(lower)) return 'KOD';
  if (/(çevir|translate|ingilizce|türkçe)/.test(lower)) return 'ÇEVİRİ';
  if (/(özet|kısa|özetle)/.test(lower)) return 'ÖZET';
  if (/(resim|görsel|foto|video|kamera|yüz)/.test(lower)) return 'GÖRSEL';
  if (/(hız|radar|analiz|phv|kalori|stok|bordro|metrik|skor)/.test(lower)) return 'ANALİZ';
  if (/(ses|müzik|bpm|ritim|tone)/.test(lower)) return 'SES';
  if (/(veri|temizle|arşiv|hafıza|kayıt)/.test(lower)) return 'VERİ';
  return 'METİN';
}

// Bir görev için optimize aracı seç (anahtar varlığına göre)
export function selectToolForTask(taskType: TaskType, availableKeys: Record<string, boolean> = {}): ToolEntry {
  const chain = TOOL_REGISTRY[taskType] ?? TOOL_REGISTRY.METİN;
  for (const tool of chain) {
    if (tool.requiresKey && availableKeys[tool.provider] === false) continue;
    return tool;
  }
  return chain[chain.length - 1];
}

// Tüm fallback zincirini döndür (yedek sırası)
export function getToolChain(taskType: TaskType): ToolEntry[] {
  return TOOL_REGISTRY[taskType];
}

export interface RouteResult {
  taskType: TaskType;
  chosen: ToolEntry;
  chain: ToolEntry[];
  fallbackReady: number;
}

// Birleşik yönlendirme: komut → tip → araç + fallback hazırlığı
export function routeTask(command: string, availableKeys?: Record<string, boolean>): RouteResult {
  const taskType = detectTaskType(command);
  const chain = getToolChain(taskType);
  const chosen = selectToolForTask(taskType, availableKeys);
  const fallbackReady = chain.filter((t) => !t.requiresKey || (availableKeys?.[t.provider] !== false)).length;
  return { taskType, chosen, chain, fallbackReady };
}

