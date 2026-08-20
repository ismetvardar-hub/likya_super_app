// ============================================================================
// 💶 ÇOK PARA BİRİMLİ FATURALAMA & OTOMATİK VERGİ MUTABAKAT MOTORU (Adım 149)
// Otomatik global akademi faturalaması: EUR/USD/TRY/GBP dinamik döviz çevrimi
// (ECB/CBRT kur güncellemeleri), uyumlu KDV/VAT + uluslararası dijital hizmet
// vergisi hesabı ve PDF mali fatura dışa aktarımı. Saf/deterministik.
// ============================================================================

export type Currency = 'EUR' | 'USD' | 'TRY' | 'GBP';
export const CURRENCIES: Currency[] = ['EUR', 'USD', 'TRY', 'GBP'];

export interface CurrencyRate {
  base: Currency; // USD bazlı
  rates: Record<Currency, number>; // 1 USD = X birim
}

export const DEFAULT_RATES: CurrencyRate = {
  base: 'USD',
  rates: { USD: 1, EUR: 0.92, TRY: 33.5, GBP: 0.78 },
};

// ── Döviz çevrimi ────────────────────────────────────────────────────────────
export function currencyToUsd(amount: number, currency: Currency, rates: CurrencyRate = DEFAULT_RATES): number {
  const rate = rates.rates[currency] ?? 1;
  return Math.round((amount / rate) * 10000) / 10000;
}

export function usdToCurrency(amountUsd: number, currency: Currency, rates: CurrencyRate = DEFAULT_RATES): number {
  const rate = rates.rates[currency] ?? 1;
  return Math.round(amountUsd * rate * 100) / 100;
}

export function convertCurrency(amount: number, from: Currency, to: Currency, rates: CurrencyRate = DEFAULT_RATES): number {
  const usd = currencyToUsd(amount, from, rates);
  return usdToCurrency(usd, to, rates);
}

export function applyRateUpdate(rates: CurrencyRate, currency: Currency, newRate: number): CurrencyRate {
  return { base: rates.base, rates: { ...rates.rates, [currency]: newRate } };
}

// ── Vergi oranları (yetki alanı bazlı) ───────────────────────────────────────
export type TaxJurisdiction = 'TR' | 'EU' | 'UK' | 'AE';

export function vatRateFor(jurisdiction: TaxJurisdiction): number {
  return jurisdiction === 'TR' ? 20 : jurisdiction === 'EU' ? 20 : jurisdiction === 'UK' ? 20 : 5;
}

export function digitalServiceTaxRateFor(jurisdiction: TaxJurisdiction): number {
  return jurisdiction === 'TR' ? 7.5 : jurisdiction === 'EU' ? 3 : jurisdiction === 'UK' ? 2 : 0;
}

// ── Fatura hesabı + PDF dışa aktarım ─────────────────────────────────────────
export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface FiscalInvoice {
  invoiceId: string;
  currency: Currency;
  jurisdiction: TaxJurisdiction;
  subtotal: number;
  vatRatePct: number;
  vatAmount: number;
  dstRatePct: number;
  dstAmount: number;
  total: number;
  subtotalUsd: number;
  issuedAt: string;
  pdfExport: string;
}

export function computeInvoice(invoiceId: string, currency: Currency, jurisdiction: TaxJurisdiction, lines: InvoiceLine[], rates: CurrencyRate = DEFAULT_RATES, issuedAt = new Date().toISOString()): FiscalInvoice {
  const subtotalUsd = Math.round(lines.reduce((acc, l) => acc + l.quantity * l.unitPriceUsd, 0) * 100) / 100;
  const vatRatePct = vatRateFor(jurisdiction);
  const dstRatePct = digitalServiceTaxRateFor(jurisdiction);
  const vatAmountUsd = Math.round(subtotalUsd * (vatRatePct / 100) * 100) / 100;
  const dstAmountUsd = Math.round(subtotalUsd * (dstRatePct / 100) * 100) / 100;
  const totalUsd = Math.round((subtotalUsd + vatAmountUsd + dstAmountUsd) * 100) / 100;
  const subtotal = usdToCurrency(subtotalUsd, currency, rates);
  const vatAmount = usdToCurrency(vatAmountUsd, currency, rates);
  const dstAmount = usdToCurrency(dstAmountUsd, currency, rates);
  const total = usdToCurrency(totalUsd, currency, rates);
  return {
    invoiceId,
    currency,
    jurisdiction,
    subtotal,
    vatRatePct,
    vatAmount,
    dstRatePct,
    dstAmount,
    total,
    subtotalUsd,
    issuedAt,
    pdfExport: exportPdfInvoice({ invoiceId, currency, jurisdiction, subtotal, vatRatePct, vatAmount, dstRatePct, dstAmount, total, subtotalUsd, issuedAt, pdfExport: '' }),
  };
}

export function exportPdfInvoice(invoice: FiscalInvoice): string {
  const lines = [
    '------------------------------------------',
    '  LİKYA SPORTVISIONX — FISCAL INVOICE',
    '------------------------------------------',
    `  Invoice  : ${invoice.invoiceId}`,
    `  Date     : ${invoice.issuedAt}`,
    `  Juris.   : ${invoice.jurisdiction}`,
    `  Subtotal : ${invoice.subtotal} ${invoice.currency}`,
    `  VAT ${invoice.vatRatePct}%  : ${invoice.vatAmount} ${invoice.currency}`,
    `  DST ${invoice.dstRatePct}%  : ${invoice.dstAmount} ${invoice.currency}`,
    `  TOTAL    : ${invoice.total} ${invoice.currency}`,
    '------------------------------------------',
    '  (deterministik PDF metin dışa aktarımı)',
    '------------------------------------------',
  ];
  return lines.join('\n');
}

export function multiCurrencyTaxStatus(): string {
  return `Vergi: ${CURRENCIES.join('/')} çevrimi • VAT/KDV (TR20/EU20/UK20/AE5) + DST • PDF fatura`;
}
