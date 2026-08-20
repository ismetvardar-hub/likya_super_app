// ============================================================================
// 🌍 ÇOK DİLLİ SPOR BİLİMİ SÖZLÜĞÜ (Adım 72) — TR • EN • DE • FR
// RSI • GCT • TRIMP • ACWR • EPOC • GRF • Deselerasyon Stresi • Pronasyon
// Kategoriler: Physiological • Kinematic • Biomechanical
// Arama + kategori filtresi + dil değiştirici için veri katmanı.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type Language = 'TR' | 'EN' | 'DE' | 'FR';
export type DictCategory = 'Physiological' | 'Kinematic' | 'Biomechanical';

export const LANGUAGES: Language[] = ['TR', 'EN', 'DE', 'FR'];

export interface DictionaryTerm {
  key: string;
  category: DictCategory;
  emoji: string;
  labels: Record<Language, string>;
  definitions: Record<Language, string>;
}

export const SPORTS_DICTIONARY: DictionaryTerm[] = [
  {
    key: 'RSI', category: 'Kinematic', emoji: '⚡',
    labels: { TR: 'Reaktif Güç İndeksi', EN: 'Reactive Strength Index', DE: 'Reaktiver Kraftindex', FR: 'Indice de force réactive' },
    definitions: {
      TR: 'Sıçrama sonrası zeminde hızlı toparlanıp yeniden güç üretme yeteneği.',
      EN: 'Ability to quickly rebound and re-produce force after a jump.',
      DE: 'Fähigkeit, nach einem Sprung schnell abzufedern und Kraft zu erzeugen.',
      FR: 'Capacité à rebondir rapidement et à reproduire la force après un saut.',
    },
  },
  {
    key: 'GCT', category: 'Kinematic', emoji: '🦶',
    labels: { TR: 'Zemin Temas Süresi', EN: 'Ground Contact Time', DE: 'Bodenkontaktzeit', FR: 'Temps de contact au sol' },
    definitions: {
      TR: 'Ayağın zeminde kaldığı süre; kısa temas daha elastik ve hızlıdır.',
      EN: 'Time the foot stays on the ground; shorter contact is more elastic and fast.',
      DE: 'Zeit, die der Fuß auf dem Boden bleibt; kürzerer Kontakt ist elastischer.',
      FR: 'Temps pendant lequel le pied reste au sol; contact court = plus élastique.',
    },
  },
  {
    key: 'TRIMP', category: 'Physiological', emoji: '❤️',
    labels: { TR: 'Antrenman Yükü', EN: 'Training Impulse', DE: 'Trainingsbelastung', FR: 'Impulsion d’entraînement' },
    definitions: {
      TR: 'Seansın kalbe bindirdiği toplam yük; yüksek değer daha zorlu seans.',
      EN: 'Total cardiovascular load of a session; higher values mean harder sessions.',
      DE: 'Gesamtbelastung einer Einheit für das Herz; höher = anstrengender.',
      FR: 'Charge cardiovasculaire totale d’une séance; plus élevée = plus dure.',
    },
  },
  {
    key: 'ACWR', category: 'Physiological', emoji: '⚖️',
    labels: { TR: 'Akut:Kronik Yük Oranı', EN: 'Acute:Chronic Workload Ratio', DE: 'Akut:Kronisch Belastungsverhältnis', FR: 'Ratio charge aiguë:chronique' },
    definitions: {
      TR: 'Son hafta yükünün 4 haftalık ortalamaya oranı; 0.8-1.3 güvenli bölge.',
      EN: 'Ratio of last week load to 4-week average; 0.8-1.3 is the safe zone.',
      DE: 'Verhältnis der Wochenlast zum 4-Wochen-Durchschnitt; 0,8-1,3 sicher.',
      FR: 'Ratio de la charge de la semaine sur la moyenne sur 4 semaines; 0,8-1,3 sûr.',
    },
  },
  {
    key: 'EPOC', category: 'Physiological', emoji: '😮‍💨',
    labels: { TR: 'Fazla Oksijen Tüketimi', EN: 'Excess Post-exercise Oxygen Consumption', DE: 'Überschüssiger Sauerstoffverbrauch', FR: 'Consommation d’oxygène post-exercice' },
    definitions: {
      TR: 'Seans sonrası vücudun normale dönmek için harcadığı ek oksijen.',
      EN: 'Extra oxygen consumed to return to baseline after exercise.',
      DE: 'Zusätzlicher Sauerstoff zur Erholung nach dem Training.',
      FR: 'Oxygène supplémentaire consommé pour récupérer après l’effort.',
    },
  },
  {
    key: 'GRF', category: 'Biomechanical', emoji: '🦿',
    labels: { TR: 'Zemin Tepki Kuvveti', EN: 'Ground Reaction Force', DE: 'Bodenreaktionskraft', FR: 'Force de réaction du sol' },
    definitions: {
      TR: 'Zeminin vücuda uyguladığı kuvvet; eklemlere binen yükü ölçer.',
      EN: 'Force exerted by the ground on the body; measures joint loading.',
      DE: 'Vom Boden auf den Körper ausgeübte Kraft; misst Gelenkbelastung.',
      FR: 'Force exercée par le sol sur le corps; mesure la charge articulaire.',
    },
  },
  {
    key: 'DECEL_STRESS', category: 'Biomechanical', emoji: '🛑',
    labels: { TR: 'Deselerasyon Stresi', EN: 'Deceleration Stress', DE: 'Verzögerungsstress', FR: 'Stress de décélération' },
    definitions: {
      TR: 'Hızlı duruş ve yön değiştirmelerin eklemlere biriktirdiği fren yükü.',
      EN: 'Braking load accumulated by sudden stops and direction changes.',
      DE: 'Bremsbelastung durch abrupte Stopps und Richtungswechsel.',
      FR: 'Charge de freinage accumulée par les arrêts brusques et changements de direction.',
    },
  },
  {
    key: 'PRONATION', category: 'Biomechanical', emoji: '👟',
    labels: { TR: 'Pronasyon', EN: 'Pronation', DE: 'Pronation', FR: 'Pronation' },
    definitions: {
      TR: 'Ayağın içe doğru doğal basışı; aşırısı iç kenarı zorlar.',
      EN: 'Natural inward roll of the foot; excessive pronation strains the inner edge.',
      DE: 'Natürliche Einwärtsrolle des Fußes; zu viel belastet die Innenkante.',
      FR: 'Roulis naturel du pied vers l’intérieur; excès = tension sur le bord interne.',
    },
  },
];

