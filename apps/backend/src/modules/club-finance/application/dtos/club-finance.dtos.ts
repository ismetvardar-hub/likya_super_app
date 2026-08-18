// ============================================================================
// 📦 CLUB-FINANCE · Application DTO'ları (servis giriş sözleşmeleri)
// ============================================================================

export interface RouteRevenueDto {
  bookingRef: string;
  resource: string;
  amountTl: number;
  channel: 'pos' | 'online' | 'mobile' | 'vpos';
  customerName?: string;
  date?: string;
}

export interface CreateDirectorLoanDto {
  loanId: string;
  directorId: string;
  principalTl: number;
  annualInterestRate: number;
  months: number;
}

export interface RepayDirectorLoanDto {
  loanId: string;
}

export interface CreatePayrollSplitDto {
  splitId: string;
  employeeId: string;
  month: string;          // YYYY-MM
  grossSalaryTl: number;
  clubShareRatio?: number;
}

export interface CreateSubLeaseDto {
  contractId: string;
  lesseeName: string;
  spaceName: string;
  monthlyRentTl: number;
  billingDay?: number;
}

export interface BillSubLeaseDto {
  contractId: string;
  year: number;
  month: number;
}
