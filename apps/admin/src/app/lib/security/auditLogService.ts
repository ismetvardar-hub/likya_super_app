// ============================================================================
// 📋 TIBBİ & BİYOMETRİK DENETİM GÜNLÜĞÜ SERVİSİ (Adım 57) — KVKK/GDPR
// Ekle-yalnızca (append-only) denetim izi: PROFILE_VIEW • BIOMETRIC_UPDATE
// • INJURY_FLAG_OVERRIDE • PARENT_ACCESS. Değişiklik/silme bloke edilir.
// Deterministik; bellek deposu; sıfır bağımlılık.
// ============================================================================

export type AuditAction = 'PROFILE_VIEW' | 'BIOMETRIC_UPDATE' | 'INJURY_FLAG_OVERRIDE' | 'PARENT_ACCESS';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: string;
  targetAthleteId: string;
  action: AuditAction;
  ipAddress: string;
  timestamp: string;
  metadataJson: string;
}

export interface AuditStore {
  append(entry: AuditLogEntry): void;
  list(): AuditLogEntry[];
  update(_id: string, _patch: Partial<AuditLogEntry>): never; // bloke
  remove(_id: string): never;                                  // bloke
}

/** Ekle-yalnızca bellek deposu: update/delete her zaman hata fırlatır. */
export function createMemoryAuditStore(): AuditStore {
  const entries: AuditLogEntry[] = [];
  return {
    append: (e) => { entries.push(e); },
    list: () => [...entries],
    update: () => { throw new Error('AUDIT_IMMUTABLE: Denetim günlüğü değiştirilemez (KVKK/GDPR)'); },
    remove: () => { throw new Error('AUDIT_IMMUTABLE: Denetim günlüğü silinemez (KVKK/GDPR)'); },
  };
}

export class AuditLogService {
  private seq = 0;
  private readonly store: AuditStore;

  constructor(store: AuditStore) {
    this.store = store;
  }

  /** Hassas bir biyometrik erişimi/eylemi kaydeder (append-only). */
  log(input: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const entry: AuditLogEntry = {
      ...input,
      id: `aud_${Date.now().toString(36)}_${this.seq++}`,
      timestamp: new Date().toISOString(),
    };
    this.store.append(entry);
    return entry;
  }

  queryByAthlete(athleteId: string): AuditLogEntry[] {
    return this.store.list().filter((e) => e.targetAthleteId === athleteId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  count(): number {
    return this.store.list().length;
  }

  /** Değişiklik/silme denemesini reddeder (immutability simülasyonu). */
  tryMutate(): string {
    try {
      this.store.update('', {});
    } catch (e) {
      return String(e).includes('AUDIT_IMMUTABLE') ? 'blocked' : 'error';
    }
    return 'allowed';
  }
}

export function auditLogStatus(): string {
  return 'Denetim Günlüğü: append-only • PROFILE_VIEW/BIOMETRIC_UPDATE/INJURY_FLAG_OVERRIDE/PARENT_ACCESS';
}
