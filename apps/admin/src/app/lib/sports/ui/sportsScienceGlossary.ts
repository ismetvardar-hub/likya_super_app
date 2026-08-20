// ============================================================================
// 📚 SPOR BİLİMİ SÖZLÜĞÜ (Adım 44) — veli ve genç sporcular için sade dil
// RSI • GCT • TRIMP • ACWR • EPOC • GRF • CDL • Pronation + genişletilmiş terimler
// Deterministik veri; UI tooltip bileşeni bu sözlüğü besler.
// ============================================================================

export interface GlossaryTerm {
  abbr: string;
  term: string;
  plainLanguage: string;
  forAudience: 'parent' | 'athlete' | 'coach';
  emoji: string;
}

export const SPORTS_SCIENCE_GLOSSARY: GlossaryTerm[] = [
  { abbr: 'RSI', term: 'Reaktif Güç İndeksi', plainLanguage: 'Sıçrayış sonrası zeminde ne kadar hızlı toparlanıp yeniden güç ürettiğini gösterir. Yüksek = patlayıcı ve çevik.', forAudience: 'parent', emoji: '⚡' },
  { abbr: 'GCT', term: 'Zemin Temas Süresi', plainLanguage: 'Ayağın zeminde kaldığı süre. Kısa temas = daha elastik ve hızlı; uzun temas = yorgunluk veya verimsizlik işareti olabilir.', forAudience: 'parent', emoji: '🦶' },
  { abbr: 'TRIMP', term: 'Antrenman Yükü (Training Impulse)', plainLanguage: 'Bir seansın kalbe ne kadar yük bindirdiğinin sayısı. Yüksek sayı = daha zorlu seans.', forAudience: 'coach', emoji: '❤️' },
  { abbr: 'ACWR', term: 'Akut:Kronik Yük Oranı', plainLanguage: 'Son haftadaki yük ile son 4 haftanın ortalamasını karşılaştırır. 0.8-1.3 arası güvenli bölgedir; 1.5+ sakatlık riskini artırır.', forAudience: 'parent', emoji: '⚖️' },
  { abbr: 'EPOC', term: 'Fazla Oksijen Tüketimi', plainLanguage: 'Seans sonrası vücudun normale dönmek için harcadığı ek oksijen. Değer ne kadar yüksekse toparlanma o kadar uzun.', forAudience: 'parent', emoji: '😮‍💨' },
  { abbr: 'GRF', term: 'Zemin Tepki Kuvveti', plainLanguage: 'Zeminin vücuda uyguladığı kuvvet; koşu/zıplama sırasında eklemlere binen yükü ölçer.', forAudience: 'coach', emoji: '🦿' },
  { abbr: 'CDL', term: 'Kümülatif Deselerasyon Yükü', plainLanguage: 'Hızlı duruş ve yön değiştirmelerin eklemlere biriktirdiği fren stresinin toplamı. Yüksek = dizler için risk.', forAudience: 'parent', emoji: '🛑' },
  { abbr: 'Pronation', term: 'Pronasyon', plainLanguage: 'Ayağın içe doğru doğal basışı. Aşırısı iç kenarı, azı (supinasyon) dış kenarı zorlar; her ikisi de ayakkabı seçimini etkiler.', forAudience: 'parent', emoji: '👟' },
  { abbr: 'HRV', term: 'Kalp Atış Değişkenliği', plainLanguage: 'Kalp atışları arasındaki süre farkı. Yüksek = vücut dinlenmiş ve hazır; düşük = stres/yorgunluk.', forAudience: 'parent', emoji: '💓' },
  { abbr: 'PHV', term: 'Tepe Boy Hızı (Büyüme Atağı)', plainLanguage: 'Ergenlikte boyun en hızlı uzadığı dönem. Bu süreçte koordinasyon geçici olarak bozulabilir — normaldir.', forAudience: 'parent', emoji: '🌱' },
];

export function glossaryFor(abbr: string): GlossaryTerm | undefined {
  return SPORTS_SCIENCE_GLOSSARY.find((g) => g.abbr.toLowerCase() === abbr.toLowerCase() || g.term.toLowerCase() === abbr.toLowerCase());
}

export function listGlossary(forAudience?: 'parent' | 'athlete' | 'coach'): GlossaryTerm[] {
  return forAudience ? SPORTS_SCIENCE_GLOSSARY.filter((g) => g.forAudience === forAudience) : [...SPORTS_SCIENCE_GLOSSARY];
}

export function sportsScienceGlossaryStatus(): string {
  return `Spor Bilimi Sözlüğü: ${SPORTS_SCIENCE_GLOSSARY.length} terim • RSI/GCT/TRIMP/ACWR/EPOC/GRF/CDL/Pronasyon`;
}
