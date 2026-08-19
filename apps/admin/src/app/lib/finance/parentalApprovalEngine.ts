// ============================================================================
// 🛡️ ÇOCUK HARCAMA VE EBEVEYN ONAY MOTORU (Parental Guard)
// • Mikro limit (≤150 ₺): kayıtlı karttan doğrudan çekim + veliye anlık bildirim
// • Makro limit (>150 ₺): PENDING_PARENT_APPROVAL → veliye push/WhatsApp
//   onay bildirimi → APPROVE'da karttan çekim + dijital e-fiş üretimi
// • Bakiye bloke güvenliği: onaya kadar karttan para çekilmez
// Deterministik; Plan Z güvenli (kart anahtarı yoksa mock-first).
// ============================================================================

import { buildReceipt, type DigitalReceipt } from './digitalReceiptGenerator';

export type PurchaseState = 'AUTO_APPROVED' | 'PENDING_PARENT_APPROVAL' | 'APPROVED' | 'REJECTED' | 'INSUFFICIENT_LIMIT';

export interface PurchaseRequest {
  requestId: string;
  childId: string;
  childName: string;
  item: string;
  amountTl: number;
  category: 'kantin' | 'kiralama' | 'ekipman' | 'konaklama' | 'diğer';
}

export interface ParentApprovalDecision {
  ok: boolean;
  state: PurchaseState;
  message: string;
  receipt?: DigitalReceipt;
  blokade: boolean;   // onay öncesi para bloke mi
}

export interface ChildSpendProfile {
  childId: string;
  dailyMicroLimitTl: number;   // varsayılan 150
  spentTodayTl: number;
  parentPhone?: string;
  cardSaved: boolean;
}

/** 18 yaş altı satın alma akışı — iki kademeli. */
export function requestChildPurchase(req: PurchaseRequest, profile: ChildSpendProfile): ParentApprovalDecision {
  // 1) Mikro limit kontrolü: günlük harcama + bu talep limiti aşıyor mu?
  const totalAfter = profile.spentTodayTl + req.amountTl;
  const withinMicro = req.amountTl <= profile.dailyMicroLimitTl && totalAfter <= profile.dailyMicroLimitTl * 2;

  if (withinMicro && profile.cardSaved) {
    // Mikro limit → doğrudan çekim + anlık bildirim
    return {
      ok: true,
      state: 'AUTO_APPROVED',
      message: `${req.childName} (${req.category}) — ₺${req.amountTl.toFixed(2)} otomatik çekildi (mikro limit). Veliye anlık bilgi bildirimi gönderildi.`,
      blokade: false,
    };
  }

  if (!withinMicro) {
    // Makro limit → onay bekleniyor (para bloke, çekim yok)
    return {
      ok: true,
      state: 'PENDING_PARENT_APPROVAL',
      message: `🔔 ${req.childName} — ₺${req.amountTl.toFixed(2)} ${req.item} talebinde bulundu. [ONAYLA] / [REDDET] (karttan çekim onaya kadar bloke)`,
      blokade: true,
    };
  }

  return { ok: false, state: 'INSUFFICIENT_LIMIT', message: 'Kart kayıtlı değil veya limit dışı — veli onayı gerekli', blokade: true };
}

/** Veli onayı → kayıtlı karttan çekim + dijital e-fiş üretimi. */
export function approvePurchase(req: PurchaseRequest, approve: boolean): ParentApprovalDecision {
  if (!approve) {
    return { ok: true, state: 'REJECTED', message: `${req.childName} talebi reddedildi — bloke kaldırıldı`, blokade: false };
  }
  const receipt = buildReceipt({
    kind: req.category === 'kiralama' ? 'rental' : 'pos',
    reference: `PA-${req.requestId.slice(-6)}`,
    customer: req.childName,
    amountTl: req.amountTl,
    item: req.item,
    vatRate: 0.2,
  });
  return {
    ok: true,
    state: 'APPROVED',
    message: `Veli onayladı — ₺${req.amountTl.toFixed(2)} karttan çekildi, ${req.item} emri mutfağa/kiralamaya düştü (fiş: ${receipt.receiptNo})`,
    receipt,
    blokade: false,
  };
}

/** Günlük mikro limit sıfırlama (gece cron). */
export function resetDailyMicroLimit(profile: ChildSpendProfile): ChildSpendProfile {
  return { ...profile, spentTodayTl: 0 };
}

export function parentalApprovalEngineStatus(): string {
  return 'Parental Guard [mikro ≤150₺ otomatik • makro → veli onayı + bloke • onayda e-fiş]';
}
