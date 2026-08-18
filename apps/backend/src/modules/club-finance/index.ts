// ============================================================================
// 🏦 CLUB-FINANCE — PUBLIC API ENTRYPOINT (izole modülün tek kapısı)
// Dış modüller yalnızca bu dosyadan import eder; iç katman (domain/persistence/
// adapters) doğrudan erişime kapalıdır. İzole + değiştirilebilir.
// ============================================================================

export { ClubFinanceModule } from './club-finance.module';

// ── Application Services (kullanımı tavsiye edilen katman) ──
export { RevenueRouterService, type RevenueRouterResult } from './application/services/revenue-router.service';
export { DirectorLoanService, type DirectorLoanResult } from './application/services/director-loan.service';
export { DualPayrollService, type DualPayrollResult } from './application/services/dual-payroll.service';
export { SubLeaseService, type SubLeaseResult } from './application/services/sub-lease.service';

// ── Application DTOs ──
export type {
  RouteRevenueDto, CreateDirectorLoanDto, RepayDirectorLoanDto,
  CreatePayrollSplitDto, CreateSubLeaseDto, BillSubLeaseDto,
} from './application/dtos/club-finance.dtos';

// ── Domain Entities ──
export { Entity_Club, type ClubAccountState } from './domain/entities/entity-club';
export { Entity_Commercial, type CommercialAccountState } from './domain/entities/entity-commercial';
export { DirectorLoan, type DirectorLoanState, type LoanInstallment, type LoanStatus } from './domain/entities/director-loan';
export { SubLeaseContract, type SubLeaseState, type SubLeaseStatus } from './domain/entities/sub-lease-contract';
export { PayrollSplit, type PayrollSplitState, type PayrollSplitStatus } from './domain/entities/payroll-split';

// ── Domain Value Objects ──
export { TaxId, isValidTrTaxId } from './domain/value-objects/tax-id';
export { Money, type Currency } from './domain/value-objects/money';
export { BANK_TRANSACTION_TYPES, type BankTransactionType } from './domain/value-objects/bank-transaction-type';
export { BookingPayload, type BookingChannel, type BookingPayloadData } from './domain/value-objects/booking-payload';

// ── Domain Events ──
export { LoanRepaidEvent } from './domain/events/loan-repaid.event';
export { InvoiceTriggeredEvent, type InvoiceSource } from './domain/events/invoice-triggered.event';
export { PayrollGeneratedEvent } from './domain/events/payroll-generated.event';

// ── Infrastructure (adaptörler — sandbox fallback'li) ──
export { openBankingAdapter, ZiraatAdapter, VakifBankAdapter, IsBankAdapter, type OpenBankProvider, type OpenBankingPort, type BankTransferRequest, type BankTransferResult } from './infrastructure/adapters/banking/open-banking.adapter';
export { normalizeBankingWebhook, verifyWebhookSignature, type BankingWebhookPayload, type NormalizedBankingEvent } from './infrastructure/adapters/banking/banking-webhook.adapter';
export { eInvoiceAdapter, GibAdapter, ParashutAdapter, UyumsoftAdapter, type EInvoiceRequest, type EInvoiceResult, type EInvoiceProvider } from './infrastructure/adapters/e-invoice/e-invoice.adapter';
export { StkVirtualPosAdapter, MobilePosAdapter, applyStkDiscount, type PosChargeRequest, type PosChargeResult } from './infrastructure/adapters/pos/stk-pos.adapter';

// ── Cron ──
export { PayrollCronJob, RentBillingCronJob, PAYROLL_CRON_EXPRESSION, RENT_BILLING_CRON_EXPRESSION, type CronJobResult } from './infrastructure/cron/club-finance.cron';

// ── Repositories (abstract contract'lar) ──
export { ClubRepository, CommercialRepository, DirectorLoanRepository, SubLeaseRepository, PayrollSplitRepository } from './infrastructure/persistence/repositories';
export { InMemoryClubRepository, InMemoryCommercialRepository, InMemoryDirectorLoanRepository, InMemorySubLeaseRepository, InMemoryPayrollSplitRepository } from './infrastructure/persistence/in-memory.repositories';

// ── Presentation ──
export { FinanceAdminController } from './presentation/controllers/finance-admin.controller';
export { FinancePublicController } from './presentation/controllers/finance-public.controller';
export { BankingWebhookController } from './presentation/webhooks/banking.webhook';
