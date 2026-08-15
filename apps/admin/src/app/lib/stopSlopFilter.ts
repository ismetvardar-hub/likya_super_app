// ============================================================================
// ✍️ STOP-SLOP NAİF ÜSLUP FİLTRESİ (stopSlopFilter)
// Yapay zeka klişelerini ve kaba ifadeleri temizler; sade ve centilmen
// dil denetçisi. Deterministik sözlük + regex — LLM YOK.
// ============================================================================

// Yapay zeka klişeleri (İngilizce + Türkçe) → sade karşılıklar
export const SLOP_REPLACEMENTS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bdelve\s+(into|deep)\b/gi, replacement: 'incele' },
  { pattern: /in today['’]s fast-paced world/gi, replacement: 'bugün' },
  { pattern: /it['’]s important to note that/gi, replacement: '' },
  { pattern: /it is worth noting that/gi, replacement: '' },
  { pattern: /in conclusion/gi, replacement: 'sonuç olarak' },
  { pattern: /seamless(ly)?/gi, replacement: 'akıcı' },
  { pattern: /leverage/gi, replacement: 'kullan' },
  { pattern: /\bunlock\b/gi, replacement: 'aç' },
  { pattern: /game-?changer/gi, replacement: 'çığır açıcı' },
  { pattern: /cutting-?edge/gi, replacement: 'güncel' },
  { pattern: /state-?of-?the-?art/gi, replacement: 'en ileri' },
  { pattern: /robust/gi, replacement: 'sağlam' },
  { pattern: /\belevate\b/gi, replacement: 'yükselt' },
  { pattern: /\bempower\b/gi, replacement: 'güçlendir' },
  { pattern: /revolutioni[sz]e/gi, replacement: 'dönüştür' },
  { pattern: /\bunleash\b/gi, replacement: 'serbest bırak' },
  { pattern: /\bjourney\b/gi, replacement: 'yolculuk' },
  { pattern: /\btestament\b/gi, replacement: 'kanıt' },
  { pattern: /\blandscape\b/gi, replacement: 'ortam' },
  { pattern: /\bfoster\b|\bnurture\b/gi, replacement: 'geliştir' },
  { pattern: /\bkaleidoscope\b/gi, replacement: 'çeşitlilik' },
  { pattern: /\btapestry\b/gi, replacement: 'doku' },
  { pattern: /in the fast-?paced (world|digital era)/gi, replacement: '' },
  { pattern: /it['’]s not just about X, it['’]s about/gi, replacement: 'amaç:' },
  { pattern: /at the end of the day/gi, replacement: 'özetle' },
  { pattern: /think outside the box/gi, replacement: 'farklı düşün' },
  { pattern: /synergy/gi, replacement: 'uyum' },
  { pattern: /holistic(ally)?/gi, replacement: 'bütüncül' },
  { pattern: /cutting corners/gi, replacement: 'hileye kaçmak' },
  { pattern: /moving forward/gi, replacement: 'bundan sonra' },
  // Türkçe klişeler
  { pattern: /işin özü şu ki/gi, replacement: 'özü:' },
  { pattern: /göz ardı edilmemeli( ki)?/gi, replacement: '' },
  { pattern: /dikkate değer( bir şekilde)?/gi, replacement: '' },
  { pattern: /bütünsel bir bakış açısıyla/gi, replacement: 'bütüncül' },
];

export interface SlopFilterResult {
  clean: string;
  removedCount: number;
}

export function filterSlop(text: string): SlopFilterResult {
  let clean = text;
  let removedCount = 0;
  for (const { pattern, replacement } of SLOP_REPLACEMENTS) {
    const matches = clean.match(new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g'));
    if (matches) removedCount += matches.length;
    clean = clean.replace(pattern, replacement);
  }
  // Art arda boşlukları ve gereksiz virgülleri temizle
  clean = clean.replace(/,{2,}/g, ',').replace(/\s{2,}/g, ' ').replace(/,\s*,/g, ',').trim();
  return { clean, removedCount };
}

// ----------------------------------------------------------------------------
// KABA İFADE DENETÇİSİ — centilmen dil validator
// ----------------------------------------------------------------------------
export const RUDE_PATTERNS: RegExp[] = [
  /\b(şike|ağzına|kahrol|piç|mal|salak|aptal|gerizekalı|boktan|rezalet ama lan)\b/gi,
  /\b(f\*ck|sh\*t|b\*tch|d\*mn|stupid|idiot|moron)\b/gi,
];

export interface ToneValidation {
  ok: boolean;
  rudeWords: string[];
  sanitized: string;
}

export function validateTone(text: string): ToneValidation {
  const rudeWords: string[] = [];
  let sanitized = text;
  for (const re of RUDE_PATTERNS) {
    const matches = text.match(re);
    if (matches) rudeWords.push(...matches.map((m) => m.toLowerCase()));
    sanitized = sanitized.replace(re, '•••');
  }
  return { ok: rudeWords.length === 0, rudeWords: Array.from(new Set(rudeWords)), sanitized };
}

export interface GentlemanResult {
  ok: boolean;
  warnings: string[];
  text: string;
}

// Birleşik validasyon: klişe temizliği + kaba dil denetimi
export function gentlemanValidator(text: string): GentlemanResult {
  const slop = filterSlop(text);
  const tone = validateTone(slop.clean);
  const warnings: string[] = [];
  if (slop.removedCount > 0) warnings.push(`${slop.removedCount} AI klişesi temizlendi`);
  if (tone.rudeWords.length > 0) warnings.push(`Kaba ifade bulundu ve gizlendi: ${tone.rudeWords.join(', ')}`);
  return { ok: tone.ok, warnings, text: tone.sanitized };
}
