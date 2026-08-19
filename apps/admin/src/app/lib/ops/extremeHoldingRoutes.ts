// ============================================================================
// 🛍️ LİKYA HOLDİNG ENTEGRE ROTALARI — Stay • Market • Daze Mind Cafe
// • Likya Stay  : Glamping & kort kenarı konaklama listeleme + tek tıkla rezerv
// • Likya Market: Spor ekipmanı satın alma + "Korta Teslimat" seçeneği
// • Daze Mind Cafe: Daze Chef entegreli taze sipariş hattı (120s geri sayım)
// Deterministik; Plan Z güvenli; mock-first.
// ============================================================================

import { orderPlaced, kitchenTimerTick } from '../ops/dazeHubEventBus';

// ── LİKYA STAY ──────────────────────────────────────────────────────────────
export interface StayUnit {
  id: string;
  name: string;
  type: 'glamping' | 'bungalow' | 'lounge';
  priceTl: number;
  courtSide: boolean;
  available: boolean;
}

export const STAY_UNITS: StayUnit[] = [
  { id: 'ST-1', name: 'Glamping Çadır Kort Kenarı', type: 'glamping', priceTl: 1200, courtSide: true, available: true },
  { id: 'ST-2', name: 'Bungalov A', type: 'bungalow', priceTl: 2500, courtSide: false, available: true },
  { id: 'ST-3', name: 'Kort Lounge + Şezlong', type: 'lounge', priceTl: 350, courtSide: true, available: true },
];

export function reserveStay(unitId: string, nights: number): { ok: boolean; unit: StayUnit | null; totalTl: number; message: string } {
  const unit = STAY_UNITS.find((u) => u.id === unitId);
  if (!unit || !unit.available) return { ok: false, unit: null, totalTl: 0, message: 'Ünite müsait değil' };
  unit.available = false;
  return { ok: true, unit, totalTl: unit.priceTl * nights, message: `${unit.name} ${nights} gece rezerve edildi — Likya Pay ile tek cüzdandan tahsil` };
}

// ── LİKYA MARKET ────────────────────────────────────────────────────────────
export interface MarketProduct {
  id: string;
  name: string;
  category: 'racket' | 'ball' | 'nutrition' | 'merch';
  priceTl: number;
  deliverToCourt: boolean;
}

export const MARKET_PRODUCTS: MarketProduct[] = [
  { id: 'MK-1', name: 'Padel Raket (Pro)', category: 'racket', priceTl: 2400, deliverToCourt: true },
  { id: 'MK-2', name: 'Tenis Topu (3lü)', category: 'ball', priceTl: 180, deliverToCourt: true },
  { id: 'MK-3', name: 'Protein Bar (12li)', category: 'nutrition', priceTl: 360, deliverToCourt: true },
  { id: 'MK-4', name: 'Kulüp Forması', category: 'merch', priceTl: 890, deliverToCourt: false },
];

export function buyMarketProduct(productId: string, deliverToCourt: boolean): { ok: boolean; product: MarketProduct | null; message: string } {
  const product = MARKET_PRODUCTS.find((p) => p.id === productId);
  if (!product) return { ok: false, product: null, message: 'Ürün bulunamadı' };
  const canDeliver = !deliverToCourt || product.deliverToCourt;
  return {
    ok: true,
    product,
    message: `${product.name} (₺${product.priceTl}) satın alındı${deliverToCourt && canDeliver ? ' — korta teslimat hazır' : ''} • kayıtlı karttan tek çekim`,
  };
}

// ── DAZE MIND CAFE (120s) ───────────────────────────────────────────────────
export interface CafeItem {
  id: string;
  name: string;
  priceTl: number;
  prepSec: number;
}

export const CAFE_MENU: CafeItem[] = [
  { id: 'CF-1', name: 'Taze Sıkım Portakal', priceTl: 45, prepSec: 120 },
  { id: 'CF-2', name: 'Cold Brew Kahve', priceTl: 65, prepSec: 120 },
  { id: 'CF-3', name: 'Protein Shake', priceTl: 95, prepSec: 120 },
  { id: 'CF-4', name: 'Enerji Atıştırmalık', priceTl: 40, prepSec: 90 },
];

export function orderCafeItem(itemId: string, deliveryZone: 'court' | 'lounge'): { ok: boolean; item: CafeItem | null; orderId: string; message: string } {
  const item = CAFE_MENU.find((i) => i.id === itemId);
  if (!item) return { ok: false, item: null, orderId: '', message: 'Ürün yok' };
  const orderId = `CF-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  orderPlaced(orderId, item.name, item.priceTl);
  kitchenTimerTick(orderId, item.prepSec);
  return {
    ok: true,
    item,
    orderId,
    message: `${item.name} → ${deliveryZone === 'court' ? 'korta' : 'şezlonga'} sipariş edildi • ${item.prepSec}s geri sayım başladı`,
  };
}

export function extremeHoldingRoutesStatus(): string {
  return 'Likya Holding [Stay glamping • Market korta teslimat • Daze Cafe 120s]';
}
