// ============================================================================
// 🌟 INFLUENCER/SPONSORLUK KÖPRÜSÜ (Shoutcart Modeli)
// İçerik üretici eşleştirme + teklif + kampanya bütçe simülasyonu.
// Deterministik; anahtar yoksa simülasyon. Plan Z güvenli.
// ============================================================================

export interface Creator {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  followers: number;
  niche: string;
  ratePerPost: number;
}

export const CREATORS: Creator[] = [
  { id: 'c1', name: 'PadelBey', platform: 'instagram', followers: 18500, niche: 'padel', ratePerPost: 2500 },
  { id: 'c2', name: 'GlampTurkiye', platform: 'instagram', followers: 32000, niche: 'glamping', ratePerPost: 4500 },
  { id: 'c3', name: 'ChefTik', platform: 'tiktok', followers: 98000, niche: 'mutfak', ratePerPost: 6000 },
  { id: 'c4', name: 'FitnessTR', platform: 'youtube', followers: 45000, niche: 'spor', ratePerPost: 8000 },
];

// Niche'e göre içerik üretici eşleştir (deterministik)
export function matchCreators(niche: string, budget?: number): Creator[] {
  return CREATORS.filter((c) => c.niche === niche && (!budget || c.ratePerPost <= budget));
}

// Kampanya bütçe simülasyonu
export function campaignSimulation(niche: string, budget: number): {
  ok: boolean;
  matches: Creator[];
  totalCost: number;
  estimatedReach: number;
  message: string;
} {
  const matches = matchCreators(niche, budget);
  if (!matches.length) {
    return { ok: false, matches: [], totalCost: 0, estimatedReach: 0, message: `Bu bütçeyle ${niche} niche eşleşmesi yok` };
  }
  const totalCost = matches.reduce((s, c) => s + c.ratePerPost, 0);
  const estimatedReach = matches.reduce((s, c) => s + c.followers, 0);
  return {
    ok: true,
    matches,
    totalCost,
    estimatedReach,
    message: `🌟 ${matches.length} içerik üretici → tahmini ${estimatedReach.toLocaleString('tr-TR')} erişim / ${totalCost.toLocaleString('tr-TR')}₺`,
  };
}

export function influencerBridgeStatus(): string {
  return `Influencer Köprüsü [Shoutcart modeli • ${CREATORS.length} üretici • niche eşleşme]`;
}
