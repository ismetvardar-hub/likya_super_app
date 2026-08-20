// ============================================================================
// 🎫 AKADEMİ ÜYELİK TIER'LARI & ABONELİK DÖNGÜSÜ YÖNETİCİSİ (Adım 89)
// Tier'lar: Junior Grassroots • Competitive Academy • Elite Performance Pro • Family Pass
// Faturalama döngüsü, yenileme tarihi, oranlı (prorated) yükseltme/indirme, ödeme durumu.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface MembershipTier {
  id: string;
  name: string;
  monthlyPrice: number;
  benefits: string[];
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  { id: 'junior-grassroots', name: 'Junior Grassroots', monthlyPrice: 60, benefits: ['Haftalık 2 grup seansı', 'Temel atletik gelişim'] },
  { id: 'competitive-academy', name: 'Competitive Academy', monthlyPrice: 120, benefits: ['Haftalık 4 seans', 'Biyomekanik analiz', 'Turnuva katılımı'] },
  { id: 'elite-performance-pro', name: 'Elite Performance Pro', monthlyPrice: 240, benefits: ['Birebir koçluk', 'Video analiz', 'Beslenme & mental koçluk'] },
  { id: 'family-pass', name: 'Family Pass', monthlyPrice: 180, benefits: ['Aile üyeleri (4)', 'Tesis erişimi', 'İndirimli özel ders'] },
];

export function getTier(id: string): MembershipTier {
  return MEMBERSHIP_TIERS.find((t) => t.id === id) ?? MEMBERSHIP_TIERS[0];
}

export type PaymentStatus = 'Active' | 'Past Due' | 'Suspended';

export interface Membership {
  memberId: string;
  tierId: string;
  startDate: string;      // ISO
  billingCycleDays: number; // varsayılan 30
  lastPayment: string;    // ISO
  status: PaymentStatus;
}

export const DEFAULT_CYCLE_DAYS = 30;
const DAY_MS = 86_400_000;

/** Ödeme durumu: son ödemeye göre Active / Past Due / Suspended. */
export function membershipStatus(lastPaymentIso: string, cycleDays = DEFAULT_CYCLE_DAYS, nowMs = Date.now()): PaymentStatus {
  const last = new Date(lastPaymentIso).getTime();
  const elapsedDays = (nowMs - last) / DAY_MS;
  if (elapsedDays > cycleDays * 1.5) return 'Suspended';
  if (elapsedDays > cycleDays) return 'Past Due';
  return 'Active';
}

export function renewalDate(lastPaymentIso: string, cycleDays = DEFAULT_CYCLE_DAYS): string {
  return new Date(new Date(lastPaymentIso).getTime() + cycleDays * DAY_MS).toISOString();
}

export interface ProrationResult {
  currentPrice: number;
  newPrice: number;
  daysIntoCycle: number;
  cycleDays: number;
  chargeOrCredit: number; // + yükseltme ücreti, − indirim kredisi
  nextMonthly: number;
}

/** Oranlı yükseltme/indirme: kalan gün oranına göre ücret/kredi. */
export function prorateMembership(membership: Membership, newTierId: string, daysIntoCycle: number, cycleDays = DEFAULT_CYCLE_DAYS): ProrationResult {
  const current = getTier(membership.tierId).monthlyPrice;
  const next = getTier(newTierId).monthlyPrice;
  const remaining = cycleDays - daysIntoCycle;
  const dailyDiff = (next - current) / cycleDays;
  return {
    currentPrice: current,
    newPrice: next,
    daysIntoCycle,
    cycleDays,
    chargeOrCredit: Math.round(dailyDiff * remaining * 100) / 100,
    nextMonthly: next,
  };
}

export function membershipTierStatus(): string {
  return `Üyelik: ${MEMBERSHIP_TIERS.length} tier • 30 günlük döngü • oranlı yükselt/indir • ödeme durumu`;
}
