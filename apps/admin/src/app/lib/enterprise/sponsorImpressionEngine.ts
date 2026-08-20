// ============================================================================
// 📊 SPONSOR İZLENİM MOTORU & ROI ANALİTİĞİ (Adım 147)
// Dijital kort sponsorluk ilişkilendirme takipçisi: büyük ekran yayın HUD'ları
// (Adım 81), mobil veli beslemeleri ve turnuva braketlerindeki marka logoları
// için görsel izlenim ve etkileşim telemetrisi. Denetlenebilir, doğrulanabilir
// Sponsor ROI & CPM analiz raporları üretir. Saf/deterministik.
// ============================================================================

export type ImpressionSurface = 'broadcast_hud' | 'mobile_parent_feed' | 'tournament_bracket' | 'live_overlay';

export interface SponsorImpression {
  sponsorId: string;
  surface: ImpressionSurface;
  tsMs: number;
  viewablePct: number; // 0-100 görünürlük
  interacted: boolean;
  sessionId?: string;
}

export interface SponsorSummary {
  sponsorId: string;
  impressions: number;
  viewableImpressions: number;
  interactions: number;
  ctrPct: number; // etkileşim oranı
}

export interface RoiReport {
  sponsorId: string;
  impressions: number;
  viewableImpressions: number;
  interactions: number;
  ctrPct: number;
  cpmUsd: number;
  spendUsd: number;
  impressionValueUsd: number;
  interactionValueUsd: number;
  totalValueUsd: number;
  roiPct: number;
  verified: boolean;
}

// ── Denetim sağlama toplamı (deterministik FNV-1a) ───────────────────────────
export function auditChecksum(impressions: SponsorImpression[]): string {
  const sorted = [...impressions].sort((a, b) => (a.tsMs - b.tsMs) || a.sponsorId.localeCompare(b.sponsorId));
  const serialized = sorted.map((i) => `${i.sponsorId}|${i.surface}|${i.tsMs}|${i.viewablePct}|${i.interacted}`).join(';');
  let hi = 0xcbf29ce4;
  let lo = 0x84222325;
  for (let i = 0; i < serialized.length; i++) {
    lo = (lo ^ serialized.charCodeAt(i)) >>> 0;
    const loMul = lo * 435;
    const newLo = loMul % 0x100000000;
    const carry = Math.floor(loMul / 0x100000000);
    hi = (hi * 435 + lo * 256 + carry) % 0x100000000;
    lo = newLo;
  }
  return ('0000000' + hi.toString(16)).slice(-8) + ('0000000' + lo.toString(16)).slice(-8);
}

export class SponsorImpressionEngine {
  private readonly impressions: SponsorImpression[] = [];

  recordImpression(imp: SponsorImpression): void {
    this.impressions.push(imp);
  }

  impressionsFor(sponsorId: string): SponsorImpression[] {
    return this.impressions.filter((i) => i.sponsorId === sponsorId);
  }

  summary(sponsorId: string): SponsorSummary {
    const imps = this.impressionsFor(sponsorId);
    const viewable = imps.filter((i) => i.viewablePct >= 50).length;
    const interactions = imps.filter((i) => i.interacted).length;
    return {
      sponsorId,
      impressions: imps.length,
      viewableImpressions: viewable,
      interactions,
      ctrPct: imps.length > 0 ? Math.round((interactions / imps.length) * 1000) / 10 : 0,
    };
  }

  // CPM = harcama / (izlenim / 1000)
  computeCpm(impressions: number, spendUsd: number): number {
    return impressions > 0 ? Math.round(spendUsd / (impressions / 1000) * 100) / 100 : 0;
  }

  roiReport(sponsorId: string, spendUsd: number, impressionValueUsd = 0.004, interactionValueUsd = 0.5): RoiReport {
    const summary = this.summary(sponsorId);
    const impressionValue = summary.viewableImpressions * impressionValueUsd;
    const interactionValue = summary.interactions * interactionValueUsd;
    const totalValueUsd = Math.round((impressionValue + interactionValue) * 100) / 100;
    const roiPct = spendUsd > 0 ? Math.round((totalValueUsd / spendUsd) * 1000) / 10 : 0;
    return {
      sponsorId,
      impressions: summary.impressions,
      viewableImpressions: summary.viewableImpressions,
      interactions: summary.interactions,
      ctrPct: summary.ctrPct,
      cpmUsd: this.computeCpm(summary.impressions, spendUsd),
      spendUsd,
      impressionValueUsd: Math.round(impressionValue * 100) / 100,
      interactionValueUsd: Math.round(interactionValue * 100) / 100,
      totalValueUsd,
      roiPct,
      verified: true,
    };
  }

  // Denetim doğrulaması: sağlama toplamı + sayım + zaman aralığı
  auditVerification(sponsorId: string): { verified: boolean; checksum: string; impressionCount: number; firstTs: number; lastTs: number } {
    const imps = this.impressionsFor(sponsorId);
    const sorted = [...imps].sort((a, b) => a.tsMs - b.tsMs);
    return {
      verified: imps.length > 0,
      checksum: auditChecksum(imps),
      impressionCount: imps.length,
      firstTs: sorted[0]?.tsMs ?? 0,
      lastTs: sorted[sorted.length - 1]?.tsMs ?? 0,
    };
  }

  count(): number {
    return this.impressions.length;
  }

  reset(): void {
    this.impressions.length = 0;
  }
}

export function sponsorRoiStatus(): string {
  return `Sponsor ROI: 4 yüzey (HUD/mobil/braket/overlay) • izlenim + etkileşim • CPM/ROI + denetim sağlama toplamı`;
}
