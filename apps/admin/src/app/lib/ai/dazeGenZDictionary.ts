// ============================================================================
// 💬 DAZE HUB — GEN-Z JARGON & MASTER ÜSLUP SÖZLÜĞÜ
// Genç sporcu terimlerini (Vibe, Aura, Slay, NPC, Ghostlamak, Hypelamak,
// Cringe, Love Bombing vb.) bağlamsal olarak çözer; Daze Hub'ın centilmen,
// naif ve esprili üslup filtresiyle yapıcı yanıta dönüştüren prompt enjektörü.
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface GenZTerm {
  term: string;
  meaning: string;          // bağlamsal anlam
  tone: 'positive' | 'neutral' | 'negative';
  masterReply: string;      // centilmen/esprili karşılık
}

export const GEN_Z_DICTIONARY: GenZTerm[] = [
  { term: 'vibe', meaning: 'Ortamın/duygunun enerjisi', tone: 'positive', masterReply: 'Enerjinizi fark ediyorum — bu güzel bir ritim.' },
  { term: 'aura', meaning: 'Kişisel çekim ve duruş gücü', tone: 'positive', masterReply: 'Duruşunuz etkileyici; bu kazanılmış bir denge.' },
  { term: 'slay', meaning: 'Etkileyici performans sergilemek', tone: 'positive', masterReply: 'Sahnedeki bu özgüven takdire şayan.' },
  { term: 'npc', meaning: 'Otomatik tepki veren kişi (robotlaşma)', tone: 'neutral', masterReply: 'Herkesin kendine özgü bir ritmi var; sizinkini seçin.' },
  { term: 'ghostlamak', meaning: 'Haber vermeden kaybolmak / yanıtı kesmek', tone: 'negative', masterReply: 'İletişimde netlik kıymetlidir — sessizlik yerine bir cümle.' },
  { term: 'hypelamak', meaning: 'Heyecanını artırmak / motive etmek', tone: 'positive', masterReply: 'Motivasyon ateşiniz değerli; birlikte büyütelim.' },
  { term: 'cringe', meaning: 'Utanç verici / yapmacık durum', tone: 'negative', masterReply: 'Bazı anlar zor; yine de hepimiz öğreniyoruz.' },
  { term: 'love bombing', meaning: 'Aşırı ilgiyle güven kazanma taktiği', tone: 'negative', masterReply: 'Denge ve zaman; gerçek bağ sabırdan doğar.' },
  { term: 'fire', meaning: 'Çok iyi / etkileyici', tone: 'positive', masterReply: 'Bu performans gerçekten parlıyor.' },
  { term: 'goat', meaning: 'Tüm zamanların en iyisi', tone: 'positive', masterReply: 'En iyi olmak için değil, en iyi sürümünüz için çalışın.' },
  { term: 'based', meaning: 'Kendine güvenen, özgün duruş', tone: 'positive', masterReply: 'Özgünlüğünüz net; bu saygı uyandırır.' },
  { term: 'delulu', meaning: 'Gerçekçi olmayan beklenti', tone: 'neutral', masterReply: 'Hayal gücü güzeldir; zemine bir adım koymayı da unutmayın.' },
];

export function translateGenZ(message: string): { matched: GenZTerm[]; translated: string; masterReply: string } {
  const lower = message.toLowerCase();
  const matched = GEN_Z_DICTIONARY.filter((t) => lower.includes(t.term));
  const translated = matched.map((t) => `${t.term} → ${t.meaning}`).join(' • ') || 'Gen-Z terimi bulunamadı — centilmen üslupla yanıtlanıyor.';
  const masterReply = matched.length > 0 ? matched[0].masterReply : 'Mesajınızı anladım — nezaketle karşılıyorum.';
  return { matched, translated, masterReply };
}

/** Üslup enjektörü: Gen-Z terimini centilmen/naif/esprili yanıt şablonuna dönüştürür. */
export function injectMasterStyle(prompt: string, tone: 'noble' | 'naive' | 'witty' = 'noble'): string {
  const stylePrefix = {
    noble: 'Centilmen bir üslupla, nazik ve saygılı: ',
    naive: 'Naif ve içten bir dille, sade: ',
    witty: 'Zarif bir espriyle, samimi: ',
  }[tone];
  return `${stylePrefix}${prompt}`;
}

export function dazeGenZDictionaryStatus(): string {
  return `Gen-Z Sözlük [${GEN_Z_DICTIONARY.length} terim • master üslup enjektörü • tone-aware]`;
}
