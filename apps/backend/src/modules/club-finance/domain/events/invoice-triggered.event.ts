// ============================================================================
// 📣 CLUB-FINANCE · Domain Event: InvoiceTriggeredEvent
// Fatura tetiklendiğinde (e-fatura adaptörlerine yönlendirme için) yayınlanır.
// ============================================================================

import type { Money } from '../value-objects/money';

export type InvoiceSource = 'SUB_LEASE' | 'COMMERCIAL_SALE' | 'DIRECTOR_LOAN_INTEREST' | 'OTHER';

export class InvoiceTriggeredEvent {
  readonly type = 'InvoiceTriggered' as const;
  readonly occurredAt: string;

  constructor(
    readonly invoiceRef: string,
    readonly source: InvoiceSource,
    readonly counterparty: string,
    readonly amount: Money,
  ) {
    this.occurredAt = new Date().toISOString();
  }

  toJSON(): Record<string, unknown> {
    return { type: this.type, invoiceRef: this.invoiceRef, source: this.source, counterparty: this.counterparty, amountTl: this.amount.tl, occurredAt: this.occurredAt };
  }
}
