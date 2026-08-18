// ============================================================================
// ⏰ CLUB-FINANCE · Cron Jobs (otomatik zamanlanmış görevler)
//   1. 15/15 Çift Bordro Akışı — ayın 15'inde (ya da ödeme günü) çalışır.
//   2. Aylık Kira Faturalandırma — sözleşmelerin fatura gününde çalışır.
// Cron tanımları izole; gerçek scheduler (node-cron / server cron) modül dışı
// bağlanır. `runX` metodları servislerle test edilebilir.
// ============================================================================

import type { DualPayrollService } from '../../application/services/dual-payroll.service';
import type { SubLeaseService } from '../../application/services/sub-lease.service';
import type { CreatePayrollSplitDto } from '../../application/dtos/club-finance.dtos';

export interface CronJobResult {
  ok: boolean;
  job: string;
  processed: number;
  log: string[];
}

export const PAYROLL_CRON_EXPRESSION = '0 9 15 * *';        // ayın 15'i, 09:00
export const RENT_BILLING_CRON_EXPRESSION = '0 6 1 * *';    // ayın 1'i, 06:00

/** 15/15 Çift Bordro: çalışan maaşlarını kulüp + ticari kola böl. */
export class PayrollCronJob {
  constructor(private readonly payroll: DualPayrollService) {}

  async run15_15(month: string, employees: CreatePayrollSplitDto[]): Promise<CronJobResult> {
    const result = await this.payroll.generateForMonth(employees);
    return {
      ok: result.ok,
      job: 'dual-payroll-15/15',
      processed: result.splits.length,
      log: result.splits.map((s) => `${s.employeeId}: kulüp ₺${s.clubShareTl} + ticari ₺${s.commercialShareTl} (${month})`),
    };
  }
}

/** Aylık Kira Faturalandırma: aktif alt kira sözleşmelerini faturalandır. */
export class RentBillingCronJob {
  constructor(private readonly subLease: SubLeaseService) {}

  async runMonthly(year: number, month: number): Promise<CronJobResult> {
    const contracts = await this.subLease.listActive();
    const log: string[] = [];
    for (const contract of contracts) {
      const res = await this.subLease.billMonthly({ contractId: contract.id, year, month });
      if (res.invoice) log.push(`${contract.lesseeName}: ${res.invoice.invoiceRef} ₺${res.invoice.amountTl}`);
    }
    return { ok: log.length > 0 || contracts.length === 0, job: 'monthly-rent-billing', processed: log.length, log };
  }
}
