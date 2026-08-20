// ============================================================================
// 👟 ÇİFT TABANLIK MOTORU — Sol + Sağ eş zamanlı BLE akışı + basış asimetrisi
// • L/R iki insole'dan eş zamanlı örnek akışı (deterministik PRNG, mock-first)
// • Ayak basış asimetrisi: topuk/önayak/GCT L-R farkı → denge % + uyarı
// • virtualBleSensorLab PRNG'sini paylaşır; sıfır bağımlılık (yalnızca TS)
// ============================================================================

import { mulberry32 } from '../hardware/simulation/virtualBleSensorLab.ts';

export interface SideFrame {
  heelPct: number;    // topuk basınç (0-100)
  forefootPct: number; // önayak basınç (0-100)
  gctMs: number;       // zemin temas süresi
}

export interface DualInsoleFrame {
  tMs: number;
  left: SideFrame;
  right: SideFrame;
}

export interface DualInsoleConfig {
  asymPct?: number;          // 0-50 (sağ/sol yük farkı, 0 = simetrik)
  dominantSide?: 'L' | 'R';
  heelPct?: number;          // temel topuk oranı
  forefootPct?: number;      // temel önayak oranı
  gctMs?: number;            // temel temas süresi
}

/** Sol + Sağ tabanlıktan eş zamanlı örnek akışı üretir (50ms adım). */
export function simulateDualInsole(seed: number, durationMs: number, config: DualInsoleConfig = {}, stepMs = 50): DualInsoleFrame[] {
  const rand = mulberry32(seed);
  const asym = config.asymPct ?? 0;
  const dominant = config.dominantSide ?? 'R';
  const baseHeel = config.heelPct ?? 35;
  const baseFore = config.forefootPct ?? 65;
  const baseGct = config.gctMs ?? 180;
  const frames: DualInsoleFrame[] = [];
  const stepCount = Math.max(1, Math.floor(durationMs / stepMs));

  for (let i = 0; i < stepCount; i++) {
    const tMs = i * stepMs;
    // Yürüyüş döngüsü: 0-45% duruş (topuk → önayak), 45-100% salınım
    const cycle = (i % 24) / 24; // 1.2s adım döngüsü
    const inStance = cycle < 0.45;
    let heel = 0;
    let forefoot = 0;
    let gct = 0;
    if (inStance) {
      heel = cycle < 0.25 ? Math.round(baseHeel * (1 - cycle * 2) + rand() * 3) : 0;
      forefoot = cycle >= 0.25 ? Math.round(baseFore * ((cycle - 0.25) / 0.2) + rand() * 3) : 0;
      gct = Math.round(baseGct * (0.9 + rand() * 0.2));
    }
    // Asimetri: dominant taraf daha yüksek yük, diğer taraf düşer
    const lo = 1 - Math.min(0.5, asym / 100);
    const hi = 1;
    const makeSide = (dominant: boolean): SideFrame => {
      const mult = (dominant ? hi : lo) * (inStance ? 1 : 0.15);
      return { heelPct: Math.round(heel * mult), forefootPct: Math.round(forefoot * mult), gctMs: inStance ? Math.round(gct * mult) : 0 };
    };
    const isDominantLeft = dominant === 'L';
    frames.push({ tMs, left: makeSide(isDominantLeft), right: makeSide(!isDominantLeft) });
  }
  return frames;
}

export interface FootStrikeAsymmetry {
  heelAsymPct: number;     // topuk L-R farkı %
  forefootAsymPct: number; // önayak L-R farkı %
  gctAsymPct: number;      // GCT L-R farkı %
  balancePct: number;      // 100 = mükemmel denge, <85 = risk
  dominantSide: 'L' | 'R';
  advisory: string;
}

/** Pencere içinde L/R basış asimetrisini hesaplar (duruş fazındaki örnekler). */
export function footStrikeAsymmetry(frames: DualInsoleFrame[], windowMs?: number): FootStrikeAsymmetry {
  const win = windowMs ?? Math.max(1000, frames[frames.length - 1]?.tMs ?? 1000);
  const inWindow = frames.filter((f) => f.tMs <= win);
  const stance = inWindow.filter((f) => f.left.heelPct > 0 || f.left.forefootPct > 0 || f.right.heelPct > 0 || f.right.forefootPct > 0);
  if (stance.length === 0) {
    return { heelAsymPct: 0, forefootAsymPct: 0, gctAsymPct: 0, balancePct: 100, dominantSide: 'R', advisory: 'Duruş fazı örneği yok' };
  }
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const lHeel = avg(stance.map((f) => f.left.heelPct));
  const rHeel = avg(stance.map((f) => f.right.heelPct));
  const lFore = avg(stance.map((f) => f.left.forefootPct));
  const rFore = avg(stance.map((f) => f.right.forefootPct));
  const lGct = avg(stance.filter((f) => f.left.gctMs > 0).map((f) => f.left.gctMs));
  const rGct = avg(stance.filter((f) => f.right.gctMs > 0).map((f) => f.right.gctMs));
  const pct = (l: number, r: number) => Math.round((Math.abs(l - r) / Math.max(1, Math.max(l, r))) * 100);

  const heelAsymPct = pct(lHeel, rHeel);
  const forefootAsymPct = pct(lFore, rFore);
  const gctAsymPct = lGct > 0 && rGct > 0 ? pct(lGct, rGct) : 0;
  const totalLoadL = lHeel + lFore;
  const totalLoadR = rHeel + rFore;
  const balancePct = Math.max(0, 100 - pct(totalLoadL, totalLoadR) * 2);
  const dominantSide: 'L' | 'R' = totalLoadL >= totalLoadR ? 'L' : 'R';
  const advisory =
    balancePct >= 95
      ? `✅ Denge %${balancePct} — basış simetrik`
      : balancePct >= 85
        ? `⚠️ Denge %${balancePct} — hafif ${dominantSide} baskın; tek taraf drilleri önerilir`
        : `🚨 Denge %${balancePct} — belirgin ${dominantSide} baskın (topuk %${heelAsymPct}, GCT %${gctAsymPct} asimetri); unilateral kuvvet planı şart`;
  return { heelAsymPct, forefootAsymPct, gctAsymPct, balancePct, dominantSide, advisory };
}

export function dualInsoleStatus(): string {
  return 'Çift Tabanlık: L/R eş zamanlı akış • basış asimetrisi (topuk/önayak/GCT) • denge %';
}
