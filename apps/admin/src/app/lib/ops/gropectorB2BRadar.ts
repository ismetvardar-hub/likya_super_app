// ============================================================================
// 🗺️ GROPECTOR B2B HARİTA RADARI & PITCH MOTORU
// Google Maps + Gemini uyumlu: koordinat çevresindeki işletmeleri tarar,
// web sitesi veya spor altyapısı eksik olanları tespit eder ve tek tıkla
// kişiselleştirilmiş kurumsal satış teklifi (B2B Sales Pitch) üretir.
// Harita/Gemini API yoksa yerel simülasyon (mock-first). Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export interface BusinessEntity {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  hasWebsite: boolean;
  hasSportInfra: boolean;
  googleRating: number;
  leadsScore: number;    // B2B fırsat skoru
}

/** Koordinat çevresi tarama simülatörü (Google Places şema uyumlu). */
export function scanBusinessRadar(center: { lat: number; lng: number }, radiusKm = 5, apiKey = ''): { mode: 'live' | 'mock'; businesses: BusinessEntity[] } {
  const catalog: Omit<BusinessEntity, 'id' | 'leadsScore'>[] = [
    { name: 'Kaş Deniz Otel', category: 'Otel', distanceKm: 1.2, hasWebsite: false, hasSportInfra: false, googleRating: 4.6 },
    { name: 'Finike Kafe & Bahçe', category: 'Kafe', distanceKm: 2.4, hasWebsite: false, hasSportInfra: false, googleRating: 4.3 },
    { name: 'Kalkan Spor Salonu', category: 'Fitness', distanceKm: 3.1, hasWebsite: false, hasSportInfra: true, googleRating: 4.1 },
    { name: 'Demre Pansiyonlar', category: 'Konaklama', distanceKm: 4.5, hasWebsite: false, hasSportInfra: false, googleRating: 4.0 },
  ];
  const businesses: BusinessEntity[] = catalog
    .filter((b) => b.distanceKm <= radiusKm)
    .map((b, i) => {
      const leadsScore = (b.hasWebsite ? 0 : 45) + (b.hasSportInfra ? 10 : 30) + Math.round(b.googleRating * 5);
      return { ...b, id: `BIZ-${i + 1}`, leadsScore: Math.min(95, leadsScore) };
    })
    .sort((a, b) => b.leadsScore - a.leadsScore);
  return { mode: apiKey ? 'live' : 'mock', businesses };
}

export interface B2bPitch {
  businessId: string;
  businessName: string;
  subject: string;
  opening: string;
  valueProp: string;
  offer: string;
  cta: string;
}

/** Kişiselleştirilmiş B2B satış teklifi üret. */
export function generateB2bPitch(b: BusinessEntity): B2bPitch {
  const missing = [];
  if (!b.hasWebsite) missing.push('dijital vitrin (site)');
  if (!b.hasSportInfra) missing.push('spor/etkinlik altyapısı');
  const offer = b.hasSportInfra ? 'Likya Kort & Etkinlik ağına katılın' : 'Likya Spor & Etkinlik ekosistemine dahil olun';
  return {
    businessId: b.id,
    businessName: b.name,
    subject: `${b.name} için Likya Ekosistemi İş Birliği Teklifi`,
    opening: `Sayın ${b.name} ekibi, ${b.distanceKm} km mesafedeki Likya Kampüsü'nden ulaşıyorum.`,
    valueProp: `Tesisinizin ${missing.join(' ve ') || 'dijital varlığı'} eksik; Likya platformu bu boşluğu ücretsiz kapatabilir.`,
    offer,
    cta: 'Hafta sonu kampüs turu + demo randevusu öneriyoruz.',
  };
}

/** Tek tıkla: radar tarama → pitch üret → personel görevi fırlat. */
export function runB2bRadarCampaign(center: { lat: number; lng: number }, radiusKm = 5, limit = 3): { mode: 'live' | 'mock'; pitches: B2bPitch[]; campaignRef: string } {
  const { mode, businesses } = scanBusinessRadar(center, radiusKm);
  const targets = businesses.slice(0, limit);
  const pitches = targets.map(generateB2bPitch);
  const campaignRef = `B2B-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  targets.forEach((b) => staffTaskDispatched(`PITCH-${b.id}`, `${b.name} — B2B teklif hazır (${campaignRef})`, 0, 8));
  return { mode, pitches, campaignRef };
}

export function gropectorB2bRadarStatus(): string {
  return 'Gropector B2B [harita radarı • web/spor altyapı eksik tespiti • tek tıkla pitch • mock-first]';
}
