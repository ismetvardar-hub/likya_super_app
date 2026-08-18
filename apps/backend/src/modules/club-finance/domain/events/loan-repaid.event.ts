// ============================================================================
// 📣 CLUB-FINANCE · Domain Event: LoanRepaidEvent
// Ortak kredisinin bir taksidi ödendiğinde yayınlanır.
// ============================================================================

import type { DirectorLoan, LoanInstallment } from '../entities/director-loan';
import type { Money } from '../value-objects/money';

export class LoanRepaidEvent {
  readonly type = 'LoanRepaid' as const;
  readonly occurredAt: string;

  constructor(
    readonly loan: DirectorLoan,
    readonly installment: LoanInstallment,
    readonly remainingDebt: Money,
  ) {
    this.occurredAt = new Date().toISOString();
  }

  toJSON(): Record<string, unknown> {
    return { type: this.type, loanId: this.loan.id, directorId: this.loan.directorId, installmentDue: this.installment.dueDate, remainingDebtTl: this.remainingDebt.tl, occurredAt: this.occurredAt };
  }
}
