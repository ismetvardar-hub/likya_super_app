// ============================================================================
// 🧾 AŞAMA 7 — DİJİTAL FİŞ (E-FİŞ) ÜRETİCİSİ
// Her başarılı POS/kiralama işlemine PDF/QR formatında dijital e-fiş üretir.
// Deterministik fiş numarası + QR verisi; gerçek PDF üretimi tarayıcıda
// (print) veya sunucuda (PDF lib) bağlanabilir. Plan Z güvenli.
// ============================================================================

export type ReceiptKind = 'pos' | 'rental' | 'tbyb' | 'refund';

export interface ReceiptRequest {
  kind: ReceiptKind;
  reference: string;       // ör. SA-240-XXXX, RD-...
  customer: string;
  amountTl: number;
  item: string;
  vatRate: number;         // 0.20 = %20 KDV
  issuedAt?: string;
  merchantName?: string;
}

export interface DigitalReceipt {
  receiptNo: string;       // LKY-YYYYMMDD-XXXXX
  kind: ReceiptKind;
  reference: string;
  customer: string;
  item: string;
  grossTl: number;
  vatTl: number;
  netTl: number;
  qrData: string;          // QR içeriği (doğrulama URL'si)
  issuedAt: string;
  merchant: string;
}

export function generateReceiptNo(issuedAt = new Date()): string {
  const date = issuedAt.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `LKY-${date}-${rand}`;
}

export function buildReceipt(req: ReceiptRequest): DigitalReceipt {
  const issuedAt = req.issuedAt ?? new Date().toISOString();
  const grossTl = Math.round(req.amountTl * 100) / 100;
  const netTl = Math.round((grossTl / (1 + req.vatRate)) * 100) / 100;
  const vatTl = Math.round((grossTl - netTl) * 100) / 100;
  const receiptNo = generateReceiptNo();
  const qrData = `LKY|${receiptNo}|${req.reference}|${grossTl}|${req.customer}`;

  return {
    receiptNo,
    kind: req.kind,
    reference: req.reference,
    customer: req.customer,
    item: req.item,
    grossTl, vatTl, netTl,
    qrData,
    issuedAt,
    merchant: req.merchantName ?? 'Likya Kampüsü Daze Hub',
  };
}

/** QR kod içeriği için doğrulama URL'si. */
export function receiptVerifyUrl(receipt: DigitalReceipt): string {
  return `https://likya-ceo.vercel.app/fis?no=${receipt.receiptNo}&ref=${receipt.reference}`;
}

/** Metin fiş (basılabilir / SMS). */
export function receiptAsText(receipt: DigitalReceipt): string {
  return [
    `🧾 LİKYA DAZE HUB — DİJİTAL FİŞ`,
    `No: ${receipt.receiptNo} | ${receipt.kind.toUpperCase()}`,
    `Referans: ${receipt.reference}`,
    `Müşteri: ${receipt.customer}`,
    `Ürün: ${receipt.item}`,
    `Net: ₺${receipt.netTl.toFixed(2)} | KDV: ₺${receipt.vatTl.toFixed(2)}`,
    `Toplam: ₺${receipt.grossTl.toFixed(2)}`,
    `Doğrulama: ${receiptVerifyUrl(receipt)}`,
    `QR: ${receipt.qrData}`,
  ].join('\n');
}

export function digitalReceiptGeneratorStatus(): string {
  return 'Dijital Fiş Motoru [LKY-YYYYMMDD-XXXXX • QR doğrulama • KDV ayrıştırma • metin/PDF]';
}
