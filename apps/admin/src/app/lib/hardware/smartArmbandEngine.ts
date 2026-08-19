// ============================================================================
// 🏷️ AKILLI PAZU BANDI (Smart Armband) — NFC/RFID + BLE Beacon
// Donanım & Depozito Yaşam Döngüsü Motoru
// - 500 ₺ depozito: ata → iade / irat (kayıp)
// - 5 Nokta Tetikleyici: Kapı/Turnike • Kantin/Pazar POS • Kort yoklaması
// - Mock-first telemetry: donanım yoksa simülasyon verisi üretir
// ============================================================================

import { requestChildPurchase, type ChildSpendProfile } from '../finance/parentalApprovalEngine';

export type ArmbandStatus = 'ACTIVE' | 'RETURNED' | 'LOST';

export interface ArmbandDevice {
  id: string;
  nfcTagId: string;          // NFC/RFID tag kimliği
  bleUuid: string;           // BLE beacon UUID'si
  assignedUserId: string;    // Atanan aile bireyi (veli/çocuk)
  ownerFamilyId: string;     // Aile kaydı
  status: ArmbandStatus;
  depositAmount: number;     // 500 ₺
  depositPaidAt: string;     // ISO
  depositReturnedAt?: string;
  depositForfeitedAt?: string;
  assignedAt: string;
}

export interface DepositLedgerEntry {
  bandId: string;
  event: 'ASSIGNED' | 'RETURNED' | 'FORFEITED';
  amountTl: number;
  at: string;
}

export interface TapAccessResult {
  allowed: boolean;
  reason: string;
  bandId: string;
}

export interface PosSwipeResult {
  approved: boolean;
  state: string;
  message: string;
  parentalNotice: boolean; // >150₺ çocuk harcaması → ebeveyn onayı beklemede
}

// ---------------------------------------------------------------------------
// Hafıza (mock-first: donanım yoksa bellekte tutulur; persistence katmanına
// taşınabilir — Supabase armbands tablosu ile birebir şema uyumlu)
// ---------------------------------------------------------------------------
let bands: ArmbandDevice[] = [];
let ledger: DepositLedgerEntry[] = [];
let seq = 1;

function stamp(): string { return new Date().toISOString(); }

/** Deterministik demo verisi — aktif bantlar. */
export function initMockBands(): ArmbandDevice[] {
  if (bands.length === 0) {
    bands = [
      {
        id: 'BND-001', nfcTagId: 'NFC-8A3F21', bleUuid: 'BLE-7C91-E2', assignedUserId: 'Efe',
        ownerFamilyId: 'FAM-1', status: 'ACTIVE', depositAmount: 500, depositPaidAt: stamp(),
        assignedAt: stamp(),
      },
      {
        id: 'BND-002', nfcTagId: 'NFC-44D9B0', bleUuid: 'BLE-12AB-88', assignedUserId: 'Deniz',
        ownerFamilyId: 'FAM-1', status: 'ACTIVE', depositAmount: 500, depositPaidAt: stamp(),
        assignedAt: stamp(),
      },
    ];
  }
  return bands;
}

