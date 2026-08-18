// ============================================================================
// 📣 CLUB-FINANCE · Domain Event: PayrollGeneratedEvent
// Çift bordro (dual payroll) oluşturulduğunda yayınlanır.
// ============================================================================

import type { PayrollSplit } from '../entities/payroll-split';

export class PayrollGeneratedEvent {
  readonly type = 'PayrollGenerated' as const;
  readonly occurredAt: string;

  constructor(
    readonly split: PayrollSplit,
    readonly clubShareTl: number,
    readonly commercialShareTl: number,
  ) {
    this.occurredAt = new Date().toISOString();
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type, splitId: this.split.id, employeeId: this.split.employeeId, month: this.split.month,
      clubShareTl: this.clubShareTl, commercialShareTl: this.commercialShareTl, occurredAt: this.occurredAt,
    };
  }
}
