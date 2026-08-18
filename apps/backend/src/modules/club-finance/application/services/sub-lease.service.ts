// ============================================================================
// 📄 CLUB-FINANCE · Application Service: Sub Lease
// Alt kira sözleşmesi yönetimi + aylık kira faturası tetikleme (InvoiceTriggered).
// ============================================================================

import { SubLeaseContract } from '../../domain/entities/sub-lease-contract';
import { InvoiceTriggeredEvent } from '../../domain/events/invoice-triggered.event';
import type { SubLeaseRepository } from '../../infrastructure/persistence/repositories';
import type { CreateSubLeaseDto, BillSubLeaseDto } from '../dtos/club-finance.dtos';

export interface SubLeaseResult {
  ok: boolean;
  contractId: string;
  lesseeName: string;
  status: string;
  invoice?: { invoiceRef: string; dueDate: string; amountTl: number };
}

export class SubLeaseService {
  constructor(private readonly contracts: SubLeaseRepository) {}

  async create(dto: CreateSubLeaseDto): Promise<SubLeaseResult> {
    const contract = SubLeaseContract.create(dto.contractId, dto.lesseeName, dto.spaceName, dto.monthlyRentTl, dto.billingDay ?? 1);
    contract.activate();
    await this.contracts.save(contract);
    return { ok: true, contractId: contract.id, lesseeName: contract.lesseeName, status: contract.status };
  }

  async billMonthly(dto: BillSubLeaseDto): Promise<SubLeaseResult> {
    const contract = await this.contracts.findById(dto.contractId);
    if (!contract) throw new Error('Sözleşme bulunamadı');
    const invoice = contract.invoiceForMonth(dto.year, dto.month);
    const event = new InvoiceTriggeredEvent(invoice.invoiceRef, 'SUB_LEASE', contract.lesseeName, invoice.amount);
    return {
      ok: true, contractId: contract.id, lesseeName: contract.lesseeName, status: contract.status,
      invoice: { invoiceRef: invoice.invoiceRef, dueDate: invoice.dueDate, amountTl: invoice.amount.tl },
      event: event.toJSON(),
    } as SubLeaseResult & { event: Record<string, unknown> };
  }

  async listActive(): Promise<SubLeaseContract[]> {
    return this.contracts.listActive();
  }
}
