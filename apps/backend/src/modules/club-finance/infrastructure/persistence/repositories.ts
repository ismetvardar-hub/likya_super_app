// ============================================================================
// 🗄️ CLUB-FINANCE · Infrastructure/Persistence — Repository Contracts
// Modül dışı bağımlılık yok: servisler bu ABSTRACT CLASS'lara konuşur (Nest DI
// token olarak kullanılır); gerçek DB implementasyonu izole ve değiştirilebilir.
// ============================================================================

import type { Entity_Club } from '../../domain/entities/entity-club';
import type { Entity_Commercial } from '../../domain/entities/entity-commercial';
import type { DirectorLoan } from '../../domain/entities/director-loan';
import type { SubLeaseContract } from '../../domain/entities/sub-lease-contract';
import type { PayrollSplit } from '../../domain/entities/payroll-split';

export abstract class ClubRepository {
  abstract findById(id: string): Promise<Entity_Club | null>;
  abstract save(club: Entity_Club): Promise<void>;
}

export abstract class CommercialRepository {
  abstract findById(id: string): Promise<Entity_Commercial | null>;
  abstract save(commercial: Entity_Commercial): Promise<void>;
}

export abstract class DirectorLoanRepository {
  abstract findById(id: string): Promise<DirectorLoan | null>;
  abstract findByDirector(directorId: string): Promise<DirectorLoan[]>;
  abstract save(loan: DirectorLoan): Promise<void>;
}

export abstract class SubLeaseRepository {
  abstract findById(id: string): Promise<SubLeaseContract | null>;
  abstract listActive(): Promise<SubLeaseContract[]>;
  abstract save(contract: SubLeaseContract): Promise<void>;
}

export abstract class PayrollSplitRepository {
  abstract findByMonth(month: string): Promise<PayrollSplit[]>;
  abstract save(split: PayrollSplit): Promise<void>;
}
