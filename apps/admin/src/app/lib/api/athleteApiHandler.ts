// ============================================================================
// 👤 SPORCU PROFİL CRUD API & RBAC DOĞRULAYICI (Adım 53)
// REST/RPC benzeri handler'lar: getAthlete, createAthlete, updateAthlete, listAthletes
// RBAC: yalnızca ceo/manager/atandığı takımın coach'u oluşturup düzenleyebilir;
// athlete yalnızca kendi profilini görebilir. Biyometrik girdi sanitizasyonu
// (boy 50-250 cm, kilo 20-180 kg). Deterministik; sıfır bağımlılık.
// ============================================================================

export type AppRole = 'ceo' | 'manager' | 'coach' | 'parent' | 'athlete' | 'user';

export interface AuthContext {
  userId: string;
  role: AppRole;
  squadIds?: string[]; // coach'un yönettiği takımlar
}

export interface AthletePayload {
  fullName: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  squadId?: string;
  heightCm: number;
  weightKg: number;
}

export interface AthleteProfile extends AthletePayload {
  id: string;
  userId?: string;
  createdAt: string;
}

export interface AthleteStore {
  get(id: string): AthleteProfile | null;
  list(filter?: { squadId?: string }): AthleteProfile[];
  create(payload: AthletePayload): AthleteProfile;
  update(id: string, payload: Partial<AthletePayload>): AthleteProfile | null;
}

export const HEIGHT_RANGE: [number, number] = [50, 250];
export const WEIGHT_RANGE: [number, number] = [20, 180];

/** Biyometrik girdi sanitizasyonu: boy/kilo aralık kontrolü. */
export function validateAthletePayload(payload: AthletePayload): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!payload.fullName || payload.fullName.trim().length < 2) errors.push('fullName en az 2 karakter olmalı');
  if (!Number.isFinite(payload.heightCm) || payload.heightCm < HEIGHT_RANGE[0] || payload.heightCm > HEIGHT_RANGE[1]) {
    errors.push(`heightCm ${HEIGHT_RANGE[0]}-${HEIGHT_RANGE[1]} cm aralığında olmalı`);
  }
  if (!Number.isFinite(payload.weightKg) || payload.weightKg < WEIGHT_RANGE[0] || payload.weightKg > WEIGHT_RANGE[1]) {
    errors.push(`weightKg ${WEIGHT_RANGE[0]}-${WEIGHT_RANGE[1]} kg aralığında olmalı`);
  }
  if (payload.gender !== undefined && payload.gender !== 'M' && payload.gender !== 'F') errors.push('gender M veya F olmalı');
  return { ok: errors.length === 0, errors };
}

function isEditorRole(role: AppRole): boolean {
  return role === 'ceo' || role === 'manager' || role === 'coach';
}

function coachCanManage(auth: AuthContext, squadId: string | undefined): boolean {
  if (auth.role === 'ceo' || auth.role === 'manager') return true;
  if (auth.role === 'coach') return !squadId || (auth.squadIds ?? []).includes(squadId);
  return false;
}

export class AthleteApiHandler {
  private readonly store: AthleteStore;

  constructor(store: AthleteStore) {
    this.store = store;
  }

  async getAthlete(id: string, auth: AuthContext): Promise<AthleteProfile | null> {
    const athlete = this.store.get(id);
    if (!athlete) return null;
    if (auth.role === 'ceo' || auth.role === 'manager') return athlete;
    if (auth.role === 'coach' && (auth.squadIds ?? []).includes(athlete.squadId ?? '')) return athlete;
    if (auth.role === 'athlete' && athlete.userId === auth.userId) return athlete;
    throw new Error('403: Bu profile erişim yetkiniz yok');
  }

  async createAthlete(payload: AthletePayload, auth: AuthContext): Promise<AthleteProfile> {
    if (!isEditorRole(auth.role)) throw new Error('403: Yalnızca ceo/manager/coach sporcu oluşturabilir');
    if (!coachCanManage(auth, payload.squadId)) throw new Error('403: Bu takıma sporcu ekleme yetkiniz yok');
    const validation = validateAthletePayload(payload);
    if (!validation.ok) throw new Error(`422: ${validation.errors.join('; ')}`);
    return this.store.create(payload);
  }

  async updateAthlete(id: string, payload: Partial<AthletePayload>, auth: AuthContext): Promise<AthleteProfile | null> {
    const athlete = this.store.get(id);
    if (!athlete) return null;
    if (!isEditorRole(auth.role)) throw new Error('403: Profil düzenleme yetkiniz yok');
    if (!coachCanManage(auth, payload.squadId ?? athlete.squadId)) throw new Error('403: Bu sporcuyu düzenleme yetkiniz yok');
    const merged: AthletePayload = { ...athlete, ...payload } as AthletePayload;
    const validation = validateAthletePayload(merged);
    if (!validation.ok) throw new Error(`422: ${validation.errors.join('; ')}`);
    return this.store.update(id, payload);
  }

  async listAthletes(filter: { squadId?: string } | undefined, auth: AuthContext): Promise<AthleteProfile[]> {
    if (auth.role === 'athlete') return this.store.list().filter((a) => a.userId === auth.userId);
    if (auth.role === 'coach') return this.store.list().filter((a) => (auth.squadIds ?? []).includes(a.squadId ?? ''));
    return this.store.list(filter);
  }
}

/** Bellek tabanlı sporcu deposu (CI/mock). */
export function createMemoryAthleteStore(seed: AthleteProfile[] = []): AthleteStore {
  let athletes = [...seed];
  return {
    get: (id) => athletes.find((a) => a.id === id) ?? null,
    list: (filter) => (filter?.squadId ? athletes.filter((a) => a.squadId === filter.squadId) : [...athletes]),
    create: (payload) => {
      const profile: AthleteProfile = { ...payload, id: `ath_${athletes.length + 1}`, createdAt: new Date().toISOString() };
      athletes = [...athletes, profile];
      return profile;
    },
    update: (id, payload) => {
      const idx = athletes.findIndex((a) => a.id === id);
      if (idx < 0) return null;
      const updated: AthleteProfile = { ...athletes[idx], ...payload, id };
      athletes = athletes.map((a, i) => (i === idx ? updated : a));
      return updated;
    },
  };
}

export function athleteApiStatus(): string {
  return 'Sporcu API: CRUD + RBAC (ceo/manager/coach) • boy 50-250 / kilo 20-180 sanitizasyon';
}
