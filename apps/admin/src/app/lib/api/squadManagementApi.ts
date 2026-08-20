// ============================================================================
// 🏟️ TAKIM YÖNETİMİ API (Adım 54) — kadro organizasyonu & rota yönetimi
// createSquad • assignAthletesToSquad • removeAthleteFromSquad • getSquadRoster
// Çoklu coach birlikte ataması + aktif kadro istatistikleri.
// Deterministik; bellek deposu; sıfır bağımlılık.
// ============================================================================

export interface Squad {
  id: string;
  name: string;
  coachIds: string[];   // çoklu coach
  level: 'junior' | 'pro';
  athleteIds: string[];
  createdAt: string;
}

export interface RosterAthlete {
  athleteId: string;
  avgRsi: number;
  avgGctMs: number;
  injuryRisk: 'low' | 'medium' | 'high';
}

export interface SquadRoster {
  squad: Squad;
  athleteCount: number;
  coaches: string[];
  avgRsi: number;
  avgGctMs: number;
  highRiskCount: number;
  readinessPct: number; // risk seviyesi low olanların oranı
}

export interface SquadStore {
  get(id: string): Squad | null;
  list(): Squad[];
  save(squad: Squad): void;
}

export class SquadManagementApi {
  private readonly store: SquadStore;
  private readonly athleteProfiles?: { get(id: string): { avgRsi?: number; avgGctMs?: number; injuryRisk?: 'low' | 'medium' | 'high' } | null };

  constructor(
    store: SquadStore,
    athleteProfiles?: { get(id: string): { avgRsi?: number; avgGctMs?: number; injuryRisk?: 'low' | 'medium' | 'high' } | null },
  ) {
    this.store = store;
    this.athleteProfiles = athleteProfiles;
  }

  createSquad(name: string, coachId: string, level: 'junior' | 'pro' = 'junior'): Squad {
    const squad: Squad = { id: `sq_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`, name, coachIds: [coachId], level, athleteIds: [], createdAt: new Date().toISOString() };
    this.store.save(squad);
    return squad;
  }

  /** Çoklu coach birlikte ataması (takıma yeni coach ekler). */
  addCoachToSquad(squadId: string, coachId: string): Squad | null {
    const squad = this.store.get(squadId);
    if (!squad) return null;
    if (!squad.coachIds.includes(coachId)) squad.coachIds.push(coachId);
    this.store.save(squad);
    return squad;
  }

  assignAthletesToSquad(squadId: string, athleteIds: string[]): { added: number; squad: Squad | null } {
    const squad = this.store.get(squadId);
    if (!squad) return { added: 0, squad: null };
    const before = squad.athleteIds.length;
    for (const id of athleteIds) if (!squad.athleteIds.includes(id)) squad.athleteIds.push(id);
    this.store.save(squad);
    return { added: squad.athleteIds.length - before, squad };
  }

  removeAthleteFromSquad(squadId: string, athleteId: string): { removed: boolean; squad: Squad | null } {
    const squad = this.store.get(squadId);
    if (!squad) return { removed: false, squad: null };
    const idx = squad.athleteIds.indexOf(athleteId);
    if (idx >= 0) squad.athleteIds.splice(idx, 1);
    this.store.save(squad);
    return { removed: idx >= 0, squad };
  }

  getSquadRoster(squadId: string): SquadRoster | null {
    const squad = this.store.get(squadId);
    if (!squad) return null;
    const athletes: RosterAthlete[] = squad.athleteIds.map((id) => {
      const p = this.athleteProfiles?.get(id);
      return { athleteId: id, avgRsi: p?.avgRsi ?? 0, avgGctMs: p?.avgGctMs ?? 0, injuryRisk: p?.injuryRisk ?? 'low' };
    });
    const avg = (arr: number[]) => (arr.length === 0 ? 0 : Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)));
    const highRiskCount = athletes.filter((a) => a.injuryRisk === 'high').length;
    const readinessPct = athletes.length > 0 ? Math.round((athletes.filter((a) => a.injuryRisk === 'low').length / athletes.length) * 100) : 100;
    return {
      squad,
      athleteCount: athletes.length,
      coaches: [...squad.coachIds],
      avgRsi: avg(athletes.map((a) => a.avgRsi)),
      avgGctMs: avg(athletes.map((a) => a.avgGctMs)),
      highRiskCount,
      readinessPct,
    };
  }
}

/** Bellek tabanlı takım deposu (CI/mock). */
export function createMemorySquadStore(seed: Squad[] = []): SquadStore {
  const squads = new Map(seed.map((s) => [s.id, s]));
  return {
    get: (id) => squads.get(id) ?? null,
    list: () => Array.from(squads.values()),
    save: (squad) => { squads.set(squad.id, squad); },
  };
}

export function squadManagementStatus(): string {
  return 'Takım API: createSquad • çoklu coach • assign/remove • kadro RSI/risk istatistikleri';
}
