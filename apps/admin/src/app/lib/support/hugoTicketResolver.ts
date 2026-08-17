// ============================================================================
// 🤖 OTONOM DESTEK BİLET ÇÖZÜCÜ (Hugo AI Modeli)
// Gelen destek talebini sınıflandırır, bilgi tabanından eşleştirir ve
// deterministik çözüm önerir. Bilgi tabanı yetersizse insan ajanına aktarır.
// Plan Z güvenli — asla çökme. Kırılmasız.
// ============================================================================

export type TicketCategory = 'rezervasyon' | 'ödeme' | 'teknik' | 'tesis' | 'pazaryeri' | 'diğer';

export interface SupportTicket {
  id: string;
  text: string;
  customer: string;
  createdAt: string;
}

export interface TicketResolution {
  ok: boolean;
  category: TicketCategory;
  confidence: number;
  resolution: string;
  escalate: boolean;
  simulated: boolean;
}

const KNOWLEDGE: Record<TicketCategory, { keys: RegExp[]; answer: string }> = {
  rezervasyon: { keys: [/rezerv/, /slot/, /kort/, /kayıt/], answer: 'Rezervasyon 60 dk dilimlerdir. İptal ücretsiz; çakışma varsa otomatik alternatif slot önerilir.' },
  ödeme: { keys: [/ödeme/, /iade/, /depozito/, /kart/], answer: 'Ödeme onayı 5 dk içinde e-postaya düşer. İade 3 iş günü içinde kartınıza iade edilir.' },
  teknik: { keys: [/hata/, /çalışmıyor/, /uygulama/, /bug/], answer: 'Tarayıcıyı yenileyin; sorun sürerse yerel önbellek temizliği önerilir. Ajan takibine alındı.' },
  tesis: { keys: [/turnike/, /temizlik/, /saha/, /arıza/], answer: 'Tesis bakım ajanına bildirildi. Kritikse güvenlik ekibi anında bilgilendirilir.' },
  pazaryeri: { keys: [/sipariş/, /ürün/, /kargo/, /iade ürün/], answer: 'Sipariş durumu takipte; kargo takip numarası kısa süre içinde paylaşılacak.' },
  diğer: { keys: [], answer: '' },
};

// Bilet sınıflandırma (deterministik)
export function classifyTicket(text: string): { category: TicketCategory; confidence: number } {
  const lower = text.toLowerCase();
  let best: TicketCategory = 'diğer';
  let bestScore = 0;
  for (const [cat, kb] of Object.entries(KNOWLEDGE) as [TicketCategory, { keys: RegExp[]; answer: string }][]) {
    const score = kb.keys.reduce((s, re) => (re.test(lower) ? s + 1 : s), 0);
    if (score > bestScore) { best = cat; bestScore = score; }
  }
  return { category: best, confidence: bestScore > 0 ? Math.min(0.98, 0.6 + bestScore * 0.15) : 0.3 };
}

// Bileti çöz (deterministik)
export function resolveTicket(ticket: SupportTicket): TicketResolution {
  const { category, confidence } = classifyTicket(ticket.text);
  const kb = KNOWLEDGE[category];
  const escalate = confidence < 0.6 || !kb.answer;
  return {
    ok: true,
    category,
    confidence,
    resolution: kb.answer || `Destek talebi insan ajanına aktarıldı (konu: ${category})`,
    escalate,
    simulated: true,
  };
}

export function hugoStatus(): string {
  return `Hugo AI [bilet çözücü • 6 kategori • bilgi tabanı eşleşmesi • insana aktarma]`;
}
