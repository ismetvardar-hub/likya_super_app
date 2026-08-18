// ============================================================================
// 🏦 CLUB-FINANCE · Domain Value Object: BankTransactionType
// Açık bankacılık / POS akışlarında işlem tipi sınıflandırması.
// ============================================================================

export const BANK_TRANSACTION_TYPES = [
  'IBAN_TRANSFER',     // havale (gelen/giden)
  'VIRMAN',            // aynı banka içi virman
  'POS_SALE',          // sanal/mobil POS satış
  'POS_REFUND',        // iade
  'WEBHOOK_DEBIT',     // webhook ile borç bildirimi
  'WEBHOOK_CREDIT',    // webhook ile alacak bildirimi
] as const;

export type BankTransactionType = (typeof BANK_TRANSACTION_TYPES)[number];

export function isBankTransactionType(raw: string): raw is BankTransactionType {
  return (BANK_TRANSACTION_TYPES as readonly string[]).includes(raw);
}

export function parseBankTransactionType(raw: string): BankTransactionType {
  if (!isBankTransactionType(raw)) throw new Error(`Bilinmeyen banka işlem tipi: "${raw}"`);
  return raw;
}
