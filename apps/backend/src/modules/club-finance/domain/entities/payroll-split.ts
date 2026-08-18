// ============================================================================
// 🧾 CLUB-FINANCE · Domain Entity: PayrollSplit (Çift Bordro Paylaşımı)
// Tek çalışan maaşı kulüp + ticari tüzel kişilik arasında bölünür (dual payroll).
// ============================================================================

import { Money } from '../value-objects/money';

export type PayrollSplitStatus = 'PENDING' | 'PAID_CLUB' | 'PAID_COMMERCIAL' | 'COMPLETED';

export interface PayrollSplitState {
  id: string;
  employeeId: string;
  month: string;            // YYYY-MM
  grossSalary: Money;
  clubShareRatio: number;   // 0-1 (kulüp oranı)
  status: PayrollSplitStatus;
  processedAt?: string;
}

export class PayrollSplit {
  readonly id: string;
  readonly employeeId: string;
  readonly month: string;
  readonly grossSalary: Money;
  readonly clubShareRatio: number;
  status: PayrollSplitStatus;
  processedAt?: string;

  constructor(state: PayrollSplitState) {
    this.id = state.id;
    this.employeeId = state.employeeId;
    this.month = state.month;
    this.grossSalary = state.grossSalary;
    this.clubShareRatio = state.clubShareRatio;
    this.status = state.status;
    this.processedAt = state.processedAt;
  }

  static create(id: string, employeeId: string, month: string, grossSalaryTl: number, clubShareRatio = 0.5): PayrollSplit {
    if (clubShareRatio < 0 || clubShareRatio > 1) throw new Error('Kulüp pay oranı 0-1 aralığında olmalı');
    return new PayrollSplit({ id, employeeId, month, grossSalary: Money.fromTl(grossSalaryTl), clubShareRatio, status: 'PENDING' });
  }

  /** Kulüp payı (çift bordronun kulübe ait kısmı). */
  clubShare(): Money {
    return this.grossSalary.multiply(this.clubShareRatio);
  }

  /** Ticari payı (gross − kulüp payı). */
  commercialShare(): Money {
    return this.grossSalary.subtract(this.clubShare());
  }

  markClubPaid(): void {
    this.status = 'PAID_CLUB';
    this.processedAt = new Date().toISOString();
  }

  markCompleted(): void {
    if (this.status === 'PAID_CLUB' || this.status === 'PAID_COMMERCIAL') this.status = 'COMPLETED';
  }
}
