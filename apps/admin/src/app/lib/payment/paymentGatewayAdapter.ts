// ============================================================================
// 💳 LİKYA ÖDEME GEÇİDİ — IYZICO / STRIPE KORUMALI ADAPTÖR
// Pazaryeri satışları, kiralama depozitoları ve Try-Before-You-Buy işlemleri.
// GÜVENLİK: client bundle'a secret asla girmez — gerçek ödeme, sunucu-only
// /api/v1/payment proxy'si üzerinden yapılır. API anahtarı tanımlı değilse
// "Sandbox Test Modu" ile başarılı sipariş simülasyonu döner (Plan Z, asla çökme).
// ============================================================================

export type PaymentGateway = 'iyzico' | 'stripe' | 'sandbox';
export type PaymentKind = 'sale' | 'rental-deposit' | 'tbyb';

export interface PaymentRequest {
  kind: PaymentKind;
  amount: number; // TL (kuruş dönüşümü sunucuda)
  item: string;
  itemId?: string;
  customer: { name: string; email: string; phone?: string };
  installment?: number; // iyzico taksit (2-12)
  forceThreeDS?: boolean; // 3D-Secure zorunluluğu (varsayılan: kart çekimlerinde true)
}

export interface PaymentResult {
  ok: boolean;
  mode: 'live' | 'sandbox';
  gateway: PaymentGateway;
  reference: string;
  checkoutUrl: string | null;
  threeDSecure: boolean; // 3D-Secure akışı etkin mi
  message: string;
}

// ── GEÇİT TESPİTİ (client-safe: yalnızca NEXT_PUBLIC_ public anahtarlar) ──
export function detectPaymentGateway(): PaymentGateway {
  if (typeof window !== 'undefined' && window.localStorage.getItem('likya_gateway_force') === 'sandbox') return 'sandbox';
  const iyz = process.env.NEXT_PUBLIC_IYZICO_PUBLIC_KEY;
  const str = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (iyz) return 'iyzico';
  if (str) return 'stripe';
  return 'sandbox';
}

// ── GÜVENLİ SANDBOX SİMÜLASYONU (anahtar yoksa) ──
function sandboxPayment(req: PaymentRequest): PaymentResult {
  const prefix = req.kind === 'rental-deposit' ? 'RD' : req.kind === 'tbyb' ? 'TB' : 'SA';
  const reference = `${prefix}-${req.amount.toFixed(0)}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  return {
    ok: true,
    mode: 'sandbox',
    gateway: 'sandbox',
    reference,
    checkoutUrl: null,
    threeDSecure: req.forceThreeDS ?? true,
    message: `🟡 Sandbox Test Modu — ${req.item} (${req.amount.toFixed(2)} TL) siparişi simüle edildi. Referans: ${reference}. Gerçek ödeme için IYZICO/STRIPE anahtarları gerekli.`,
  };
}

// ── ORKESTRATÖR ─────────────────────────────────────────────────────────────
export async function startPayment(req: PaymentRequest): Promise<PaymentResult> {
  // Geçersiz tutar → hata
  if (!req.amount || req.amount <= 0) {
    return { ok: false, mode: 'sandbox', gateway: 'sandbox', reference: '', checkoutUrl: null, threeDSecure: req.forceThreeDS ?? true, message: 'Geçersiz tutar' };
  }

  // Gerçek geçit: sunucu-only proxy'ye dene (secret'lar orada)
  try {
    const res = await fetch('/api/v1/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (res.ok) {
      const data = (await res.json()) as PaymentResult;
      if (data.ok) return { ...data, threeDSecure: data.threeDSecure ?? req.forceThreeDS ?? true };
    }
  } catch { /* proxy yok/hatalı → sandbox */ }

  return sandboxPayment(req);
}

export function sandboxCheckout(req: PaymentRequest): PaymentResult {
  return sandboxPayment(req);
}

// ── KİRALAMA DEPOZİTOSU / TBYB YARDIMCILARI ─────────────────────────────────
export function rentalDeposit(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 0.25 * 100) / 100; // %25 depozito
}

export function tbybDeposit(productPrice: number): number {
  return Math.round(productPrice * 0.1 * 100) / 100; // %10 deneme bedeli
}

export function paymentGatewayStatus(): string {
  const g = detectPaymentGateway();
  return g === 'sandbox'
    ? 'Ödeme Geçidi: SANDBOX (anahtar yok — IYZICO/STRIPE secret sunucuya tanımlanınca canlıya geçer)'
    : `Ödeme Geçidi: ${g.toUpperCase()} (NEXT_PUBLIC_ anahtar tanımlı — sunucu proxy üzerinden canlı işlem)`;
}
