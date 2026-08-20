// ============================================================================
// 🏛️ ÇOK KİRACILI KULÜP & TESİS ORGANİZASYON MOTORU (Adım 93)
// Birden çok akademi şubesi (Antalya Tenis Kulübü, Lara Akademi, Belek Performance)
// • Tüm sorgularda kiracı sınırı (club_id/facility_id) zorunluluğu
// • Hızlı kiracı değiştirici + veri izolasyon doğrulaması
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface ClubTenant {
  id: string;
  name: string;
  city: string;
  facilityCount: number;
}

export const CLUB_TENANTS: ClubTenant[] = [
  { id: 'antalya-tenis', name: 'Antalya Tenis Kulübü', city: 'Antalya', facilityCount: 6 },
  { id: 'lara-akademi', name: 'Lara Akademi', city: 'Antalya', facilityCount: 4 },
  { id: 'belek-performance', name: 'Belek Performance Center', city: 'Belek', facilityCount: 5 },
];

export const DEFAULT_CLUB_ID = 'antalya-tenis';

/** Kiracı kapsamlı kayıt: tüm veriler clubId taşımalı. */
export interface TenantScoped {
  clubId: string;
}

export class MultiTenantEngine {
  private currentClubId: string;

  constructor(tenants: ClubTenant[] = CLUB_TENANTS, initialClubId: string = DEFAULT_CLUB_ID) {
    this.tenants = tenants;
    this.currentClubId = tenants.some((t) => t.id === initialClubId) ? initialClubId : tenants[0].id;
  }

  private readonly tenants: ClubTenant[];

  listClubs(): ClubTenant[] {
    return this.tenants;
  }

  getCurrentClub(): ClubTenant {
    return this.tenants.find((t) => t.id === this.currentClubId) ?? this.tenants[0];
  }

  get currentClubIdValue(): string {
    return this.currentClubId;
  }

  switchClub(clubId: string): boolean {
    if (!this.tenants.some((t) => t.id === clubId)) return false;
    this.currentClubId = clubId;
    return true;
  }

  /** Kayıtları yalnızca güncel kiracıya göre kapsar (veri izolasyonu). */
  scopeData<T extends TenantScoped>(records: T[]): T[] {
    return records.filter((r) => r.clubId === this.currentClubId);
  }

  /** Kayıt güncel kiracıya mı ait? */
  isAccessible(record: TenantScoped): boolean {
    return record.clubId === this.currentClubId;
  }
}

export function createMultiTenantEngine(clubId?: string): MultiTenantEngine {
  return new MultiTenantEngine(CLUB_TENANTS, clubId ?? DEFAULT_CLUB_ID);
}

export function multiTenantStatus(): string {
  return `Çok Kiracı: ${CLUB_TENANTS.length} kulüp • club_id sınırı • kiracı değiştirici`;
}
