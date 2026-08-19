// ============================================================================
// 🧮 AŞAMA 9 — DİNAMİK KOMİSYON VE HAKEDİŞ DAĞITIM MODÜLÜ
// Eğitmen, personel ve tesis ortaklarının paylarını hesaplar ve cüzdanlarına
// aktarır. Deterministik oranlama; Plan Z güvenli (oran sıfır → pay yok).
// ============================================================================

export type ShareRecipientType = 'trainer' | 'staff' | 'partner' | 'club';

export interface ShareRecipient {
  recipientId: string;
  type: ShareRecipientType;
  name: string;
  rate: number;            // 0-1 pay oranı
}

export interface CommissionInput {
  transactionRef: string;
  grossTl: number;
  platformFeeRate: number;   // 0-1 platform kesintisi (bakiye üzerinden)
  recipients: ShareRecipient[];
}

export interface CommissionResult {
  transactionRef: string;
  platformFeeTl: number;
  distributableTl: number;
  shares: { recipientId: string; type: ShareRecipientType; name: string; amountTl: number; walletCreditRef: string }[];
  totalDistributedTl: number;
  ok: boolean;
}

/** Oranları normalleştirir (toplam 1'i aşarsa orantısal ölçekleme). */
export function normalizeRates(recipients: ShareRecipient[]): ShareRecipient[] {
  const total = recipients.reduce((a, r) => a + Math.max(0, Math.min(1, r.rate)), 0);
  if (total === 0) return recipients.map((r) => ({ ...r, rate: 0 }));
  return recipients.map((r) => ({ ...r, rate: Math.max(0, Math.min(1, r.rate)) / total }));
}

export function distributeCommission(input: CommissionInput): CommissionResult {
  const platformFeeTl = Math.round(input.grossTl * Math.max(0, Math.min(1, input.platformFeeRate)) * 100) / 100;
  const distributableTl = Math.round((input.grossTl - platformFeeTl) * 100) / 100;
  const normalized = normalizeRates(input.recipients);

  const shares = normalized.map((r) => {
    const amountTl = Math.round(distributableTl * r.rate * 100) / 100;
    return {
      recipientId: r.recipientId,
      type: r.type,
      name: r.name,
      amountTl,
      walletCreditRef: `WK-${input.transactionRef.slice(-5)}-${r.recipientId.slice(0, 4)}`,
    };
  });

  const totalDistributedTl = Math.round(shares.reduce((a, s) => a + s.amountTl, 0) * 100) / 100;
  return { transactionRef: input.transactionRef, platformFeeTl, distributableTl, shares, totalDistributedTl, ok: true };
}

export function commissionDistributionEngineStatus(): string {
  return 'Komisyon Motoru [eğitmen/personel/ortak payları • oran normalizasyonu • cüzdan kredisi]';
}
