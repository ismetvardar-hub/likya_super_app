// ============================================================================
// 🏢 FRANCHISE ÇOKLU-AKADEMİ LİSANSI & ŞUBE YÖNETİŞİM MOTORU (Adım 146)
// Merkezi franchise şube yönetimi: master franchisor + çoklu şube lisansı
// ("Antalya Central", "Istanbul Elite", "Munich Performance"). Koltuk tahsisi
// (koç/kort/aktif tabanlık çifti) zorlanır; aylık franchise telif ücreti
// otomatik hesaplanır (ciro payı % vs sabit taban ücreti). Saf/deterministik.
// ============================================================================

export type FranchiseBranchStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
export type SeatKind = 'coaches' | 'courts' | 'insolePairs';
export type RoyaltyModel = 'revenue_share' | 'fixed_fee';

export interface SeatLimits {
  coaches: number;
  courts: number;
  insolePairs: number;
}

export interface FranchiseBranch {
  branchId: string;
  name: string;
  city: string;
  country: string;
  status: FranchiseBranchStatus;
  seatLimits: SeatLimits;
  seatUsage: SeatLimits;
  license: {
    licenseKey: string;
    issuedAt: string;
    expiresAt: string;
    royaltyModel: RoyaltyModel;
    royaltyRatePct: number;        // revenue_share için
    fixedFeeMonthlyUsd: number;    // fixed_fee için
  };
}

export interface SeatValidation {
  valid: boolean;
  issues: string[];
}

export interface RoyaltyResult {
  branchId: string;
  month: string;
  revenueUsd: number;
  royaltyAmountUsd: number;
  baseFeeUsd: number;
  totalDueUsd: number;
  method: RoyaltyModel;
}

// ── Koltuk tahsisi doğrulama ─────────────────────────────────────────────────
export function validateSeatAllocation(branch: FranchiseBranch, kind: SeatKind, delta: number): SeatValidation {
  const issues: string[] = [];
  const usage = branch.seatUsage[kind] + delta;
  if (usage < 0) issues.push(`${kind} koltuk negatif olamaz (${usage})`);
  if (usage > branch.seatLimits[kind]) issues.push(`${kind} limit aşıldı: ${usage} > ${branch.seatLimits[kind]}`);
  return { valid: issues.length === 0, issues };
}

export function licenseIsActive(branch: FranchiseBranch, nowMs: number): boolean {
  return branch.status === 'ACTIVE' && new Date(branch.license.expiresAt).getTime() > nowMs;
}

// ── Aylık telif hesaplama (ciro payı vs sabit ücret) ─────────────────────────
export function calculateMonthlyRoyalty(branch: FranchiseBranch, month: string, revenueUsd: number): RoyaltyResult {
  if (branch.license.royaltyModel === 'fixed_fee') {
    return {
      branchId: branch.branchId,
      month,
      revenueUsd,
      royaltyAmountUsd: 0,
      baseFeeUsd: branch.license.fixedFeeMonthlyUsd,
      totalDueUsd: branch.license.fixedFeeMonthlyUsd,
      method: 'fixed_fee',
    };
  }
  const royaltyAmountUsd = Math.round(revenueUsd * (branch.license.royaltyRatePct / 100) * 100) / 100;
  return {
    branchId: branch.branchId,
    month,
    revenueUsd,
    royaltyAmountUsd,
    baseFeeUsd: 0,
    totalDueUsd: royaltyAmountUsd,
    method: 'revenue_share',
  };
}

// ── Merkezi franchise yönetişim motoru ───────────────────────────────────────
export class FranchiseGovernanceEngine {
  private readonly branches = new Map<string, FranchiseBranch>();

  addBranch(branch: FranchiseBranch): void {
    this.branches.set(branch.branchId, branch);
  }

  branch(branchId: string): FranchiseBranch | null {
    return this.branches.get(branchId) ?? null;
  }

  branchesList(): FranchiseBranch[] {
    return Array.from(this.branches.values());
  }

  // Koltuk tahsis et (delta +1/-1) — limit ihlali reddedilir
  allocateSeat(branchId: string, kind: SeatKind, delta: number): { ok: boolean; issues: string[] } {
    const branch = this.branches.get(branchId);
    if (!branch) return { ok: false, issues: ['Şube bulunamadı'] };
    const validation = validateSeatAllocation(branch, kind, delta);
    if (!validation.valid) return { ok: false, issues: validation.issues };
    branch.seatUsage = { ...branch.seatUsage, [kind]: branch.seatUsage[kind] + delta };
    return { ok: true, issues: [] };
  }

  // Şube bütünlük doğrulaması (lisans + koltuk)
  validateBranch(branchId: string, nowMs: number): { valid: boolean; issues: string[] } {
    const branch = this.branches.get(branchId);
    if (!branch) return { valid: false, issues: ['Şube bulunamadı'] };
    const issues: string[] = [];
    if (!licenseIsActive(branch, nowMs)) issues.push('Lisans süresi doldu veya şube aktif değil');
    for (const kind of ['coaches', 'courts', 'insolePairs'] as SeatKind[]) {
      if (branch.seatUsage[kind] > branch.seatLimits[kind]) issues.push(`${kind} koltuk limiti aşıldı`);
    }
    return { valid: issues.length === 0, issues };
  }

  royaltyFor(branchId: string, month: string, revenueUsd: number): RoyaltyResult | null {
    const branch = this.branches.get(branchId);
    return branch ? calculateMonthlyRoyalty(branch, month, revenueUsd) : null;
  }
}

export function franchiseGovernanceStatus(): string {
  return `Franchise: master franchisor + çoklu şube • koltuk limitleri (koç/kort/tabanlık) • telif (ciro payı vs sabit)`;
}
