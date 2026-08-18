import { Module } from '@nestjs/common';
import {
  ClubRepository, CommercialRepository, DirectorLoanRepository,
  SubLeaseRepository, PayrollSplitRepository,
} from './infrastructure/persistence/repositories';
import {
  InMemoryClubRepository, InMemoryCommercialRepository, InMemoryDirectorLoanRepository,
  InMemorySubLeaseRepository, InMemoryPayrollSplitRepository,
} from './infrastructure/persistence/in-memory.repositories';
import { RevenueRouterService } from './application/services/revenue-router.service';
import { DirectorLoanService } from './application/services/director-loan.service';
import { DualPayrollService } from './application/services/dual-payroll.service';
import { SubLeaseService } from './application/services/sub-lease.service';
import { PayrollCronJob, RentBillingCronJob } from './infrastructure/cron/club-finance.cron';
import { FinanceAdminController } from './presentation/controllers/finance-admin.controller';
import { FinancePublicController } from './presentation/controllers/finance-public.controller';
import { BankingWebhookController } from './presentation/webhooks/banking.webhook';

// ============================================================================
// 🏦 CLUB-FINANCE — İzole Modül Tanımı
// Temiz mimari: persistence (InMemory) → application (servisler) → presentation.
// Modül dışı katmanlara kirletmez; dış dünya yalnız index.ts Public API'den
// konuşur. InMemory repo'lar üretimde Prisma/TypeORM ile değiştirilebilir.
// ============================================================================

@Module({
  controllers: [FinanceAdminController, FinancePublicController, BankingWebhookController],
  providers: [
    { provide: ClubRepository, useClass: InMemoryClubRepository },
    { provide: CommercialRepository, useClass: InMemoryCommercialRepository },
    { provide: DirectorLoanRepository, useClass: InMemoryDirectorLoanRepository },
    { provide: SubLeaseRepository, useClass: InMemorySubLeaseRepository },
    { provide: PayrollSplitRepository, useClass: InMemoryPayrollSplitRepository },
    RevenueRouterService,
    DirectorLoanService,
    DualPayrollService,
    SubLeaseService,
    PayrollCronJob,
    RentBillingCronJob,
  ],
  exports: [
    RevenueRouterService,
    DirectorLoanService,
    DualPayrollService,
    SubLeaseService,
  ],
})
export class ClubFinanceModule {}
