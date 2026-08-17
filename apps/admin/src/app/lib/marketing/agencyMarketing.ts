// ============================================================================
// 🖥️ AJANS PAZARLAMA MOTORU (Cowork Plugin) — 8 yetenekli ajans adaptörü
// campaign-plan • content-creation • seo-audit • email-sequence •
// performance-report • social-post • ad-copy • landing-page
// Deterministik LLM'siz; Plan Z'ye sessiz düşer. Kırılmasız.
// ============================================================================

export type AgencyCapability =
  | 'campaign-plan'
  | 'content-creation'
  | 'seo-audit'
  | 'email-sequence'
  | 'performance-report'
  | 'social-post'
  | 'ad-copy'
  | 'landing-page';

export interface AgencyBrief {
  capability: AgencyCapability;
  prompt: string;
  audience?: string;
  budget?: number;
}

export interface AgencyOutput {
  capability: AgencyCapability;
  ok: boolean;
  content: string;
  simulated: boolean;
  latencyMs: number;
}

const CAPABILITY_TEMPLATES: Record<AgencyCapability, (b: AgencyBrief) => string> = {
  'campaign-plan': (b) => `🎯 Kampanya Planı — "${b.prompt.slice(0, 60)}"\n• Hedef: ${b.audience ?? 'Likya hedef kitlesi'}\n• Bütçe: ${b.budget ?? 'belirtilmemiş'}₺\n• 4 haftalık kademeli yayılım: Farkındalık → Katılım → Dönüşüm → Sadakat\n• KPI: MRR artışı, kayıt, TBYB dönüşümü`,
  'content-creation': (b) => `✍️ İçerik Paketi — "${b.prompt.slice(0, 60)}"\n• 3 blog başlığı + 2 reels senaryosu + 1 podcast bölümü\n• Ses tonu: Patron'u önceleyen, lüks ama samimi`,
  'seo-audit': (b) => `🔍 SEO Denetimi — "${b.prompt.slice(0, 60)}"\n• 12 anahtar kelime analizi\n• 8 teknik hata tespiti (yavaş görsel, eksik meta)\n• Öncelik sıralı düzeltme listesi`,
  'email-sequence': (b) => `📧 E-posta Dizisi — "${b.prompt.slice(0, 60)}"\n• 5 e-postalık onboarding zinciri\n• Konu satırı A/B testleri\n• Açılma hedefi: %35+`,
  'performance-report': (b) => `📊 Performans Raporu — "${b.prompt.slice(0, 60)}"\n• Kanal bazlı dönüşüm: Web %42, Sosyal %31, WhatsApp %27\n• ROMI hesaplaması ve haftalık trend`,
  'social-post': (b) => `📱 Sosyal Medya Gönderisi — "${b.prompt.slice(0, 60)}"\n• 1 feed gönderisi + 1 hikaye varyasyonu\n• Hashtag seti: #LikyaKampüsü + niş etiketler`,
  'ad-copy': (b) => `💡 Reklam Metni — "${b.prompt.slice(0, 60)}"\n• 3 reklam varyasyonu (fayda/duygu/kanıt)\n• CTA: "Bugün test et", "Slotunu ayır", "Vault'a eriş"`,
  'landing-page': (b) => `🖼️ Landing Page Taslağı — "${b.prompt.slice(0, 60)}"\n• Hero + sosyal kanıt + SSS + dönüşüm formu\n• Neon koyu tema (Likya tasarım dili)`,
};

// Ajans yeteneğini icra et (deterministik template motoru)
export function runAgencyCapability(brief: AgencyBrief): AgencyOutput {
  const startedAt = Date.now();
  const template = CAPABILITY_TEMPLATES[brief.capability];
  if (!template) {
    return { capability: brief.capability, ok: false, content: 'Bilinmeyen yetenek', simulated: true, latencyMs: Date.now() - startedAt };
  }
  return {
    capability: brief.capability,
    ok: true,
    content: template(brief),
    simulated: true,
    latencyMs: Date.now() - startedAt,
  };
}

// 8 yetenekli ajans motoru — hepsini sırayla çalıştırır (mini "cowork" teslimatı)
export function runFullAgency(prompt: string): AgencyOutput[] {
  const caps: AgencyCapability[] = ['campaign-plan', 'content-creation', 'seo-audit', 'email-sequence', 'performance-report', 'social-post', 'ad-copy', 'landing-page'];
  return caps.map((c) => runAgencyCapability({ capability: c, prompt }));
}

export function agencyMarketingStatus(): string {
  return `Ajans Motoru [8 yetenek • campaign-plan → landing-page • deterministik]`;
}
