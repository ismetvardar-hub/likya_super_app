// ============================================================================
// 🎯 AI CMO & TREND DİNLEME ADAPTÖRÜ (Okara Modeli) — 10 ajanlı CMO
// SEO • UGC • Influencer • Social • Email • Analytics • Brand • Ads •
// Community • Content — her ajan deterministik rapor üretir. Plan Z güvenli.
// ============================================================================

export type CmoAgentId =
  | 'seo' | 'ugc' | 'influencer' | 'social' | 'email'
  | 'analytics' | 'brand' | 'ads' | 'community' | 'content';

export interface CmoReport {
  agent: CmoAgentId;
  title: string;
  insight: string;
  action: string;
  kpi: string;
}

const CMO_AGENTS: Record<CmoAgentId, { title: string; insight: string; action: string; kpi: string }> = {
  seo: { title: 'SEO Ajanı', insight: '12 anahtar kelimede üst sıra fırsatı tespit edildi', action: 'Meta + içerik güncelle', kpi: '+28% organik' },
  ugc: { title: 'UGC Ajanı', insight: 'Kullanıcıların 40+ vlog görseli yayında', action: 'Top 5 içerikle reklam paketi kur', kpi: '3.2x ROAS' },
  influencer: { title: 'Influencer Ajanı', insight: '2.5K-25K arası 6 mikro influencer eşleşti', action: 'Sezonluk iş birliği teklifi gönder', kpi: '18K erişim' },
  social: { title: 'Social Ajanı', insight: 'Reels etkileşimi +34% (BPM 124 içerik)', action: 'Haftalık 3 reels takvimi başlat', kpi: '%5.2 ER' },
  email: { title: 'Email Ajanı', insight: 'Abone listesi 4.1K, açılma %38', action: '5 e-postalık diziyi etkinleştir', kpi: '%38 açılma' },
  analytics: { title: 'Analytics Ajanı', insight: 'Pazaryeri → TBYB dönüşümü %9.4', action: 'Kiralama CTA alanını vurgula', kpi: '+12% dönüşüm' },
  brand: { title: 'Brand Ajanı', insight: 'Likya marka bilinirliği 62/100', action: 'Sponsorluk + kiosk markalama', kpi: '+8 puan' },
  ads: { title: 'Ads Ajanı', insight: 'Meta reklam bütçesi 40K₺, ROMI 2.8', action: 'Kazanan seti 2x ölçekle', kpi: '2.8 ROMI' },
  community: { title: 'Community Ajanı', insight: 'WhatsApp grubu 1.2K üye aktif', action: 'Haftalık etkinlik anketi aç', kpi: '%74 katılım' },
  content: { title: 'Content Ajanı', insight: 'Tesis ritmine uygun 8 içerik önerisi', action: 'Editör takvimi yayımla', kpi: '8 parça/hafta' },
};

// 10 ajanlı CMO raporu üret (deterministik)
export function runCmoBoard(): CmoReport[] {
  return (Object.keys(CMO_AGENTS) as CmoAgentId[]).map((id) => ({ agent: id, ...CMO_AGENTS[id] }));
}

// Tek ajan raporu
export function runCmoAgent(id: CmoAgentId): CmoReport {
  return { agent: id, ...CMO_AGENTS[id] };
}

// Haftalık özet (skor bazlı yönlendirme)
export function cmoBoardStatus(): string {
  return `AI CMO [10 ajan • SEO→Content • Okara modeli • deterministik]`;
}
