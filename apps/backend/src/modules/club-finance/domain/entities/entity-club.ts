// ============================================================================
// 🏛️ CLUB-FINANCE · Domain Entity: Entity_Club (Spor Kulübü Tüzel Kişiliği)
// ============================================================================

import { TaxId } from '../value-objects/tax-id';
import { Money } from '../value-objects/money';

export interface ClubAccountState {
  id: string;
  legalName: string;
  taxId: TaxId;
  iban: string;
  revenueBalance: Money;
  payrollReserve: Money;
  active: boolean;
}

export class Entity_Club {
  readonly id: string;
  readonly legalName: string;
  readonly taxId: TaxId;
  readonly iban: string;
  revenueBalance: Money;
  payrollReserve: Money;
  active: boolean;

  constructor(state: ClubAccountState) {
    this.id = state.id;
    this.legalName = state.legalName;
    this.taxId = state.taxId;
    this.iban = state.iban;
    this.revenueBalance = state.revenueBalance;
    this.payrollReserve = state.payrollReserve;
    this.active = state.active;
  }

  static create(id: string, legalName: string, taxIdRaw: string, iban: string): Entity_Club {
    return new Entity_Club({
      id, legalName, taxId: TaxId.from(taxIdRaw), iban,
      revenueBalance: Money.zero(), payrollReserve: Money.zero(), active: true,
    });
  }

  creditRevenue(amount: Money): void {
    this.revenueBalance = this.revenueBalance.add(amount);
  }

  reservePayroll(amount: Money): void {
    if (!this.revenueBalance.canCover(amount)) throw new Error('Bordro rezervi için yetersiz gelir bakiyesi');
    this.revenueBalance = this.revenueBalance.subtract(amount);
    this.payrollReserve = this.payrollReserve.add(amount);
  }

  deactivate(): void { this.active = false; }
}
