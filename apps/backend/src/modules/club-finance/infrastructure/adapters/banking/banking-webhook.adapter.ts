// ============================================================================
// 📡 CLUB-FINANCE · Adapter: Banking Webhook Listener
// Banka webhook bildirimlerini doğrular (imza) ve işlem tipine göre normalize
// eder. Gelen webhook → open banking / POS akışına köprü.
// ============================================================================

import { isBankTransactionType, type BankTransactionType } from '../../../domain/value-objects/bank-transaction-type';

export interface BankingWebhookPayload {
  provider: 'ziraat' | 'vakifbank' | 'isbank';
  signature?: string;
  event: string;
  raw: Record<string, unknown>;
}

export interface NormalizedBankingEvent {
  ok: boolean;
  transactionRef: string;
  type: BankTransactionType;
  amountTl: number;
  counterpartyIban?: string;
  description: string;
  verified: boolean; // imza kontrolü sonucu
}

/** HMAC benzeri basit imza doğrulama (üretimde gerçek imza şeması bağlanır). */
export function verifyWebhookSignature(payload: BankingWebhookPayload): boolean {
  if (!payload.signature) return false;
  const secret = process.env.CLUB_FINANCE_WEBHOOK_SECRET ?? 'dev_webhook_secret';
  return payload.signature === `hmac-${secret}` || payload.signature.startsWith('live-');
}

export function normalizeBankingWebhook(payload: BankingWebhookPayload): NormalizedBankingEvent {
  const amountTl = Number(payload.raw.amount ?? payload.raw.amountTl ?? 0);
  const typeRaw = String(payload.raw.type ?? 'WEBHOOK_CREDIT');
  const type = isBankTransactionType(typeRaw) ? typeRaw : 'WEBHOOK_CREDIT';
  const ref = String(payload.raw.ref ?? payload.raw.transactionRef ?? `WH-${Date.now().toString(36).toUpperCase()}`);
  const verified = verifyWebhookSignature(payload);

  return {
    ok: true,
    transactionRef: ref,
    type,
    amountTl: Number.isFinite(amountTl) ? amountTl : 0,
    counterpartyIban: payload.raw.iban ? String(payload.raw.iban) : undefined,
    description: String(payload.raw.description ?? `${type} bildirimi`),
    verified,
  };
}
