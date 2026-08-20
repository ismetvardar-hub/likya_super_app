// ============================================================================
// 🔒 DİNAMİK AKILLI DOLAP BLUETOOTH/NFC KİLİT KONTROLÖRÜ (Adım 138)
// Otomatik akıllı dolap ataması ve elektronik kilit hareketi: turnike girişinde
// müsait dolabı otomatik talep eder ve geçici (ephemeral) BLE açma anahtarı
// üretir. Sporcu çıkışında dolabı otomatik serbest bırakır ve sanitasyon denetim
// durumunu tetikler (Adım 91). Koç acil master override açma komutu sağlar.
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type SmartLockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'INSPECTION';
export type SanitationStatus = 'PENDING' | 'INSPECTED';

export interface SmartLocker {
  lockerId: number;
  status: SmartLockerStatus;
  assignedTo: string | null;
  unlockKey: string | null;
  assignedAtMs: number | null;
  sanitationStatus: SanitationStatus;
}

export const SMART_LOCKER_COUNT = 40;
export const BLE_KEY_PREFIX = 'ble';

export interface LockerClaim {
  lockerId: number;
  unlockKey: string;
  ephemeral: boolean;
}

export interface LockerRelease {
  lockerId: number;
  sanitizationStatus: SanitationStatus;
  note: string;
}

// ── Ephemeral BLE açma anahtarı (zaman kovalı, deterministik) ────────────────
export function generateBleUnlockKey(athleteId: string, nowMs: number): string {
  let seed = 0;
  const s = `${athleteId}:${Math.floor(nowMs / 60_000)}`;
  for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
  const part = seed.toString(16).padStart(8, '0').slice(0, 8);
  return `${BLE_KEY_PREFIX}-${part}`;
}

export class SmartLockerController {
  private readonly lockers: SmartLocker[];

  constructor(lockerCount = SMART_LOCKER_COUNT) {
    this.lockers = Array.from({ length: lockerCount }, (_, i) => ({
      lockerId: i + 1,
      status: 'AVAILABLE',
      assignedTo: null,
      unlockKey: null,
      assignedAtMs: null,
      sanitationStatus: 'INSPECTED',
    }));
  }

  // ── Turnike girişinde otomatik dolap talebi ────────────────────────────────
  claimLocker(athleteId: string, nowMs: number): { ok: true; claim: LockerClaim } | { ok: false; error: string } {
    const locker = this.lockers.find((l) => l.status === 'AVAILABLE');
    if (!locker) return { ok: false, error: 'NO_LOCKER_AVAILABLE' };
    locker.status = 'OCCUPIED';
    locker.assignedTo = athleteId;
    locker.unlockKey = generateBleUnlockKey(athleteId, nowMs);
    locker.assignedAtMs = nowMs;
    return { ok: true, claim: { lockerId: locker.lockerId, unlockKey: locker.unlockKey, ephemeral: true } };
  }

  // ── Çıkış: serbest bırak + sanitasyon denetimi (Adım 91) ───────────────────
  releaseLocker(lockerId: number, athleteId: string): { ok: true; release: LockerRelease } | { ok: false; error: string } {
    const locker = this.lockers.find((l) => l.lockerId === lockerId);
    if (!locker) return { ok: false, error: 'LOCKER_NOT_FOUND' };
    if (locker.status !== 'OCCUPIED' || locker.assignedTo !== athleteId) {
      return { ok: false, error: 'LOCKER_NOT_ASSIGNED_TO_ATHLETE' };
    }
    locker.status = 'INSPECTION';
    locker.sanitationStatus = 'PENDING';
    locker.assignedTo = null;
    locker.unlockKey = null;
    locker.assignedAtMs = null;
    return { ok: true, release: { lockerId, sanitizationStatus: 'PENDING', note: 'Sanitasyon denetimi bekleniyor (Adım 91)' } };
  }

  // ── Sanitasyon sonrası dolabı geri kullanıma aç ────────────────────────────
  inspectAndReturn(lockerId: number): void {
    const locker = this.lockers.find((l) => l.lockerId === lockerId);
    if (!locker) return;
    locker.status = 'AVAILABLE';
    locker.sanitationStatus = 'INSPECTED';
  }

  // ── Koç acil master override açma ──────────────────────────────────────────
  emergencyMasterUnlock(lockerId: number, coachId: string): { unlocked: boolean; reason: string } {
    const locker = this.lockers.find((l) => l.lockerId === lockerId);
    if (!locker) return { unlocked: false, reason: 'LOCKER_NOT_FOUND' };
    locker.unlockKey = generateBleUnlockKey(`coach:${coachId}:override:${lockerId}`, Date.now());
    return { unlocked: true, reason: `Koç ${coachId} master override — dolap ${lockerId} kilidi açıldı` };
  }

  locker(lockerId: number): SmartLocker | null {
    return this.lockers.find((l) => l.lockerId === lockerId) ?? null;
  }

  availableCount(): number {
    return this.lockers.filter((l) => l.status === 'AVAILABLE').length;
  }

  occupiedCount(): number {
    return this.lockers.filter((l) => l.status === 'OCCUPIED').length;
  }

  snapshot(): SmartLocker[] {
    return this.lockers.map((l) => ({ ...l }));
  }
}

export function smartLockerStatus(): string {
  return `Akıllı Dolap: ${SMART_LOCKER_COUNT} dolap • ephemeral BLE anahtar • sanitasyon (Adım 91) + koç master override`;
}
