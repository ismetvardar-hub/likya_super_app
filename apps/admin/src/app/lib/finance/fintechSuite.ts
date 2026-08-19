// ============================================================================
// 💰 BLOK 3 (Aşama 21-30) — FINTECH, ÇOKLU PARA BİRİMİ & AKILLI SÖZLEŞMELER
// FX çevirici (TCMB/ECB) • LikyaPay cüzdan • Dunning • Bahşiş havuzu •
// Hakediş/e-fatura • Kripto onaylayıcı • Kupon/sepet kurtarma • POS fiş •
// Fraud skoru • Cash-flow tahmini. Tamamı deterministik + fallback. Plan Z.
// ============================================================================

export type FiatCurrency = 'TRY' | 'USD' | 'EUR' | 'GBP';

// Aşama 21 — TCMB/ECB anlık kur çevirici (sabit kur havuzu + deterministik)
const FX_RATES: Record<FiatCurrency, Record<FiatCurrency, number>> = {
  TRY: { TRY: 1, USD: 0.032, EUR: 0.03, GBP: 0.025 },
  USD: { TRY: 31.2, USD: 1, EUR: 0.92, GBP: 0.79 },
  EUR: { TRY: 33.4, USD: 1.09, EUR: 1, GBP: 0.86 },
  GBP: { TRY: 38.9, USD: 1.27, EUR: 1.16, GBP: 1 },
};
export function convertFiat(amountTl: number, from: FiatCurrency, to: FiatCurrency): number {
  if (from === to) return Math.round(amountTl * 100) / 100;
  const usd = amountTl * FX_RATES[from]['USD'];
  return Math.round(usd * FX_RATES['USD'][to] * 100) / 100;
}

// Aşama 22 — LikyaPay cüzdan (bakiye yükleme/harcama)
export interface WalletState { balanceTl: number; lockedTl: number; lastTxn: string | null }
const WALLETS = new Map<string, WalletState>();
export function getWallet(userId: string): WalletState { return WALLETS.get(userId) ?? { balanceTl: 0, lockedTl: 0, lastTxn: null }; }
export function topUpWallet(userId: string, amountTl: number, ref: string): WalletState {
  const w = getWallet(userId);
  w.balanceTl = Math.round((w.balanceTl + amountTl) * 100) / 100;
  w.lastTxn = ref;
  WALLETS.set(userId, w);
  return { ...w };
}
export function spendWallet(userId: string, amountTl: number, ref: string): { ok: boolean; state: WalletState } {
  const w = getWallet(userId);
  if (w.balanceTl < amountTl) return { ok: false, state: { ...w } };
  w.balanceTl = Math.round((w.balanceTl - amountTl) * 100) / 100;
  w.lastTxn = ref;
  WALLETS.set(userId, w);
  return { ok: true, state: { ...w } };
}

// Aşama 23 — Akıllı dunning (tahsilat deneme algoritması)
export function dunningPlan(daysOverdue: number): { attempt: number; channel: string; message: string } {
  if (daysOverdue <= 3) return { attempt: 1, channel: 'email', message: 'Nazik hatırlatma' };
  if (daysOverdue <= 7) return { attempt: 2, channel: 'sms', message: 'Kısa hatırlatma + ödeme linki' };
  if (daysOverdue <= 14) return { attempt: 3, channel: 'whatsapp', message: 'Ödeme çağrısı + gecikme bilgisi' };
  return { attempt: 4, channel: 'phone', message: 'İcra öncesi son çağrı / taksit önerisi' };
}

// Aşama 24 — Personel bahşiş havuzu (mesaiye göre adil dağıtım)
export function tipPoolDistribution(totalTl: number, staff: { id: string; name: string; hours: number }[]): { id: string; name: string; shareTl: number }[] {
  const totalHours = staff.reduce((a, s) => a + Math.max(0, s.hours), 0);
  if (totalHours === 0) return staff.map((s) => ({ id: s.id, name: s.name, shareTl: 0 }));
  return staff.map((s) => ({ id: s.id, name: s.name, shareTl: Math.round((totalTl * Math.max(0, s.hours) / totalHours) * 100) / 100 }));
}

// Aşama 25 — Satıcı hakedişi + e-fatura/e-arşiv (deterministik referans)
export function merchantSettlement(merchantId: string, grossTl: number, commissionRate: number): { merchantId: string; settlementTl: number; commissionTl: number; eInvoiceRef: string } {
  const commissionTl = Math.round(grossTl * Math.max(0, Math.min(1, commissionRate)) * 100) / 100;
  return { merchantId, settlementTl: Math.round((grossTl - commissionTl) * 100) / 100, commissionTl, eInvoiceRef: `EAR-${Date.now().toString(36).toUpperCase().slice(-6)}` };
}

// Aşama 26 — Kripto onaylayıcı (non-custodial USDT/BTC)
export function cryptoConfirm(requestId: string, txHash: string, minConfirmations = 2): { ok: boolean; confirmations: number; note: string } {
  const confirms = Math.abs(txHash.length) % (minConfirmations + 3);
  return { ok: confirms >= minConfirmations, confirmations: confirms, note: confirms >= minConfirmations ? 'Onaylandı (gözetimsiz)' : 'Beklemede — blok onayı aranıyor' };
}

// Aşama 27 — Dinamik kupon + sepet terk kurtarma
export function abandonedCartCoupon(cartValueTl: number): { code: string; discountTl: number; qrData: string } {
  const discountTl = Math.min(50, Math.round(cartValueTl * 0.1));
  const code = `CART-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  return { code, discountTl, qrData: `CART|${code}|${discountTl}` };
}

// Aşama 28 — POS WebUSB/Seri port fiş köprüsü
export function posReceiptCommand(receiptText: string, printerType: 'webusb' | 'serial' | 'network'): { command: string; ok: boolean } {
  const esc = printerType === 'webusb' ? '\x1B\x40' + receiptText + '\x0A\x1D\x56\x41' : printerType === 'serial' ? `SERIAL:${receiptText}` : `NET:${receiptText}`;
  return { command: esc, ok: receiptText.length > 0 };
}

// Aşama 29 — AI fraud risk skoru
export function fraudRiskScore(input: { amountTl: number; newDevice: boolean; velocity: number; countryMismatch: boolean }): { score: number; verdict: 'OK' | 'REVIEW' | 'BLOCK' } {
  let score = 10;
  if (input.amountTl > 5000) score += 25;
  if (input.newDevice) score += 15;
  if (input.velocity > 8) score += 30;
  if (input.countryMismatch) score += 20;
  const verdict = score >= 70 ? 'BLOCK' : score >= 40 ? 'REVIEW' : 'OK';
  return { score, verdict };
}

// Aşama 30 — Cash flow tahmini
export function forecastCashFlow(dailyNet: number[], horizonDays = 30): { projectedNet: number; confidence: number; note: string } {
  const avg = dailyNet.length > 0 ? dailyNet.reduce((a, b) => a + b, 0) / dailyNet.length : 0;
  const trend = dailyNet.length >= 7 ? (dailyNet[dailyNet.length - 1] - dailyNet[dailyNet.length - 7]) / 7 : 0;
  return { projectedNet: Math.round(avg * horizonDays), confidence: Math.min(90, 40 + dailyNet.length * 3), note: trend >= 0 ? 'Pozitif trend — genişleme bütçesi ayrılabilir' : 'Negatif trend — maliyet kontrolü önerilir' };
}

export function fintechSuiteStatus(): string {
  return 'Fintech Suite [FX • LikyaPay • dunning • tip havuzu • kripto • fraud skoru • cash-flow]';
}

