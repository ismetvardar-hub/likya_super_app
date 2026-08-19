// ============================================================================
// 📈 DAZE MARKET MAKER ENGINE — Dinamik Borsa & Marj Motoru
// Polymarket HFT terminali mimarisi: talep-stok dengeli fiyatlama.
// Ürün sınıfları: Restoran (Daze Chef reçeteleri) • Kort rezervasyonları •
// Glamping parselleri.
//   Girdiler:  Doluluk (Occupancy) • Stok/Envanter riski • Talep hızı (Velocity)
//   Çıktılar:  Dinamik Fiyat • Anlık Marj + Edge Skoru • Risk/Hedge katsayısı
// Deterministik PnL + işlem geçmişi. Plan Z güvenli; asla throw etmez.
// ============================================================================

export type MarketProductClass = 'restoran' | 'kort' | 'glamping';

export interface PriceFeedInput {
  productClass: MarketProductClass;
  symbol: string;          // ör. "MENU-01", "COURT-A", "PARCEL-03"
  name: string;
  basePrice: number;       // referans fiyat (₺)
  occupancy: number;       // 0-1 doluluk
  stockRisk: number;       // 0-1 stok/envanter riski
  demandVelocity: number;  // anlık talep hızı (adet/saat)
}

export interface PriceQuote {
  symbol: string;
  name: string;
  productClass: MarketProductClass;
  basePrice: number;
  dynamicPrice: number;
  edgeScore: number;       // -100..100 fırsat skoru
  marginTl: number;
  marginPct: number;
  riskHedgeCoeff: number;  // 0-1 hedge katsayısı
  demandVelocity: number;  // talep hızı (adet/saat)
  side: 'MARK' | 'RAISE' | 'DISCOUNT';
}

// ── DETERMİNİSTİK FİYATLAMA ────────────────────────────────────────────────
export function quoteProduct(input: PriceFeedInput): PriceQuote {
  const occ = clamp01(input.occupancy);
  const risk = clamp01(input.stockRisk);
  const vel = Math.max(0, input.demandVelocity);

  // Fiyat bileşenleri (deterministik, 4 ondalık)
  const occupancyPremium = occ * 0.15;                       // doluluk +%15'e kadar
  const velocityPremium = Math.min(vel / 20, 1) * 0.1;       // hızlı talep +%10'a kadar
  const stockPressure = risk * -0.12;                        // stok riski -%12'e kadar
  const dynamicPrice = round2(input.basePrice * (1 + occupancyPremium + velocityPremium + stockPressure));

  const edgeScore = Math.round((velocityPremium - occupancyPremium * 0.6) * 100);
  const marginTl = round2(dynamicPrice - input.basePrice);
  const marginPct = input.basePrice > 0 ? Math.round((marginTl / input.basePrice) * 100) : 0;
  const riskHedgeCoeff = round2(clamp01(0.2 + risk * 0.5 - occ * 0.3));

  const side: PriceQuote['side'] = dynamicPrice > input.basePrice + 0.01 ? 'RAISE' : dynamicPrice < input.basePrice - 0.01 ? 'DISCOUNT' : 'MARK';

  return { symbol: input.symbol, name: input.name, productClass: input.productClass, basePrice: input.basePrice, dynamicPrice, edgeScore, marginTl, marginPct, riskHedgeCoeff, demandVelocity: vel, side };
}

// ── PNL & İŞLEM GEÇMİŞİ ─────────────────────────────────────────────────────
export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  fillPrice: number;
  markPrice: number;
  ts: string;
}

export interface PnLSummary {
  netPnlTl: number;
  winRate: number;      // 0-1
  setEdge: number;      // ortalama kazanç − ortalama kayıp (₺)
  totalTrades: number;
  wins: number;
  losses: number;
}

export function tradePnl(t: Trade): number {
  return t.side === 'BUY' ? (t.markPrice - t.fillPrice) * t.qty : (t.fillPrice - t.markPrice) * t.qty;
}

export function computePnlSummary(trades: Trade[]): PnLSummary {
  if (trades.length === 0) return { netPnlTl: 0, winRate: 0, setEdge: 0, totalTrades: 0, wins: 0, losses: 0 };
  const pnls = trades.map(tradePnl);
  const netPnlTl = round2(pnls.reduce((a, b) => a + b, 0));
  const wins = pnls.filter((p) => p > 0).length;
  const losses = pnls.filter((p) => p < 0).length;
  const avgWin = wins > 0 ? pnls.filter((p) => p > 0).reduce((a, b) => a + b, 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(pnls.filter((p) => p < 0).reduce((a, b) => a + b, 0)) / losses : 0;
  return { netPnlTl, winRate: round2(wins / trades.length), setEdge: round2(avgWin - avgLoss), totalTrades: trades.length, wins, losses };
}

/** Simülasyon tick'i — deterministik işlem üretir (PnL geçmişi büyüsün). */
export function marketTick(trades: Trade[], symbol: string, qty: number, fillPrice: number, markPrice: number, side: 'BUY' | 'SELL' = 'BUY'): Trade[] {
  return [...trades, { id: `TR-${Date.now().toString(36)}-${Math.round(Math.random() * 1e5).toString(36)}`, symbol, side, qty, fillPrice, markPrice, ts: new Date().toISOString() }].slice(-60);
}

// ── SABİT ÜRÜN KATALOĞU (demo) ──────────────────────────────────────────────
export const MARKET_CATALOG: PriceFeedInput[] = [
  { productClass: 'restoran', symbol: 'MENU-01', name: 'Akdeniz Levrek Izgara', basePrice: 240, occupancy: 0.72, stockRisk: 0.3, demandVelocity: 9 },
  { productClass: 'restoran', symbol: 'MENU-02', name: 'Köfte Ezmeli Pide', basePrice: 180, occupancy: 0.55, stockRisk: 0.15, demandVelocity: 5 },
  { productClass: 'kort', symbol: 'COURT-A', name: 'Padel Kort A (16:00)', basePrice: 400, occupancy: 0.88, stockRisk: 0.4, demandVelocity: 14 },
  { productClass: 'kort', symbol: 'COURT-B', name: 'Tenis Kort B (18:00)', basePrice: 350, occupancy: 0.64, stockRisk: 0.25, demandVelocity: 7 },
  { productClass: 'glamping', symbol: 'PARCEL-03', name: 'Glamping Parsel 03', basePrice: 1200, occupancy: 0.93, stockRisk: 0.5, demandVelocity: 6 },
  { productClass: 'glamping', symbol: 'PARCEL-07', name: 'Karavan Parsel 07', basePrice: 900, occupancy: 0.4, stockRisk: 0.1, demandVelocity: 3 },
];

export function quoteCatalog(): PriceQuote[] {
  return MARKET_CATALOG.map(quoteProduct);
}

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }
function round2(n: number): number { return Math.round(n * 100) / 100; }

export function dazeMarketMakerEngineStatus(): string {
  return 'Daze Market Maker [dinamik fiyat • edge skoru • hedge katsayısı • deterministik PnL]';
}
