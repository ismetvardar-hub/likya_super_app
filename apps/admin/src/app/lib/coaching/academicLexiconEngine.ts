// ============================================================================
// 📚 LİKYA AKADEMİ — EŞ ANLAMLILAR & MİKRO ÖĞRENME KÜTÜPHANESİ
// LGS/YKS sınav hazırlık: temel kelime eşleştirmeleri (Biçim-Şekil,
// Deneyim-Tecrübe, Özgün-Orijinal vb.) + hızlı pratik test fonksiyonu.
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface SynonymPair {
  word: string;
  synonym: string;
  category: 'temel' | 'edebiyat' | 'bilim' | 'günlük';
}

export const SYNONYM_LIBRARY: SynonymPair[] = [
  { word: 'Biçim', synonym: 'Şekil', category: 'temel' },
  { word: 'Cevap', synonym: 'Yanıt', category: 'temel' },
  { word: 'Eser', synonym: 'Yapıt', category: 'edebiyat' },
  { word: 'Nadir', synonym: 'Ender', category: 'temel' },
  { word: 'Özgün', synonym: 'Orijinal', category: 'edebiyat' },
  { word: 'Deneyim', synonym: 'Tecrübe', category: 'günlük' },
  { word: 'Fikir', synonym: 'Düşünce', category: 'temel' },
  { word: 'Mesele', synonym: 'Sorun', category: 'temel' },
  { word: 'Sürat', synonym: 'Hız', category: 'bilim' },
  { word: 'İksir', synonym: 'Karışım', category: 'bilim' },
  { word: 'Lisan', synonym: 'Dil', category: 'temel' },
  { word: 'Vazife', synonym: 'Görev', category: 'günlük' },
  { word: 'İfade', synonym: 'Anlatım', category: 'edebiyat' },
  { word: 'Zımnî', synonym: 'Örtük', category: 'edebiyat' },
  { word: 'Müellif', synonym: 'Yazar', category: 'edebiyat' },
  { word: 'Tahmin', synonym: 'Kestirim', category: 'temel' },
];

export function findSynonym(word: string): SynonymPair | null {
  const clean = word.trim().toLowerCase();
  return SYNONYM_LIBRARY.find((p) => p.word.toLowerCase() === clean || p.synonym.toLowerCase() === clean) ?? null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

/** Hızlı pratik testi — karıştırılmış seçenekler + deterministik yanıt. */
export function generateSynonymQuiz(count = 4): QuizQuestion[] {
  const pool = [...SYNONYM_LIBRARY].sort(() => Math.random() - 0.5).slice(0, count);
  return pool.map((p) => {
    const distractors = SYNONYM_LIBRARY.filter((x) => x.word !== p.word && x.synonym !== p.synonym)
      .slice(0, 3)
      .map((x) => (Math.random() > 0.5 ? x.synonym : x.word));
    const options = [p.synonym, ...distractors].sort(() => Math.random() - 0.5);
    return { question: `"${p.word}" kelimesinin eş anlamlısı nedir?`, options, answer: p.synonym };
  });
}

export function checkQuizAnswer(q: QuizQuestion, selected: string): { correct: boolean; explanation: string } {
  const pair = findSynonym(q.question.match(/"([^"]+)"/)?.[1] ?? '');
  return {
    correct: selected === q.answer,
    explanation: pair ? `"${pair.word}" = "${pair.synonym}" (${pair.category})` : 'Eş anlamlı bulunamadı',
  };
}

export function academicLexiconEngineStatus(): string {
  return `Akademi Eş Anlamlılar [${SYNONYM_LIBRARY.length} çift • LGS/YKS mikro test • kategori etiketli]`;
}
