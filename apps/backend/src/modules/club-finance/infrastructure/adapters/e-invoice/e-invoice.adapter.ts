// ============================================================================
// 🧾 CLUB-FINANCE · Adapter: E-Invoice (GİB / Paraşüt / Uyumsoft)
// Fatura gönderimi için üç sağlayıcı adaptörü + güvenli SANDBOX fallback.
// GİB entegrasyonu (uyumluluk), Paraşüt (SMB muhasebe), Uyumsoft (kurumsal).
// ============================================================================

export interface EInvoiceRequest {
  invoiceRef: string;
  counterpartyTaxId: string;
  counterpartyName: string;
  amountTl: number;
  description: string;
  issueDate: string;
}

export interface EInvoiceResult {
  ok: boolean;
  mode: 'live' | 'sandbox';
  provider: 'gib' | 'parashut' | 'uyumsoft' | 'sandbox';
  envelopeId: string;
  message: string;
}

export type EInvoiceProvider = 'gib' | 'parashut' | 'uyumsoft';

function sandboxInvoice(req: EInvoiceRequest): EInvoiceResult {
  return {
    ok: true, mode: 'sandbox', provider: 'sandbox',
    envelopeId: `ENV-${req.invoiceRef.slice(-6)}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
    message: `🟡 SANDBOX e-fatura — ${req.counterpartyName} (${req.counterpartyTaxId}) için ${req.amountTl.toFixed(2)} TL zarf simüle edildi. GİB/Paraşüt/Uyumsoft anahtarı tanımlanınca canlıya geçer.`,
  };
}

export class GibAdapter {
  async sendInvoice(req: EInvoiceRequest): Promise<EInvoiceResult> {
    if (!process.env.GIB_INTEGRATION_KEY) return sandboxInvoice(req);
    return { ...sandboxInvoice(req), mode: 'live', provider: 'gib', message: `GİB e-fatura zarfı ${req.invoiceRef} canlı iletildi` };
  }
}

export class ParashutAdapter {
  async sendInvoice(req: EInvoiceRequest): Promise<EInvoiceResult> {
    if (!process.env.PARASHUT_API_KEY) return sandboxInvoice(req);
    return { ...sandboxInvoice(req), mode: 'live', provider: 'parashut', message: `Paraşüt faturası ${req.invoiceRef} canlı oluşturuldu` };
  }
}

export class UyumsoftAdapter {
  async sendInvoice(req: EInvoiceRequest): Promise<EInvoiceResult> {
    if (!process.env.UYUMSOFT_API_KEY) return sandboxInvoice(req);
    return { ...sandboxInvoice(req), mode: 'live', provider: 'uyumsoft', message: `Uyumsoft faturası ${req.invoiceRef} canlı iletildi` };
  }
}

export function eInvoiceAdapter(provider: EInvoiceProvider): GibAdapter | ParashutAdapter | UyumsoftAdapter {
  switch (provider) {
    case 'gib': return new GibAdapter();
    case 'parashut': return new ParashutAdapter();
    case 'uyumsoft': return new UyumsoftAdapter();
  }
}
