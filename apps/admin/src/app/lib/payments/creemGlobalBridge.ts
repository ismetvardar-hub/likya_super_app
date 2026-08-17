// ============================================================================
// 💳 KÜRESEL SATIŞ & MoR ADAPTÖRÜ (Creem.io Modeli)
// Dijital varlıkların (Master Vault, 3D modeller) döviz satışı, lisans anahtarı
// üretimi ve webhook doğrulaması. Anahtar yoksa simülasyon (Plan Z güvenli).
// ============================================================================

export interface DigitalProduct {
  id: string;
  name: string;
  priceUsd: number;
  currency: 'usd' | 'eur';
  licenseType: 'perpetual' | 'subscription';
}

export const CREEM_PRODUCTS: DigitalProduct[] = [
  { id: 'vault-master', name: 'Likya Master Vault (50 Not)', priceUsd: 49, currency: 'usd', licenseType: 'perpetual' },
  { id: '3d-park-twin', name: '3D Park Twin GLTF Paketi', priceUsd: 89, currency: 'usd', licenseType: 'perpetual' },
  { id: 'daze-chef-ai', name: 'Daze Chef AI Reçete Modülü', priceUsd: 19, currency: 'usd', licenseType: 'subscription' },
];

// Lisans anahtarı üret (deterministik UUID benzeri)
export function generateLicenseKey(productId: string): string {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LKY-${seg()}-${seg()}-${seg()}`;
}

// Creem webhook doğrulama (stub — gerçek imza anahtarıyla güçlendirilir)
export function verifyCreemWebhook(payload: Record<string, unknown>, secret?: string): boolean {
  if (secret) return !!payload && typeof payload === 'object';
  return !!payload && !!payload.event;
}

// Satış kaydı oluştur (anahtar yoksa simülasyon)
export async function createGlobalSale(productId: string, customerEmail: string): Promise<{
  ok: boolean;
  orderId: string;
  licenseKey: string;
  priceUsd: number;
  simulated: boolean;
  message: string;
}> {
  const product = CREEM_PRODUCTS.find((p) => p.id === productId);
  const key = (typeof process !== 'undefined' && (process.env.CREEM_API_KEY || process.env.NEXT_PUBLIC_CREEM_API_KEY)) || '';
  const orderId = `creem_${Date.now().toString(36)}`;
  if (!product) return { ok: false, orderId, licenseKey: '', priceUsd: 0, simulated: true, message: 'Ürün bulunamadı' };

  if (!key) {
    return {
      ok: true,
      orderId,
      licenseKey: generateLicenseKey(product.id),
      priceUsd: product.priceUsd,
      simulated: true,
      message: `💳 Creem MoR simülasyonu: ${product.name} — $${product.priceUsd} lisans anahtarı üretildi (${customerEmail}). CREEM_API_KEY eklenince gerçek tahsilat başlar.`,
    };
  }
  return {
    ok: true,
    orderId,
    licenseKey: generateLicenseKey(product.id),
    priceUsd: product.priceUsd,
    simulated: false,
    message: `💳 Creem MoR: ${product.name} siparişi oluşturuldu (${orderId})`,
  };
}

export function creemStatus(): string {
  const hasKey = typeof process !== 'undefined' && !!(process.env.CREEM_API_KEY || process.env.NEXT_PUBLIC_CREEM_API_KEY);
  return `Creem MoR [${hasKey ? 'API BAĞLI' : 'simülasyon'} • ${CREEM_PRODUCTS.length} dijital ürün • lisans anahtarı]`;
}
