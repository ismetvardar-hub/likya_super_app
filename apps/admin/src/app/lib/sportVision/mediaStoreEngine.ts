// ============================================================================
// 🎬 LİKYA MEDYA ÜRÜN KASASI & SATIŞ MOTORU (Media Commerce)
// 4K klip/fotoğraf paketleri • Çift fiyatlandırma (TL/USD + XP/Token)
// • Daze-Gift sadakat kataloğu (redeemWithPoints)
// ============================================================================

export type MediaProductType =
  | 'VIRAL_REELS_CLIP'
  | 'BIOMECHANICS_ANALYSIS_VIDEO'
  | 'ACTION_PHOTO_PACK'
  | 'FULL_MATCH_ARCHIVE';

export interface MediaProduct {
  id: string;
  type: MediaProductType;
  name: string;
  icon: string;
  description: string;
  duration: string;
  priceTL: number;
  priceUSD: number;
  pointsXP: number;   // XP ile ücretsiz talep maliyeti
}

// Ürün kataloğu
export const MEDIA_CATALOG: MediaProduct[] = [
  {
    id: 'reels',
    type: 'VIRAL_REELS_CLIP',
    name: 'Viral Reels Klibi',
    icon: '🎬',
    description: '15-30 sn • müzik + hız göstergesi + Likya logosu • WhatsApp hazır',
    duration: '15-30 sn',
    priceTL: 150,
    priceUSD: 5,
    pointsXP: 500,
  },
  {
    id: 'biomech',
    type: 'BIOMECHANICS_ANALYSIS_VIDEO',
    name: 'Biyomekanik Analiz Videosu',
    icon: '🧬',
    description: 'Ghost Avatar açı karşılaştırması + detaylı teknik video',
    duration: '2-3 dk',
    priceTL: 250,
    priceUSD: 9,
    pointsXP: 1000,
  },
  {
    id: 'photos',
    type: 'ACTION_PHOTO_PACK',
    name: '4K Aksiyon Fotoğraf Paketi',
    icon: '📸',
    description: '5-10 adet 4K yüksek çözünürlük an fotoğrafı',
    duration: '5-10 kare',
    priceTL: 100,
    priceUSD: 4,
    pointsXP: 350,
  },
  {
    id: 'archive',
    type: 'FULL_MATCH_ARCHIVE',
    name: '4K Maç Arşivi',
    icon: '🏟️',
    description: '60 dk geniş açı taktiksel tam maç kaydı',
    duration: '60 dk',
    priceTL: 350,
    priceUSD: 12,
    pointsXP: 1500,
  },
];

export interface RedemptionResult {
  success: boolean;
  product?: MediaProduct;
  costXP: number;
  remainingXP: number;
  message: string;
}

// ----------------------------------------------------------------------------
// 🎁 DAZE-GIFT — XP/Token ile ücretsiz medya talep etme
// ----------------------------------------------------------------------------
export function redeemWithPoints(product: MediaProduct, currentXP: number): RedemptionResult {
  if (currentXP >= product.pointsXP) {
    return {
      success: true,
      product,
      costXP: product.pointsXP,
      remainingXP: currentXP - product.pointsXP,
      message: `🎁 ${product.name} Daze-Gift ile talep edildi! (${product.pointsXP} XP harcandı, kalan ${currentXP - product.pointsXP} XP)`,
    };
  }
  return {
    success: false,
    costXP: product.pointsXP,
    remainingXP: currentXP,
    message: `⚠️ Yetersiz XP — ${product.name} için ${product.pointsXP} XP gerekli, mevcut: ${currentXP} XP. (${product.pointsXP - currentXP} XP eksik)`,
  };
}

// ----------------------------------------------------------------------------
// 💳 NAKİT SATIN ALMA (mock — gerçek ödeme entegrasyonu sonra)
// ----------------------------------------------------------------------------
export interface PurchaseResult {
  success: boolean;
  product: MediaProduct;
  method: 'card' | 'mobile';
  totalTL: number;
  message: string;
}

export function purchaseWithCash(product: MediaProduct, method: 'card' | 'mobile' = 'card'): PurchaseResult {
  return {
    success: true,
    product,
    method,
    totalTL: product.priceTL,
    message: `✅ ${product.name} ${method === 'card' ? 'kredi kartı' : 'mobil ödeme'} ile satın alındı — ${product.priceTL} TL (${product.priceUSD}$). Filigransız 4K indirme başladı!`,
  };
}

// Fiyat biçimlendirme
export function formatPrice(product: MediaProduct, currency: 'TL' | 'USD'): string {
  return currency === 'TL' ? `${product.priceTL} TL` : `$${product.priceUSD}`;
}