export function lookupTerm(key: string, lang: Language): { label: string; definition: string; category: DictCategory; emoji: string } | null {
  const term = SPORTS_DICTIONARY.find((t) => t.key === key.toUpperCase());
  if (!term) return null;
  return { label: term.labels[lang], definition: term.definitions[lang], category: term.category, emoji: term.emoji };
}

export function listTerms(lang: Language, category?: DictCategory): Array<{ key: string; label: string; definition: string; category: DictCategory; emoji: string }> {
  return SPORTS_DICTIONARY
    .filter((t) => !category || t.category === category)
    .map((t) => ({ key: t.key, label: t.labels[lang], definition: t.definitions[lang], category: t.category, emoji: t.emoji }));
}

/** Terimin 4 dilde de tanımlı olup olmadığını kontrol eder (çeviri tamlığı). */
export function isTermComplete(key: string): boolean {
  const term = SPORTS_DICTIONARY.find((t) => t.key === key.toUpperCase());
  if (!term) return false;
  return LANGUAGES.every((l) => term.labels[l].length > 0 && term.definitions[l].length > 0);
}

export function dictionaryCompleteness(): { complete: number; total: number } {
  return { complete: SPORTS_DICTIONARY.filter((t) => isTermComplete(t.key)).length, total: SPORTS_DICTIONARY.length };
}

export function sportsDictionaryStatus(): string {
  return `Sözlük: ${SPORTS_DICTIONARY.length} terim × ${LANGUAGES.length} dil (TR/EN/DE/FR) • 3 kategori`;
}

