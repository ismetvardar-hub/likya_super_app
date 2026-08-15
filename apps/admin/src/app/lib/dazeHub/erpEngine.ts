// ============================================================================
// 💼 LİKYA AÇIK KAYNAK FİNANS & ERP OMURGASI (Daze Hub ERP) 
// ERPNext esintili: reçete hammadde tüketimi, canlı stok uyarıları,
// Daze Crew prim/bordro şeması. 100% deterministik matematik — LLM YOK.
// ============================================================================

export type StockUnit = 'adet' | 'kg' | 'lt' | 'gr' | 'ml' | 'paket' | 'dilim';

export interface StockItem {
  id: string;
  name: string;
  unit: StockUnit;
  quantity: number;
  reorderPoint: number;   // altında ise "yeniden sipariş" uyarısı
}

export type StockMap = Record<string, number>;

export interface RecipeIngredient {
  itemId: string;
  qtyPerOutput: number;   // birim çıktı başına tüketim
  unit: StockUnit;
}

export interface Recipe {
  id: string;
  name: string;
  outputUnit: StockUnit;
  ingredients: RecipeIngredient[];
}

export interface StockAlert {
  itemId: string;
  name: string;
  remaining: number;
  reorderPoint: number;
  severity: 'DÜŞÜK' | 'KRİTİK' | 'TÜKENDİ';
}

export interface ConsumptionResult {
  stock: StockMap;
  consumed: Record<string, number>;
  alerts: StockAlert[];
  costTL: number;
  succeeded: boolean;
  failureReason?: string;
}

// Reçete için hammadde tüketimi (canlı stok uyarıları üretir)
export function consumeRecipe(
  recipe: Recipe,
  count: number,
  stock: StockMap,
  itemCatalog: Record<string, StockItem>,
  unitPrices: Record<string, number> = {}
): ConsumptionResult {
  if (count <= 0) return { stock: { ...stock }, consumed: {}, alerts: [], costTL: 0, succeeded: true };

  const needed: Record<string, number> = {};
  for (const ing of recipe.ingredients) {
    needed[ing.itemId] = ing.qtyPerOutput * count;
  }
  // Önce tümünün stokta olduğunu kontrol et (atomik tüketim)
  for (const [itemId, qty] of Object.entries(needed)) {
    const available = stock[itemId] ?? 0;
    if (available < qty) {
      return {
        stock: { ...stock },
        consumed: {},
        alerts: [],
        costTL: 0,
        succeeded: false,
        failureReason: `Yetersiz stok: ${itemCatalog[itemId]?.name ?? itemId} (gerekli ${qty}, mevcut ${available})`,
      };
    }
  }

  const newStock: StockMap = { ...stock };
  const consumed: Record<string, number> = {};
  const alerts: StockAlert[] = [];
  let costTL = 0;

  for (const [itemId, qty] of Object.entries(needed)) {
    newStock[itemId] = Math.max(0, (newStock[itemId] ?? 0) - qty);
    consumed[itemId] = qty;
    costTL += (unitPrices[itemId] ?? 0) * qty;
    const item = itemCatalog[itemId];
    if (!item) continue;
    const remaining = newStock[itemId] ?? 0;
    if (remaining <= 0) alerts.push({ itemId, name: item.name, remaining: 0, reorderPoint: item.reorderPoint, severity: 'TÜKENDİ' });
    else if (remaining <= item.reorderPoint * 0.5) alerts.push({ itemId, name: item.name, remaining, reorderPoint: item.reorderPoint, severity: 'KRİTİK' });
    else if (remaining <= item.reorderPoint) alerts.push({ itemId, name: item.name, remaining, reorderPoint: item.reorderPoint, severity: 'DÜŞÜK' });
  }

  return { stock: newStock, consumed, alerts, costTL: Math.round(costTL * 100) / 100, succeeded: true };
}

// Canlı stok uyarı taraması (reçete yok — tüm katalog)
export function scanStockAlerts(stock: StockMap, itemCatalog: Record<string, StockItem>): StockAlert[] {
  const alerts: StockAlert[] = [];
  for (const item of Object.values(itemCatalog)) {
    const remaining = stock[item.id] ?? 0;
    if (remaining <= 0) alerts.push({ itemId: item.id, name: item.name, remaining: 0, reorderPoint: item.reorderPoint, severity: 'TÜKENDİ' });
    else if (remaining <= item.reorderPoint * 0.5) alerts.push({ itemId: item.id, name: item.name, remaining, reorderPoint: item.reorderPoint, severity: 'KRİTİK' });
    else if (remaining <= item.reorderPoint) alerts.push({ itemId: item.id, name: item.name, remaining, reorderPoint: item.reorderPoint, severity: 'DÜŞÜK' });
  }
  return alerts;
}

// ----------------------------------------------------------------------------
// DAZE CREW PRİM & BORDRO ŞEMASI
// ----------------------------------------------------------------------------
export interface PayrollLine {
  employeeId: string;
  name: string;
  baseRateTL: number;     // saatlik ücret
  hours: number;          // normal çalışma saati
  overtimeHours?: number; // %150
  weekendHours?: number;  // %200
  shiftCount?: number;    // vardiya primi (adet başına 150 TL)
}

export interface PayrollResult {
  grossTL: number;
  overtimeTL: number;
  weekendTL: number;
  shiftBonusTL: number;
  netTL: number;          // %22 vergi+kesinti sonrası (basitleştirilmiş)
  totalTL: number;
}

const SHIFT_BONUS_TL = 150;
const TAX_RATE = 0.22;

export function calculatePayrollLine(line: PayrollLine): PayrollResult {
  const base = line.baseRateTL * line.hours;
  const overtime = line.baseRateTL * 1.5 * (line.overtimeHours ?? 0);
  const weekend = line.baseRateTL * 2 * (line.weekendHours ?? 0);
  const shiftBonus = SHIFT_BONUS_TL * (line.shiftCount ?? 0);
  const gross = base + overtime + weekend + shiftBonus;
  const net = gross * (1 - TAX_RATE);
  return {
    grossTL: Math.round(gross),
    overtimeTL: Math.round(overtime),
    weekendTL: Math.round(weekend),
    shiftBonusTL: Math.round(shiftBonus),
    netTL: Math.round(net),
    totalTL: Math.round(gross),
  };
}

export function calculatePayroll(lines: PayrollLine[]): { rows: { line: PayrollLine; result: PayrollResult }[]; grandTotalNetTL: number } {
  const rows = lines.map((line) => ({ line, result: calculatePayrollLine(line) }));
  const grandTotalNetTL = rows.reduce((sum, r) => sum + r.result.netTL, 0);
  return { rows, grandTotalNetTL };
}

// Prim hesaplama: satış başına komisyon
export interface SaleRecord { employeeId: string; amountTL: number; }

export function calculateCommission(sales: SaleRecord[], ratePct: number): { byEmployee: Record<string, number>; totalTL: number } {
  const byEmployee: Record<string, number> = {};
  for (const s of sales) {
    byEmployee[s.employeeId] = (byEmployee[s.employeeId] ?? 0) + s.amountTL * (ratePct / 100);
  }
  for (const k of Object.keys(byEmployee)) byEmployee[k] = Math.round(byEmployee[k]);
  const totalTL = Object.values(byEmployee).reduce((a, b) => a + b, 0);
  return { byEmployee, totalTL };
}

// Stok değeri (TL)
export function stockValueTL(stock: StockMap, unitPrices: Record<string, number>): number {
  return Object.entries(stock).reduce((sum, [id, qty]) => sum + (unitPrices[id] ?? 0) * qty, 0);
}

