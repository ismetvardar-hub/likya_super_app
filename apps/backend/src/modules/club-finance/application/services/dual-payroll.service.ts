// ============================================================================
// 🧾 CLUB-FINANCE · Application Service: Dual Payroll
// Tek maaş, kulüp + ticari tüzel kişilik arasında bölünür (çift bordro).
// 15/15 cron akışı için aylık bordro üretimi + PayrollGeneratedEvent.
// ============================================================================

import { PayrollSplit } from '../../domain/entities/payroll-split';
import { PayrollGeneratedEvent } from '../../domain/events/payroll-generated.event';
import type { PayrollSplitRepository } from '../../infrastructure/persistence/repositories';
import type { CreatePayrollSplitDto } from '../dtos/club-finance.dtos';

export interface DualPayrollResult {
  ok: boolean;
  splits: { splitId: string; employeeId: string; clubShareTl: number; commercialShareTl: number; status: string }[];
  events: Record<string, unknown>[];
}

export class DualPayrollService {
  constructor(private readonly splits: PayrollSplitRepository) {}

  async generateForMonth(dtos: CreatePayrollSplitDto[]): Promise<DualPayrollResult> {
    const result: DualPayrollResult['splits'] = [];
    const events: Record<string, unknown>[] = [];

    for (const dto of dtos) {
      const split = PayrollSplit.create(dto.splitId, dto.employeeId, dto.month, dto.grossSalaryTl, dto.clubShareRatio);
      await this.splits.save(split);
      const event = new PayrollGeneratedEvent(split, split.clubShare().tl, split.commercialShare().tl);
      result.push({ splitId: split.id, employeeId: split.employeeId, clubShareTl: split.clubShare().tl, commercialShareTl: split.commercialShare().tl, status: split.status });
      events.push(event.toJSON());
    }

    return { ok: true, splits: result, events };
  }

  async listByMonth(month: string): Promise<PayrollSplit[]> {
    return this.splits.findByMonth(month);
  }
}
