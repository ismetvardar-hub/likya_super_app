// ============================================================================
// 🏢 200-SYSTEMS HOLDING BACK-OFFICE OMURGASI
// • 20 temel iş alanı durum denetleyicisi (Lead, Sales, Ops, HR, Finance...)
// • Attract → Convert → Deliver → Optimize → Grow büyüme hunisi telemetrisi
// • "Code runs workflow, AI handles reasoning, Humans approve" onay kuyruğu
// • Lead/Sales/HR/Inventory/Support/Data mikro motorları (durum + aksiyon)
// Deterministik; Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

// ── 20 İŞ ALANI DURUM DENETLEYİCİSİ ─────────────────────────────────────────
export const BACKOFFICE_DOMAINS = [
  'Lead', 'Sales', 'Operations', 'HR', 'Finance', 'Inventory', 'Support', 'Data',
  'Marketing', 'Procurement', 'Facility', 'Sports', 'Kitchen', 'Security', 'Legal',
  'Membership', 'Payments', 'Reports', 'Compliance', 'Growth',
] as const;

export type DomainHealth = 'GREEN' | 'YELLOW' | 'RED';

export interface BackOfficeHealth {
  total: number;
  green: number;
  yellow: number;
  red: number;
  matrix: { domain: string; health: DomainHealth; note: string }[];
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export function backOfficeHealthMatrix(states: Partial<Record<(typeof BACKOFFICE_DOMAINS)[number], DomainHealth>>): BackOfficeHealth {
  const matrix = BACKOFFICE_DOMAINS.map((d) => {
    const h = states[d] ?? 'GREEN';
    const note = h === 'RED' ? `⚠️ ${d} kritik — aksiyon gerekli` : h === 'YELLOW' ? `🟡 ${d} izleniyor` : `${d} nominal`;
    return { domain: d, health: h, note };
  });
  const green = matrix.filter((m) => m.health === 'GREEN').length;
  const yellow = matrix.filter((m) => m.health === 'YELLOW').length;
  const red = matrix.filter((m) => m.health === 'RED').length;
  return {
    total: matrix.length,
    green, yellow, red,
    matrix,
    overall: red > 0 ? 'CRITICAL' : yellow > 2 ? 'DEGRADED' : 'HEALTHY',
  };
}

// ── 5'Lİ BÜYÜME HUNİSİ ──────────────────────────────────────────────────────
export type FunnelStage = 'Attract' | 'Convert' | 'Deliver' | 'Optimize' | 'Grow';

export function growthFunnel(counts: Record<FunnelStage, number>): { stages: { stage: FunnelStage; count: number; conversionPct: number }[]; overallPct: number } {
  const order: FunnelStage[] = ['Attract', 'Convert', 'Deliver', 'Optimize', 'Grow'];
  const stages = order.map((stage, i) => {
    const prev = i === 0 ? counts[stage] : counts[order[i - 1]];
    const conversionPct = prev > 0 ? Math.round((counts[stage] / prev) * 100) : 0;
    return { stage, count: counts[stage], conversionPct };
  });
  const overallPct = counts.Attract > 0 ? Math.round((counts.Grow / counts.Attract) * 100) : 0;
  return { stages, overallPct };
}

// ── ONAY KUYRUĞU (Code → AI → Human approve) ────────────────────────────────
export interface ApprovalItem { id: string; action: string; risk: 'low' | 'medium' | 'high'; humanApproved: boolean }

export function approvalQueue(items: ApprovalItem[]): { pendingHuman: ApprovalItem[]; autoApproved: number } {
  const pendingHuman = items.filter((i) => i.risk !== 'low' && !i.humanApproved);
  const autoApproved = items.filter((i) => i.risk === 'low').length;
  return { pendingHuman, autoApproved };
}

// ── MİKRO MOTORLAR (durum takipçileri) ──────────────────────────────────────
export function leadPipeline(leads: { id: string; stage: string }[]): { byStage: Record<string, number>; hot: number } {
  const byStage: Record<string, number> = {};
  let hot = 0;
  leads.forEach((l) => { byStage[l.stage] = (byStage[l.stage] ?? 0) + 1; if (l.stage === 'hot') hot++; });
  return { byStage, hot };
}

export function hrTracking(employees: { id: string; onboardingDone: boolean; reviews: number }[]): { pendingOnboarding: number; reviewAvg: number } {
  const pendingOnboarding = employees.filter((e) => !e.onboardingDone).length;
  const reviewAvg = employees.length > 0 ? Math.round((employees.reduce((a, e) => a + e.reviews, 0) / employees.length) * 10) / 10 : 0;
  return { pendingOnboarding, reviewAvg };
}

export function inventoryHealth(stock: { item: string; qty: number; reorderLevel: number }[]): { low: string[]; reorderActions: string[]; totalValue: number } {
  const low = stock.filter((s) => s.qty <= s.reorderLevel).map((s) => s.item);
  const reorderActions = low.map((item) => `PO: ${item} — otomatik satın alma emri`);
  low.forEach((item) => staffTaskDispatched(`STK-${Date.now().toString(36).slice(-4).toUpperCase()}`, `Stok uyarısı: ${item}`, 0, 3));
  return { low, reorderActions, totalValue: stock.reduce((a, s) => a + s.qty, 0) };
}

export function supportSla(tickets: { id: string; slaMin: number; resolvedMin: number }[]): { met: number; breached: number; slaPct: number } {
  const met = tickets.filter((t) => t.resolvedMin <= t.slaMin).length;
  const breached = tickets.length - met;
  return { met, breached, slaPct: tickets.length > 0 ? Math.round((met / tickets.length) * 100) : 0 };
}

export function dataBackupHealth(lastBackupHoursAgo: number, integrity: number): { status: 'OK' | 'YAKLAŞIYOR' | 'KRİTİK'; note: string } {
  const status = lastBackupHoursAgo > 24 || integrity < 95 ? 'KRİTİK' : lastBackupHoursAgo > 12 ? 'YAKLAŞIYOR' : 'OK';
  return { status, note: `${lastBackupHoursAgo} saat önce yedek • bütünlük %${integrity}` };
}

export function backOffice200Status(): string {
  return `Back-Office 200 [${BACKOFFICE_DOMAINS.length} iş alanı • 5'li huni • onay kuyruğu • lead/HR/inventory/support/data]`;
}
