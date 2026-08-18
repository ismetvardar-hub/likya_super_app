// ============================================================================
// 📄 CLUB-FINANCE · Domain Entity: SubLeaseContract (Alt Kira Sözleşmesi)
// Kira bedeli + fatura günü + sözleşme durumu; aylık faturalandırma hedefi.
// ============================================================================

import { Money } from '../value-objects/money';

export type SubLeaseStatus = 'DRAFT' | 'ACTIVE' | 'TERMINATED';

export interface SubLeaseState {
  id: string;
  lesseeName: string;
  spaceName: string;
  monthlyRent: Money;
  billingDay: number;   // ayın kaçıncı günü (1-28)
  status: SubLeaseStatus;
  startedAt: string;
}

export class SubLeaseContract {
  readonly id: string;
  readonly lesseeName: string;
  readonly spaceName: string;
  readonly monthlyRent: Money;
  readonly billingDay: number;
  status: SubLeaseStatus;
  readonly startedAt: string;

  constructor(state: SubLeaseState) {
    this.id = state.id;
    this.lesseeName = state.lesseeName;
    this.spaceName = state.spaceName;
    this.monthlyRent = state.monthlyRent;
    this.billingDay = state.billingDay;
    this.status = state.status;
    this.startedAt = state.startedAt;
  }

  static create(id: string, lesseeName: string, spaceName: string, monthlyRentTl: number, billingDay = 1): SubLeaseContract {
    if (billingDay < 1 || billingDay > 28) throw new Error('Fatura günü 1-28 aralığında olmalı');
    return new SubLeaseContract({ id, lesseeName, spaceName, monthlyRent: Money.fromTl(monthlyRentTl), billingDay, status: 'DRAFT', startedAt: new Date().toISOString() });
  }

  activate(): void { this.status = 'ACTIVE'; }
  terminate(): void { this.status = 'TERMINATED'; }

  /** Bir ayın kira faturası (o ayın gün sayısına göre pro-rate yok — sabit aylık). */
  invoiceForMonth(year: number, month: number): { invoiceRef: string; dueDate: string; amount: Money } {
    if (this.status === 'TERMINATED') throw new Error('Sözleşme sonlandırılmış — fatura üretilemez');
    const dueDate = `${year}-${String(month).padStart(2, '0')}-${String(this.billingDay).padStart(2, '0')}`;
    return { invoiceRef: `SL-${this.id.slice(0, 4)}-${year}${String(month).padStart(2, '0')}`, dueDate, amount: this.monthlyRent };
  }
}
