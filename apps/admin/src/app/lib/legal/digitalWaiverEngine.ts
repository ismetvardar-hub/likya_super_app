// ============================================================================
// 📋 DİJİTAL TIBBİ İZİN & SORUMLULUK FERAGATI DOĞRULAMA (Adım 90)
// Veli dijital imzası, ulusal sağlık belgesi yükleme durumu, acil iletişim.
// Yıllık tıbbi izin süresi dolarsa veya feragat imzasızsa sporcu seans girişi engellenir:
// clearanceStatus: EXPIRED | VALID | PENDING
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type ClearanceStatus = 'EXPIRED' | 'VALID' | 'PENDING';

export interface MedicalClearance {
  signedAt: string | null;   // feragat imza tarihi (null = imzasız)
  expiresAt: string | null;  // yıllık tıbbi izin son kullanma
  healthDocUploaded: boolean;
  emergencyContact?: string;
}

/** İzin durumu: imza yok → PENDING; süresi doldu → EXPIRED; aksi → VALID. */
export function clearanceStatus(c: MedicalClearance, nowMs = Date.now()): ClearanceStatus {
  if (!c.signedAt) return 'PENDING';
  if (!c.expiresAt || new Date(c.expiresAt).getTime() < nowMs) return 'EXPIRED';
  if (!c.healthDocUploaded) return 'PENDING';
  return 'VALID';
}

/** Sporcunun seans girişi engellenmeli mi? (EXPIRED veya PENDING). */
export function blockSessionEntry(c: MedicalClearance, nowMs = Date.now()): boolean {
  return clearanceStatus(c, nowMs) !== 'VALID';
}

export interface WaiverValidation {
  ok: boolean;
  status: ClearanceStatus;
  reason: string;
}

/** Feragat/i̇zin geçerlilik doğrulaması + engelleme gerekçesi. */
export function validateWaiver(c: MedicalClearance, nowMs = Date.now()): WaiverValidation {
  const status = clearanceStatus(c, nowMs);
  const reason =
    status === 'PENDING'
      ? 'Tıbbi izin/feragat bekliyor — veli dijital imzası + sağlık belgesi yüklenmeli'
      : status === 'EXPIRED'
        ? 'Yıllık tıbbi izin süresi doldu — yeniden onay gerekli'
        : 'Tıbbi izin ve feragat geçerli — giriş serbest';
  return { ok: status === 'VALID', status, reason };
}

/** Feragat imzasını kaydeder (dijital onay). */
export function signWaiver(c: MedicalClearance, signature: string, expiresAt: string): MedicalClearance {
  return { ...c, signedAt: signature === '' ? null : new Date().toISOString(), expiresAt: signature === '' ? c.expiresAt : expiresAt };
}

export function digitalWaiverStatus(): string {
  return 'Dijital İzin: imza + sağlık belgesi + acil iletişim • EXPIRED/VALID/PENDING giriş kilidi';
}
