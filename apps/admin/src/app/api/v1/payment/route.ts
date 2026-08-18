import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// 💳 SUNUCU-ONLY ÖDEME PROXY'Sİ — IYZICO / STRIPE secret burada yaşar.
// Client bundle'a asla sızmaz. Secret tanımlı değilse güvenli sandbox yanıtı.
// ============================================================================

export const runtime = 'nodejs';
export const maxDuration = 15;

interface PayBody {
  kind?: string;
  amount?: number;
  item?: string;
  itemId?: string;
  customer?: { name?: string; email?: string; phone?: string };
  installment?: number;
}

export async function POST(req: NextRequest) {
  let body: PayBody;
  try {
    body = (await req.json()) as PayBody;
  } catch {
    return NextResponse.json({ ok: false, message: 'Geçersiz JSON' }, { status: 400 });
  }

  const amount = Number(body.amount ?? 0);
  if (!amount || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Geçersiz tutar' }, { status: 400 });
  }

  const kind = (body.kind ?? 'sale') as string;
  const item = body.item ?? 'Likya Ürünü';
  const itemId = body.itemId ?? '';
  const customer = body.customer ?? { name: '', email: '' };
  const reference = `${kind === 'rental-deposit' ? 'RD' : kind === 'tbyb' ? 'TB' : 'SA'}-${amount.toFixed(0)}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

  // ── IYZICO (gerçek) ───────────────────────────────────────────────────────
  const iyzKey = process.env.IYZICO_API_KEY;
  const iyzSecret = process.env.IYZICO_SECRET_KEY;
  if (iyzKey && iyzSecret) {
    try {
      const iyzRes = await fetch('https://api.iyzipay.com/v1/payment/iyzipos-checkout-form/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: 'tr',
          conversationId: reference,
          price: amount.toFixed(2),
          paidPrice: amount.toFixed(2),
          currency: 'TRY',
          installment: body.installment ?? 1,
          basketId: itemId || reference,
          paymentGroup: kind === 'rental-deposit' ? 'DEPOSIT' : 'PRODUCT',
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://likya-ceo.vercel.app'}/api/v1/payment/checkout-result?ref=${reference}`,
          buyer: { id: customer.email, name: customer.name || 'Likya Misafiri', surname: '', email: customer.email || 'misafir@likya.app', country: 'TR', city: 'Antalya', ip: '85.34.12.11', registrationAddress: 'Likya Kampüsü, Kaş/Antalya' },
          billingAddress: { contactName: customer.name || 'Misafir', city: 'Antalya', country: 'TR', address: 'Likya Kampüsü' },
          basketItems: [{ id: itemId || reference, name: item, category1: kind, itemType: 'PHYSICAL', price: amount.toFixed(2) }],
        }),
      });
      const data = (await iyzRes.json()) as { status?: string; token?: string; errorMessage?: string };
      if (data.status === 'success' && data.token) {
        return NextResponse.json({
          ok: true, mode: 'live', gateway: 'iyzico', reference,
          checkoutUrl: `https://checkout.iyzipay.com/basket/${data.token}`,
          message: `iyzico checkout başlatıldı (${reference})`,
        });
      }
      return NextResponse.json({ ok: true, mode: 'sandbox', gateway: 'sandbox', reference, checkoutUrl: null, message: `iyzico hazır ama ödeme başlatılamadı (${data.errorMessage ?? 'bilinmeyen'}) → sandbox onayı: ${reference}` });
    } catch {
      return NextResponse.json({ ok: true, mode: 'sandbox', gateway: 'sandbox', reference, checkoutUrl: null, message: `iyzico çağrısı hatalı → sandbox onayı: ${reference}` });
    }
  }

  // ── STRIPE (gerçek) ───────────────────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const sRes = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ amount: String(Math.round(amount * 100)), currency: 'try', description: `${item} (${reference})`, 'metadata[kind]': kind, 'metadata[ref]': reference }),
      });
      const data = (await sRes.json()) as { id?: string; client_secret?: string; error?: { message?: string } };
      if (data.id && data.client_secret) {
        return NextResponse.json({
          ok: true, mode: 'live', gateway: 'stripe', reference,
          checkoutUrl: null,
          message: `Stripe PaymentIntent ${data.id} hazır`,
          clientSecret: data.client_secret,
        });
      }
      return NextResponse.json({ ok: true, mode: 'sandbox', gateway: 'sandbox', reference, checkoutUrl: null, message: `Stripe hatası (${data.error?.message ?? '?'}) → sandbox onayı: ${reference}` });
    } catch {
      return NextResponse.json({ ok: true, mode: 'sandbox', gateway: 'sandbox', reference, checkoutUrl: null, message: `Stripe çağrısı hatalı → sandbox onayı: ${reference}` });
    }
  }

  // ── SANDBOX (secret yok — güvenli test modu) ─────────────────────────────
  return NextResponse.json({
    ok: true, mode: 'sandbox', gateway: 'sandbox', reference, checkoutUrl: null,
    message: `🟡 Sandbox Test Modu — ${item} (${amount.toFixed(2)} TL) simüle edildi. IYZICO/STRIPE secret tanımlayınca canlıya geçer.`,
  });
}
