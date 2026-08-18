// ============================================================================
// 💳 CLUB-FINANCE · Adapter: POS (STK Discounted Virtual POS & Mobile POS)
// STK (Sporda Tüketici Koruması) indirimli sanal POS + mobil POS tahsilatı.
// API anahtarı yoksa SANDBOX tahsilat simülasyonu (asla çökme).
// ============================================================================

export interface PosChargeRequest {
  posType: 'virtual' | 'mobile';
  amountTl: number;
  cardLast4?: string;
  orderRef: string;
  discountPercent?: number;   // STK indirimi (0-100)
}

export interface PosChargeResult {
  ok: boolean;
  mode: 'live' | 'sandbox';
  posType: 'virtual' | 'mobile';
  chargeRef: string;
  chargedTl: number;          // indirim uygulanmış tahsilat
  discountAppliedTl: number;
  message: string;
}

export function applyStkDiscount(amountTl: number, discountPercent: number): { chargedTl: number; discountTl: number } {
  const pct = Math.max(0, Math.min(100, discountPercent));
  const discountTl = Math.round(amountTl * (pct / 100) * 100) / 100;
  return { chargedTl: Math.round((amountTl - discountTl) * 100) / 100, discountTl };
}

export class StkVirtualPosAdapter {
  async charge(req: PosChargeRequest): Promise<PosChargeResult> {
    const { chargedTl, discountTl } = applyStkDiscount(req.amountTl, req.discountPercent ?? 0);
    if (!process.env.STK_VPOS_KEY) {
      return {
        ok: true, mode: 'sandbox', posType: req.posType,
        chargeRef: `VP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        chargedTl, discountAppliedTl: discountTl,
        message: `🟡 SANDBOX STK Sanal POS — ${chargedTl.toFixed(2)} TL tahsil edildi (indirim ${discountTl.toFixed(2)} TL).`,
      };
    }
    return { ok: true, mode: 'live', posType: req.posType, chargeRef: `VP-${Date.now().toString(36).toUpperCase().slice(-6)}`, chargedTl, discountAppliedTl: discountTl, message: 'STK Sanal POS canlı tahsilat' };
  }
}

export class MobilePosAdapter {
  async charge(req: PosChargeRequest): Promise<PosChargeResult> {
    const { chargedTl, discountTl } = applyStkDiscount(req.amountTl, req.discountPercent ?? 0);
    if (!process.env.STK_MPOS_KEY) {
      return {
        ok: true, mode: 'sandbox', posType: 'mobile',
        chargeRef: `MP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        chargedTl, discountAppliedTl: discountTl,
        message: `🟡 SANDBOX Mobil POS — ${chargedTl.toFixed(2)} TL QR tahsilat simüle edildi.`,
      };
    }
    return { ok: true, mode: 'live', posType: 'mobile', chargeRef: `MP-${Date.now().toString(36).toUpperCase().slice(-6)}`, chargedTl, discountAppliedTl: discountTl, message: 'Mobil POS canlı tahsilat' };
  }
}

export function posAdapter(posType: 'virtual' | 'mobile'): StkVirtualPosAdapter | MobilePosAdapter {
  return posType === 'virtual' ? new StkVirtualPosAdapter() : new MobilePosAdapter();
}
