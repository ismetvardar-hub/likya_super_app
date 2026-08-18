// ============================================================================
// 🤝 CLUB-FINANCE · Application Service: Director Loan
// Ortak/yönetici kredisi: amortisman planı, taksit ödeme, geri ödeme olayı.
// ============================================================================

import { DirectorLoan } from '../../domain/entities/director-loan';
import { LoanRepaidEvent } from '../../domain/events/loan-repaid.event';
import type { DirectorLoanRepository } from '../../infrastructure/persistence/repositories';
import type { CreateDirectorLoanDto, RepayDirectorLoanDto } from '../dtos/club-finance.dtos';

export interface DirectorLoanResult {
  ok: boolean;
  loanId: string;
  totalDebtTl: number;
  status: string;
  event?: Record<string, unknown>;
}

export class DirectorLoanService {
  constructor(private readonly loans: DirectorLoanRepository) {}

  async create(dto: CreateDirectorLoanDto): Promise<DirectorLoanResult> {
    const loan = DirectorLoan.amortize(dto.loanId, dto.directorId, dto.principalTl, dto.annualInterestRate, dto.months);
    await this.loans.save(loan);
    return { ok: true, loanId: loan.id, totalDebtTl: loan.totalDebt().tl, status: loan.status };
  }

  async repay(dto: RepayDirectorLoanDto): Promise<DirectorLoanResult> {
    const loan = await this.loans.findById(dto.loanId);
    if (!loan) throw new Error('Kredi bulunamadı');
    const { paid, remaining } = loan.repayNextInstallment();
    await this.loans.save(loan);
    const event = new LoanRepaidEvent(loan, paid, remaining);
    return { ok: true, loanId: loan.id, totalDebtTl: remaining.tl, status: loan.status, event: event.toJSON() };
  }
}