// ---------------------------------------------------------------------------
// 🎯 1. Bant Ata — 500 ₺ depozito kaydı oluştur
// ---------------------------------------------------------------------------
export function assignBandToMember(userId: string, familyId: string, opts?: { depositAmount?: number }): { band: ArmbandDevice; depositRecorded: boolean } {
  const deposit = opts?.depositAmount ?? 500;
  const band: ArmbandDevice = {
    id: `BND-${String(seq++).padStart(3, '0')}`,
    nfcTagId: `NFC-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    bleUuid: `BLE-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${Math.random().toString(16).slice(2, 4).toUpperCase()}`,
    assignedUserId: userId,
    ownerFamilyId: familyId,
    status: 'ACTIVE',
    depositAmount: deposit,
    depositPaidAt: stamp(),
    assignedAt: stamp(),
  };
  bands.push(band);
  ledger.push({ bandId: band.id, event: 'ASSIGNED', amountTl: deposit, at: stamp() });
  return { band, depositRecorded: true };
}



// ---------------------------------------------------------------------------
// 🔁 2. İade — bant sağlamsa 500 ₺ depozito geri ödenir
// ---------------------------------------------------------------------------
export function processReturn(bandId: string, opts?: { damaged?: boolean }): { ok: boolean; band?: ArmbandDevice; refundTl: number; message: string } {
  const band = bands.find((b) => b.id === bandId);
  if (!band) return { ok: false, refundTl: 0, message: `Bant bulunamadı: ${bandId}` };
  if (band.status !== 'ACTIVE') return { ok: false, refundTl: 0, message: `Bant ${band.status === 'LOST' ? 'kayıp (irat edildi)' : 'zaten iade edilmiş'}` };
  if (opts?.damaged) {
    band.status = 'LOST';
    band.depositForfeitedAt = stamp();
    ledger.push({ bandId: band.id, event: 'FORFEITED', amountTl: band.depositAmount, at: stamp() });
    return { ok: true, band, refundTl: 0, message: 'Bant hasarlı — depozito irat kaydedildi (hasar bedeli kesintisi)' };
  }
  band.status = 'RETURNED';
  band.depositReturnedAt = stamp();
  ledger.push({ bandId: band.id, event: 'RETURNED', amountTl: band.depositAmount, at: stamp() });
  return { ok: true, band, refundTl: band.depositAmount, message: `${band.id} iade edildi — ${band.depositAmount} ₺ depozito iade edildi` };
}

// ---------------------------------------------------------------------------
// 🚨 3. Kayıp Bildir — anında kilitle, yetkileri iptal et, depozitoyu irat yaz
// ---------------------------------------------------------------------------
export function reportLost(bandId: string): { band: ArmbandDevice; accessRevoked: boolean; forfeitedTl: number } {
  const band = bands.find((b) => b.id === bandId)!;
  band.status = 'LOST';
  band.depositForfeitedAt = stamp();
  ledger.push({ bandId: band.id, event: 'FORFEITED', amountTl: band.depositAmount, at: stamp() });
  return { band, accessRevoked: true, forfeitedTl: band.depositAmount };
}

// ---------------------------------------------------------------------------
// 🚪 4a. Kapı / Turnike — NFC dokunuşu ile geçiş izni
// ---------------------------------------------------------------------------
export function onTapAccess(nfcTagId: string): TapAccessResult {
  const band = bands.find((b) => b.nfcTagId === nfcTagId);
  if (!band) return { allowed: false, reason: 'Bilinmeyen NFC tag — giriş engellendi', bandId: nfcTagId };
  if (band.status === 'LOST') return { allowed: false, reason: `Bandı kilitli (kayıp) — giriş reddedildi (${band.id})`, bandId: band.id };
  if (band.status === 'RETURNED') return { allowed: false, reason: `Bandı iade edildi — giriş reddedildi (${band.id})`, bandId: band.id };
  return { allowed: true, reason: `✅ Geçiş izni verildi — ${band.assignedUserId} (${band.id})`, bandId: band.id };
}

// ---------------------------------------------------------------------------
// 🛒 4b. Kantin / Pazar POS — çocuk için >150 ₺ harcama → ebeveyn onay motoru
// ---------------------------------------------------------------------------
const CHILD_SPEND_THRESHOLD_TL = 150;

export function posSwipeCanteen(bandId: string, amountTl: number, item: string): PosSwipeResult {
  const band = bands.find((b) => b.id === bandId);
  if (!band) return { approved: false, state: 'INVALID_BAND', message: 'Bant tanınmadı', parentalNotice: false };
  if (band.status !== 'ACTIVE') return { approved: false, state: 'BLOCKED', message: `Bant ${band.status} — POS reddedildi`, parentalNotice: false };

  // Çocuk harcaması: >150 ₺ ise parentalApprovalEngine tetikle
  const isChild = band.assignedUserId === 'Efe' || band.assignedUserId === 'Deniz';
  if (isChild && amountTl > CHILD_SPEND_THRESHOLD_TL) {
    const profile: ChildSpendProfile = { childId: band.assignedUserId, dailyMicroLimitTl: 150, spentTodayTl: Math.round(amountTl * 0.2), cardSaved: true };
    const decision = requestChildPurchase({ requestId: `POS-${Date.now()}`, childId: band.assignedUserId, childName: band.assignedUserId, item, amountTl, category: 'kantin' }, profile);
    return { approved: decision.state === 'AUTO_APPROVED' || decision.state === 'APPROVED', state: decision.state, message: decision.message, parentalNotice: decision.state === 'PENDING_PARENT_APPROVAL' };
  }
  return { approved: true, state: 'AUTO_APPROVED', message: `${amountTl} ₺ tahsil edildi (${item})`, parentalNotice: false };
}

// ---------------------------------------------------------------------------
// 📈 Yardımcılar
// ---------------------------------------------------------------------------
export function listBands(familyId?: string): ArmbandDevice[] {
  return familyId ? bands.filter((b) => b.ownerFamilyId === familyId) : [...bands];
}

export function getDepositLedger(): DepositLedgerEntry[] {
  return [...ledger];
}

export function smartArmbandEngineStatus(): string {
  const active = bands.filter((b) => b.status === 'ACTIVE').length;
  const returned = bands.filter((b) => b.status === 'RETURNED').length;
  const lost = bands.filter((b) => b.status === 'LOST').length;
  const totalDeposit = bands.reduce((s, b) => s + (b.status === 'ACTIVE' ? b.depositAmount : 0), 0);
  return `Pazu Bandı Motoru: ${bands.length} bant • ${active} aktif • ${returned} iade • ${lost} kayıp • ${totalDeposit} ₺ aktif depozito`;
}
