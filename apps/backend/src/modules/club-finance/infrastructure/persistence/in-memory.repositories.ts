// ============================================================================
// 🗄️ CLUB-FINANCE · In-Memory Repository (izole geliştirme & test)
// Tüm repo arayüzlerinin bellek içi implementasyonu. Modül bağımsız çalışır;
// üretimde Prisma/TypeORM reposu bu arayüzleri karşılayarak değiştirilir.
// ============================================================================

import type {
  ClubRepository, CommercialRepository, DirectorLoanRepository,
  SubLeaseRepository, PayrollSplitRepository,
} from './repositories';
import type { Entity_Club } from '../../domain/entities/entity-club';
import type { Entity_Commercial } from '../../domain/entities/entity-commercial';
import type { DirectorLoan } from '../../domain/entities/director-loan';
import type { SubLeaseContract } from '../../domain/entities/sub-lease-contract';
import type { PayrollSplit } from '../../domain/entities/payroll-split';
import { ClubRepository as ClubRepoBase, CommercialRepository as CommercialRepoBase, DirectorLoanRepository as LoanRepoBase, SubLeaseRepository as SubLeaseRepoBase, PayrollSplitRepository as PayrollRepoBase } from './repositories';

export class InMemoryClubRepository extends ClubRepoBase {
  private store = new Map<string, Entity_Club>();
  async findById(id: string): Promise<Entity_Club | null> { return this.store.get(id) ?? null; }
  async save(club: Entity_Club): Promise<void> { this.store.set(club.id, club); }
}

export class InMemoryCommercialRepository extends CommercialRepoBase {
  private store = new Map<string, Entity_Commercial>();
  async findById(id: string): Promise<Entity_Commercial | null> { return this.store.get(id) ?? null; }
  async save(c: Entity_Commercial): Promise<void> { this.store.set(c.id, c); }
}

export class InMemoryDirectorLoanRepository extends LoanRepoBase {
  private store = new Map<string, DirectorLoan>();
  async findById(id: string): Promise<DirectorLoan | null> { return this.store.get(id) ?? null; }
  async findByDirector(directorId: string): Promise<DirectorLoan[]> {
    return [...this.store.values()].filter((l) => l.directorId === directorId);
  }
  async save(loan: DirectorLoan): Promise<void> { this.store.set(loan.id, loan); }
}

export class InMemorySubLeaseRepository extends SubLeaseRepoBase {
  private store = new Map<string, SubLeaseContract>();
  async findById(id: string): Promise<SubLeaseContract | null> { return this.store.get(id) ?? null; }
  async listActive(): Promise<SubLeaseContract[]> {
    return [...this.store.values()].filter((c) => c.status === 'ACTIVE');
  }
  async save(contract: SubLeaseContract): Promise<void> { this.store.set(contract.id, contract); }
}

export class InMemoryPayrollSplitRepository extends PayrollRepoBase {
  private store = new Map<string, PayrollSplit>();
  async findByMonth(month: string): Promise<PayrollSplit[]> {
    return [...this.store.values()].filter((s) => s.month === month);
  }
  async save(split: PayrollSplit): Promise<void> { this.store.set(split.id, split); }
}

// Re-export types (interface adları geriye uyumluluk için)
export type { ClubRepository, CommercialRepository, DirectorLoanRepository, SubLeaseRepository, PayrollSplitRepository };
