// ============================================================================
// 🏬 CLUB-FINANCE · Domain Entity: Entity_Commercial (Ticari İşletme)
// Kulübün ticari kolu — gelir payı, kira, ticari fatura yönetimi.
// ============================================================================

import { TaxId } from '../value-objects/tax-id';
import { Money } from '../value-objects/money';

export interface CommercialAccountState {
  id: string;
  legalName: string;
  taxId: TaxId;
  iban: string;
  commissionRate: number;      // 0-1 (kulübe aktarılan komisyon oranı)
  revenueBalance: Money;
  active: boolean;
}

export class Entity_Commercial {
  readonly id: string;
  readonly legalName: string;
  readonly taxId: TaxId;
  readonly iban: string;
  commissionRate: number;
  revenueBalance: Money;
  active: boolean;

  constructor(state: CommercialAccountState) {
    this.id = state.id;
    this.legalName = state.legalName;
    this.taxId = state.taxId;
    this.iban = state.iban;
    this.commissionRate = state.commissionRate;
    this.revenueBalance = state.revenueBalance;
    this.active = state.active;
  }

  static create(id: string, legalName: string, taxIdRaw: string, iban: string, commissionRate = 0.1): Entity_Commercial {
    if (commissionRate < 0 || commissionRate > 1) throw new Error('Komisyon oranı 0-1 aralığında olmalı');
    return new Entity_Commercial({
      id, legalName, taxId: TaxId.from(taxIdRaw), iban, commissionRate,
      revenueBalance: Money.zero(), active: true,
    });
  }

  creditRevenue(amount: Money): void {
    this.revenueBalance = this.revenueBalance.add(amount);
  }

  /** Kulüp payı = commissionRate × tutar. */
  clubShareOf(amount: Money): Money {
    return amount.multiply(this.commissionRate);
  }
}
