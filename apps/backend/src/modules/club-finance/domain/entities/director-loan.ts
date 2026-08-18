// ============================================================================
// 🤝 CLUB-FINANCE · Domain Entity: DirectorLoan (Ortak/Yönetici Kredisi)
// Kredi tutarı + faiz + taksit planı + geri ödeme akışı.
// ============================================================================

import { Money } from '../value-objects/money';

export type LoanStatus = 'ACTIVE' | 'REPAID' | 'DEFAULTED';

export interface LoanInstallment {
  dueDate: string;   // YYYY-MM-DD
  principal: Money;
  interest: Money;
  paid: boolean;
}

export interface DirectorLoanState {
  id: string;
  directorId: string;
  principal: Money;
  annualInterestRate: number;  // 0.20 = %20
  installments: LoanInstallment[];
  status: LoanStatus;
  issuedAt: string;
}

export class DirectorLoan {
  readonly id: string;
  readonly directorId: string;
  readonly principal: Money;
  readonly annualInterestRate: number;
  installments: LoanInstallment[];
  status: LoanStatus;
  readonly issuedAt: string;

  constructor(state: DirectorLoanState) {
    this.id = state.id;
    this.directorId = state.directorId;
    this.principal = state.principal;
    this.annualInterestRate = state.annualInterestRate;
    this.installments = state.installments;
    this.status = state.status;
    this.issuedAt = state.issuedAt;
  }

  static amortize(id: string, directorId: string, principalTl: number, annualInterestRate: number, months: number): DirectorLoan {
    const principal = Money.fromTl(principalTl);
    if (months < 1 || months > 120) throw new Error('Taksit sayısı 1-120 aralığında olmalı');
    const monthlyRate = annualInterestRate / 12;
    // Eşit taksit (annuity) formülü
    const factor = Math.pow(1 + monthlyRate, months);
    const payment = principalTl * ((monthlyRate * factor) / (factor - 1));

    const installments: LoanInstallment[] = [];
    const start = new Date();
    for (let m = 1; m <= months; m++) {
      const due = new Date(start.getFullYear(), start.getMonth() + m, start.getDate());
      const interestTl = principalTl * monthlyRate;
      const principalPart = payment - interestTl;
      principalTl = Math.max(0, principalTl - principalPart);
      installments.push({
        dueDate: due.toISOString().slice(0, 10),
        principal: Money.fromTl(principalPart),
        interest: Money.fromTl(interestTl),
        paid: false,
      });
    }

    return new DirectorLoan({ id, directorId, principal, annualInterestRate, installments, status: 'ACTIVE', issuedAt: new Date().toISOString() });
  }

  totalDebt(): Money {
    return this.installments.reduce((acc, i) => (i.paid ? acc : acc.add(i.principal).add(i.interest)), Money.zero());
  }

  repayNextInstallment(): { paid: LoanInstallment; remaining: Money } {
    const next = this.installments.find((i) => !i.paid);
    if (!next) throw new Error('Tüm taksitler ödenmiş');
    next.paid = true;
    if (this.installments.every((i) => i.paid)) this.status = 'REPAID';
    return { paid: next, remaining: this.totalDebt() };
  }

  markDefaulted(): void { this.status = 'DEFAULTED'; }
}
