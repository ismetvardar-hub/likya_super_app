// ============================================================================
// 🚀 SEO/AEO KEYWORD RESEARCH PIPELINE (n8n & DataForSEO mantığı)
// Arama motorları + AI botları (ChatGPT, Claude) üst sıra hedefli anahtar
// kelime dizini ve içerik yapısı. Deterministik; Plan Z güvenli.
// ============================================================================

export interface KeywordEntry {
  keyword: string;
  searchVolume: number;
  difficulty: number;      // 0-100
  aeoScore: number;        // AI bot görünürlük skoru 0-100
  intent: 'bilgi' | 'islem' | 'karsilastirma' | 'yerel';
  aiCitations: number;     // AI yanıtlarında kaç kez geçme potansiyeli
}

export interface SeoContentPlan {
  keyword: string;
  title: string;
  sections: string[];
  structuredData: string;
  aiOptimized: boolean;
}

// Deterministik anahtar kelime veri tabanı
export const KEYWORDS: KeywordEntry[] = [
  { keyword: 'padel kort kiralama istanbul', searchVolume: 5400, difficulty: 58, aeoScore: 72, intent: 'islem', aiCitations: 3 },
  { keyword: 'glamping çadır konaklama', searchVolume: 8200, difficulty: 44, aeoScore: 68, intent: 'karsilastirma', aiCitations: 2 },
  { keyword: 'daze chef reçete otomasyon', searchVolume: 2100, difficulty: 31, aeoScore: 81, intent: 'bilgi', aiCitations: 4 },
  { keyword: '2. el padel raketi nereden alınır', searchVolume: 3600, difficulty: 49, aeoScore: 64, intent: 'yerel', aiCitations: 2 },
  { keyword: 'sporcu biyomekanik analiz fiyat', searchVolume: 1900, difficulty: 27, aeoScore: 76, intent: 'bilgi', aiCitations: 3 },
  { keyword: 'kayak simülatörü türkiye', searchVolume: 4400, difficulty: 55, aeoScore: 70, intent: 'karsilastirma', aiCitations: 2 },
  { keyword: 'AI restoran öneri motoru', searchVolume: 2900, difficulty: 38, aeoScore: 78, intent: 'bilgi', aiCitations: 3 },
  { keyword: 'karavan parkı kiralama', searchVolume: 7200, difficulty: 41, aeoScore: 66, intent: 'yerel', aiCitations: 2 },
];

// AEO puanına göre sırala (AI bot görünürlük önceliği)
export function rankByAeo(): KeywordEntry[] {
  return [...KEYWORDS].sort((a, b) => b.aeoScore - a.aeoScore);
}

// İçerik planı üret (deterministik şablon)
export function buildContentPlan(keyword: string): SeoContentPlan {
  const entry = KEYWORDS.find((k) => k.keyword === keyword) ?? KEYWORDS[0];
  return {
    keyword: entry.keyword,
    title: `${entry.keyword} 2026 Rehberi | Likya Kampüsü`,
    sections: ['Giriş & Problem', 'Çözüm (Likya Yaklaşımı)', 'Adım Adım Nasıl Çalışır', 'Fiyat & Paketler', 'SSS (AI botlar için açık yanıtlar)'],
    structuredData: 'FAQPage + HowTo + LocalBusiness (JSON-LD)',
    aiOptimized: entry.aeoScore >= 70,
  };
}

// Toplam dizin özeti
export function seoPipelineStatus(): string {
  const avgAeo = Math.round(KEYWORDS.reduce((s, k) => s + k.aeoScore, 0) / KEYWORDS.length);
  return `SEO/AEO Pipeline [${KEYWORDS.length} kelime • ortalama AEO ${avgAeo}/100 • AI bot görünürlük]`;
}
