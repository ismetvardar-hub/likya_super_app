// ============================================================================
// 🛒 KORTA & ODAYA ANLIK TESLİMAT HATTI — Likya Market x Daze Chef
// - "Kort No / Glamping No Belirterek Sipariş Ver" akışı
// - 120 saniyelik hazırlık geri sayımı (Event Bus'a düşer — Daze Crew yakalar)
// - Kurye/personel yönlendirme bildirimi
// - Mock-first: offline deterministik çalışır
// ============================================================================

import { emit } from './dazeHubEventBus';

export type DeliveryCategory = 'MARKET' | 'DAZE_CHEF';
export type DeliveryDestination = `Padel Kort ${'A' | 'B' | 'C'}` | `Tenis Kort ${string}` | `Glamping ${number}` | string;

export interface DeliveryItem {
  id: string;
  name: string;
  category: DeliveryCategory;
  priceTl: number;
  emoji: string;
}

export interface DeliveryOrder {
  id: string;
  item: string;
  category: DeliveryCategory;
  destination: DeliveryDestination;
  qty: number;
  priceTl: number;
  status: 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  placedAt: string;
  countdownLeft: number;   // 120'den geri sayar
  courier: string;
}

export const MARKET_ITEMS: DeliveryItem[] = [
  { id: 'M1', name: "Padel Topu (3'lü)", category: 'MARKET', priceTl: 95, emoji: '🎾' },
  { id: 'M2', name: 'Overgrip', category: 'MARKET', priceTl: 45, emoji: '🧵' },
  { id: 'M3', name: 'Soğuk Havlu', category: 'MARKET', priceTl: 25, emoji: '🧊' },
  { id: 'M4', name: 'Raket (Kiralık)', category: 'MARKET', priceTl: 60, emoji: '🏸' },
];

export const DAZE_ITEMS: DeliveryItem[] = [
  { id: 'D1', name: 'Soğuk İçecek', category: 'DAZE_CHEF', priceTl: 40, emoji: '🥤' },
  { id: 'D2', name: 'Protein Bowl', category: 'DAZE_CHEF', priceTl: 180, emoji: '🥗' },
  { id: 'D3', name: 'Enerji Bar', category: 'DAZE_CHEF', priceTl: 30, emoji: '🍫' },
  { id: 'D4', name: 'Izgara Tavuk Wrap', category: 'DAZE_CHEF', priceTl: 150, emoji: '🌯' },
];

const PREP_COUNTDOWN_SEC = 120;
let orders: DeliveryOrder[] = [];
let seq = 1;

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const COURIERS = ['Murat (Kort)', 'Ayşe (Oda Servisi)', 'Berk (Kurye)'];

// ---------------------------------------------------------------------------
// 1. Korta / Odaya Sipariş Ver — 120s geri sayım + Event Bus
// ---------------------------------------------------------------------------
export function placeCourtDelivery(item: DeliveryItem, destination: DeliveryDestination, qty = 1, opts?: { courier?: string }): DeliveryOrder {
  const order: DeliveryOrder = {
    id: `DLV-${String(seq++).padStart(3, '0')}`,
    item: item.name,
    category: item.category,
    destination,
    qty,
    priceTl: item.priceTl * qty,
    status: 'PREPARING',
    placedAt: now(),
    countdownLeft: PREP_COUNTDOWN_SEC,
    courier: opts?.courier ?? COURIERS[(seq + qty) % COURIERS.length],
  };
  orders.unshift(order);

  // Event Bus: Daze Crew personel görevi otomatik oluşur (ORDER_PLACED)
  emit('ORDER_PLACED', {
    orderId: order.id,
    item: `${item.emoji} ${order.item} ×${order.qty} → ${order.destination}`,
    amount: order.priceTl,
    delivery: true,
    destination: order.destination,
    countdown: PREP_COUNTDOWN_SEC,
  });
  // Özel teslimat olayı — CEO/resepsiyon takip ekranı için
  emit('COURT_DELIVERY_PLACED', { orderId: order.id, destination: order.destination, countdown: PREP_COUNTDOWN_SEC, courier: order.courier });
  return { ...order };
}

// ---------------------------------------------------------------------------
// 2. Geri Sayım + Kurye Yönlendirme
// ---------------------------------------------------------------------------
export function tickDelivery(orderId: string, seconds = 1): DeliveryOrder | undefined {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  order.countdownLeft = Math.max(0, order.countdownLeft - seconds);
  if (order.countdownLeft === 0 && order.status === 'PREPARING') {
    order.status = 'OUT_FOR_DELIVERY';
    emit('DELIVERY_DISPATCHED', { orderId: order.id, courier: order.courier, destination: order.destination });
  }
  return { ...order };
}

export function markDelivered(orderId: string): DeliveryOrder | undefined {
  const order = orders.find((o) => o.id === orderId);
  if (order) order.status = 'DELIVERED';
  return order ? { ...order } : undefined;
}

export function getDeliveryOrders(): DeliveryOrder[] {
  return [...orders];
}

export function courtDeliveryEngineStatus(): string {
  const preparing = orders.filter((o) => o.status === 'PREPARING').length;
  const out = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  return `Teslimat Hattı: ${orders.length} sipariş • ${preparing} hazırlanıyor • ${out} kuryede • ${PREP_COUNTDOWN_SEC}s hazırlık`;
}
