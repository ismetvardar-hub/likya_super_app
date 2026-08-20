// ============================================================================
// 🏟️ ÇOK KORTLU CANLI DOLULUK & DURUM IZGARASI MOTORU (Adım 86)
// 8-16 eş zamanlı kort durumu: ACTIVE_SESSION • BOOKED_PENDING • MAINTENANCE • VACANT
// Canlı koç, oyuncu sayısı, takım ortalama nabzı, kalan seans geri sayımı.
// Tek tık acil kilit + yeniden atama. Deterministik; sıfır bağımlılık.
// ============================================================================

export type CourtStatus = 'ACTIVE_SESSION' | 'BOOKED_PENDING' | 'MAINTENANCE' | 'VACANT';

export interface CourtOccupancy {
  id: string;
  name: string;
  status: CourtStatus;
  coach: string | null;
  playerCount: number;
  avgHr: number;
  countdownSec: number;
}

export const COURT_STATUS_BADGE: Record<CourtStatus, { label: string; color: string }> = {
  ACTIVE_SESSION: { label: 'Aktif Seans', color: '#10B981' },
  BOOKED_PENDING: { label: 'Rezerve', color: '#00f2fe' },
  MAINTENANCE: { label: 'Bakım', color: '#F27A1A' },
  VACANT: { label: 'Boş', color: '#64748b' },
};

export function statusBadge(status: CourtStatus): { label: string; color: string } {
  return COURT_STATUS_BADGE[status];
}

/** 8-16 kortluk canlı doluluk ızgarası üretir (varsayılan 12). */
export function createCourtGrid(count = 12): CourtOccupancy[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `court-${i + 1}`,
    name: `Kort ${i + 1}`,
    status: i % 4 === 0 ? 'ACTIVE_SESSION' : i % 4 === 1 ? 'BOOKED_PENDING' : i % 4 === 2 ? 'MAINTENANCE' : 'VACANT',
    coach: i % 4 === 0 ? `Antrenör ${(i % 4) + 1}` : null,
    playerCount: i % 4 === 0 ? 6 : 0,
    avgHr: i % 4 === 0 ? 148 + (i % 5) * 3 : 0,
    countdownSec: i % 4 === 0 ? 42 * 60 + (i % 5) * 30 : 0,
  }));
}

export function setCourtStatus(grid: CourtOccupancy[], courtId: string, status: CourtStatus): CourtOccupancy[] {
  return grid.map((c) => (c.id === courtId ? { ...c, status } : c));
}

/** Acil kilit: kortu MAINTENANCE'a alır ve seansı durdurur. */
export function emergencyLockout(grid: CourtOccupancy[], courtId: string): CourtOccupancy[] {
  return grid.map((c) =>
    c.id === courtId
      ? { ...c, status: 'MAINTENANCE', coach: null, playerCount: 0, countdownSec: 0, avgHr: 0 }
      : c,
  );
}

/** Kortu yeni koça atar ve ACTIVE_SESSION'a geçirir. */
export function reallocateCourt(grid: CourtOccupancy[], courtId: string, newCoach: string): CourtOccupancy[] {
  return grid.map((c) => (c.id === courtId ? { ...c, status: 'ACTIVE_SESSION', coach: newCoach } : c));
}

export interface CourtGridSummary {
  active: number;
  booked: number;
  maintenance: number;
  vacant: number;
  totalPlayers: number;
  avgActiveHr: number;
}

export function gridSummary(grid: CourtOccupancy[]): CourtGridSummary {
  const active = grid.filter((c) => c.status === 'ACTIVE_SESSION');
  const booked = grid.filter((c) => c.status === 'BOOKED_PENDING');
  const maintenance = grid.filter((c) => c.status === 'MAINTENANCE');
  const vacant = grid.filter((c) => c.status === 'VACANT');
  return {
    active: active.length,
    booked: booked.length,
    maintenance: maintenance.length,
    vacant: vacant.length,
    totalPlayers: active.reduce((a, c) => a + c.playerCount, 0),
    avgActiveHr: active.length > 0 ? Math.round(active.reduce((a, c) => a + c.avgHr, 0) / active.length) : 0,
  };
}

/** Geri sayım etiketi: "42:30" veya "01:02:10". */
export function countdownLabel(sec: number): string {
  if (sec >= 3600) return `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export function courtOccupancyStatus(): string {
  return 'Kort Doluluğu: 12 kort • 4 durum • acil kilit + yeniden atama • geri sayım';
}
