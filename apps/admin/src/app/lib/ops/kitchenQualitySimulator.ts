// ============================================================================
// 🏭 DAZE CHEF — KONVEYÖR KALİTE KONTROL & DAMGALAMA SİMÜLATÖRÜ
// Üretim bandı tarzı mutfak sipariş sayımı + QC damgalama (Stamping).
// Kalite kontrolü geçemeyen hatalı tabak/ürünleri otomatik tespit eder ve
// Daze Chef ekranına uyarı basar. Deterministik; Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export type QcVerdict = 'PASS' | 'REJECT';

export interface PlateItem {
  id: string;
  name: string;
  tempC: number;            // servis sıcaklığı (ideal 65-80°C)
  weightG: number;          // gramaj (porsiyon toleransı ±%10)
  expectedG: number;
  visualScore: number;      // 0-1 görsel puan
}

export interface ConveyorResult {
  counted: number;
  passed: number;
  rejected: PlateItem[];
  stampRef: string | null;
  qcPct: number;
  warnChef: boolean;
}

/** Konveyör sayım + kalite kontrol + damga. */
export function conveyorQualityControl(items: PlateItem[]): ConveyorResult {
  const passed: PlateItem[] = [];
  const rejected: PlateItem[] = [];

  items.forEach((item) => {
    const tempOk = item.tempC >= 65 && item.tempC <= 80;
    const weightOk = Math.abs(item.weightG - item.expectedG) / item.expectedG <= 0.1;
    const visualOk = item.visualScore >= 0.75;
    (tempOk && weightOk && visualOk ? passed : rejected).push(item);
  });

  const qcPct = items.length > 0 ? Math.round((passed.length / items.length) * 100) : 0;
  const stampRef = rejected.length === 0 ? `STAMP-QC-${Date.now().toString(36).toUpperCase().slice(-5)}` : null;

  if (rejected.length > 0) {
    staffTaskDispatched(`QC-${Date.now().toString(36).slice(-4).toUpperCase()}`, `HATALI ÜRÜN: ${rejected.map((r) => r.name).join(', ')} — yeniden hazırla`, 0, 6);
  }

  return {
    counted: items.length,
    passed: passed.length,
    rejected,
    stampRef,
    qcPct,
    warnChef: rejected.length > 0,
  };
}

/** Hatalı tabak uyarı satırı (Daze Chef ekranı). */
export function chefWarning(rejected: PlateItem[]): string {
  if (rejected.length === 0) return '🟢 Bant temiz — tüm ürünler QC geçti';
  return `🔴 Daze Chef uyarısı: ${rejected.map((r) => `${r.name} (${rejectedReason(r)})`).join(' • ')} — yeniden hazırlayın`;
}
function rejectedReason(item: PlateItem): string {
  if (item.tempC < 65 || item.tempC > 80) return `sıcaklık ${item.tempC}°C`;
  if (Math.abs(item.weightG - item.expectedG) / item.expectedG > 0.1) return `gramaj ${item.weightG}g`;
  return `görsel ${Math.round(item.visualScore * 100)}%`;
}

export function kitchenQualitySimulatorStatus(): string {
  return 'Mutfak QC [konveyör sayım • QC damga • sıcaklık/gramaj/görsel • hatalı ürün uyarısı]';
}
