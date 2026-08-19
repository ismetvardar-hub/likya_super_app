// ============================================================================
// 🍽️ BLOK 4 (Aşama 31-40) — DAZE GASTRONOMİ, AKILLI MUTFAK & TEDARİK ZİNCİRİ
// Menu engineering • KDS yoğunluk tahmini • Tedarikçi PO • IoT sıcaklık •
// Porsiyon optimizasyonu • İstasyon bölücü • Alerjen/kalori • QR masa hizmeti •
// Kurye rota • FIFO/LIFO. Tamamı deterministik + fallback. Plan Z.
// ============================================================================

// Aşama 31 — Menu Engineering matrisi (kârlılık × popülarite)
export type MenuQuadrant = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
export function menuEngineering(item: { name: string; sales: number; marginPct: number }, avgSales: number, avgMargin = 60): { quadrant: MenuQuadrant; note: string } {
  const popular = item.sales >= avgSales;
  const profitable = item.marginPct >= avgMargin;
  const quadrant: MenuQuadrant = popular && profitable ? 'STAR' : !popular && profitable ? 'PUZZLE' : popular && !profitable ? 'PLOWHORSE' : 'DOG';
  const note = quadrant === 'STAR' ? 'Yıldız — öne çıkar' : quadrant === 'PLOWHORSE' ? 'At — fiyat optimizasyonu' : quadrant === 'PUZZLE' ? 'Bilmece — tanıtım yap' : 'Köpek — menüden çıkar/indir';
  return { quadrant, note };
}

// Aşama 32 — KDS yoğunluk tahmini (AI)
export function kitchenDensityForecast(orderQueue: number[], prepMinPerOrder = 8): { estimatedWaitMin: number; load: 'düşük' | 'orta' | 'yoğun' } {
  const queue = orderQueue.length;
  const active = orderQueue.slice(-10).reduce((a, b) => a + b, 0);
  const wait = Math.max(3, Math.round((queue * 3 + active * prepMinPerOrder / 10)));
  const load = queue > 12 ? 'yoğun' : queue > 5 ? 'orta' : 'düşük';
  return { estimatedWaitMin: wait, load };
}

// Aşama 33 — Tedarikçi otomatik satın alma emri (min stok eşiği)
export function autoPurchaseOrder(stock: { ingredient: string; grams: number }[], thresholdGrams = 2000, supplier = 'Yerel Kooperatif'): { purchaseOrders: { ingredient: string; orderGrams: number; supplier: string }[] } {
  return {
    purchaseOrders: stock.filter((s) => s.grams < thresholdGrams).map((s) => ({ ingredient: s.ingredient, orderGrams: thresholdGrams * 2 - s.grams, supplier })),
  };
}

// Aşama 34 — Soğuk depo/fırın IoT sıcaklık alarmı
export function coldChainAlarm(zone: string, tempC: number, limits: { min: number; max: number }): { ok: boolean; alarm: string | null } {
  if (tempC < limits.min || tempC > limits.max) return { ok: false, alarm: `${zone} sıcaklık ${tempC}°C sınır dışı (${limits.min}-${limits.max}°C) — müdahale gerekli` };
  return { ok: true, alarm: null };
}

// Aşama 35 — Dinamik porsiyonlama (atık azaltma)
export function dynamicPortioning(expectedGuests: number, prepYieldGrams: number): { portionGrams: number; portions: number; wasteGrams: number } {
  const portions = Math.max(1, Math.round(expectedGuests * 0.95));
  const portionGrams = Math.max(50, Math.round(prepYieldGrams / portions));
  return { portionGrams, portions, wasteGrams: Math.max(0, prepYieldGrams - portionGrams * portions) };
}

// Aşama 36 — İstasyon bazlı görev bölücü
export type KitchenStation = 'Izgara' | 'Soğuk' | 'İçecek' | 'Fırın';
export function stationAssigner(items: { item: string; station: KitchenStation }[]): Record<KitchenStation, string[]> {
  const out: Record<KitchenStation, string[]> = { Izgara: [], Soğuk: [], İçecek: [], Fırın: [] };
  items.forEach((i) => out[i.station].push(i.item));
  return out;
}

// Aşama 37 — Alerjen/kalori takibi
export const ALLERGENS = ['gluten', 'süt', 'yumurta', 'fıstık', 'deniz ürünü', 'soya'] as const;
export function allergenScan(ingredients: string[]): { detected: string[]; safe: boolean } {
  const detected = ALLERGENS.filter((a) => ingredients.some((i) => i.toLowerCase().includes(a)));
  return { detected, safe: detected.length === 0 };
}

// Aşama 38 — QR masa hizmeti (garson çağır / hesap / ek sipariş)
export function tableServiceCommand(tableNo: number, action: 'call' | 'bill' | 'order'): { queueRef: string; priority: number; note: string } {
  const priority = action === 'bill' ? 3 : action === 'call' ? 2 : 1;
  return { queueRef: `T${tableNo}-${action}-${Date.now().toString(36).slice(-4)}`, priority, note: `Masa ${tableNo}: ${action}` };
}

// Aşama 39 — Paket servis rota optimizasyonu + kurye takibi
export function courierRoute(stops: { id: string; x: number; y: number }[]): { route: string[]; totalDistance: number } {
  if (stops.length === 0) return { route: [], totalDistance: 0 };
  const sorted = [...stops].sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  let dist = 0;
  for (let i = 1; i < sorted.length; i++) dist += Math.hypot(sorted[i].x - sorted[i - 1].x, sorted[i].y - sorted[i - 1].y);
  return { route: sorted.map((s) => s.id), totalDistance: Math.round(dist * 10) / 10 };
}

// Aşama 40 — FIFO/LIFO bayatlama takibi
export function expiryAdvisory(ingredient: string, daysToExpiry: number, method: 'FIFO' | 'LIFO'): { status: 'OK' | 'YAKLAŞIYOR' | 'KRİTİK'; action: string } {
  if (daysToExpiry <= 1) return { status: 'KRİTİK', action: `${ingredient} bugün kullan — menüye günün önerisi olarak koy` };
  if (daysToExpiry <= 3) return { status: 'YAKLAŞIYOR', action: `${method} kuralıyla öncelikli tüket` };
  return { status: 'OK', action: `${method} düzeni sağlıklı` };
}

export function gastronomyIntelligenceStatus(): string {
  return 'Gastronomi AI [menu eng • KDS • PO otomasyonu • cold chain • istasyon • alerjen • rota • FIFO]';
}
