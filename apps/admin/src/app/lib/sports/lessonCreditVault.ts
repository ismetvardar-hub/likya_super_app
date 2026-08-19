// ============================================================================
// 🎟️ 365 GÜN YANMAYAN DERS KREDİSİ HAVUZU (Credit Vault)
// Katılınmayan dersler 365 gün geçerli LessonCredit olarak birikir.
// • Telafi rezervasyonu (grup / birebir 3→1 dönüşüm katsayısı)
// • Kardeşler arası kredi transferi
// • Kontenjan dolumu: check-out sonrası boşalan yer otomatik önerilir
// Deterministik; Plan Z güvenli.
// ============================================================================

export interface LessonCredit {
  id: string;
  studentId: string;
  sourceLessonId: string;
  credits: number;          // 1 kredi = 1 grup dersi
  expiresAt: string;        // katılım tarihi + 365 gün
  used: boolean;
}

export interface CreditVault {
  ownerId: string;
  credits: LessonCredit[];
}

export function createLessonCredit(studentId: string, sourceLessonId: string, missedAt = new Date()): LessonCredit {
  const expires = new Date(missedAt);
  expires.setDate(expires.getDate() + 365);
  return { id: `LC-${Date.now().toString(36)}-${sourceLessonId.slice(-4)}`, studentId, sourceLessonId, credits: 1, expiresAt: expires.toISOString(), used: false };
}

export function vaultBalance(vault: CreditVault): { totalCredits: number; usable: number; expired: number } {
  const now = Date.now();
  const usable = vault.credits.filter((c) => !c.used && new Date(c.expiresAt).getTime() > now);
  const expired = vault.credits.filter((c) => !c.used && new Date(c.expiresAt).getTime() <= now);
  return {
    totalCredits: vault.credits.reduce((a, c) => a + c.credits, 0),
    usable: usable.reduce((a, c) => a + c.credits, 0),
    expired: expired.reduce((a, c) => a + c.credits, 0),
  };
}

/** Telafi rezervasyonu — grup dersi (1 kredi) veya özel ders (3 kredi → 1 seans). */
export function reserveMakeup(vault: CreditVault, sessionType: 'group' | 'private'): { ok: boolean; required: number; message: string; consumed?: LessonCredit[] } {
  const required = sessionType === 'private' ? 3 : 1;
  const balance = vaultBalance(vault);
  if (balance.usable < required) return { ok: false, required, message: `Yetersiz kredi — ${required} kredi gerekli, ${balance.usable} mevcut` };
  const consumed: LessonCredit[] = [];
  let need = required;
  for (const c of vault.credits) {
    if (need <= 0) break;
    if (!c.used && new Date(c.expiresAt).getTime() > Date.now()) {
      c.used = true;
      consumed.push(c);
      need--;
    }
  }
  return { ok: true, required, consumed, message: `${required} kredi kullanıldı → ${sessionType === 'private' ? 'birebir özel ders (3 grup = 1 özel)' : 'grup telafi dersi'} rezerve edildi` };
}

/** Kardeşler arası kredi transferi. */
export function transferCredit(from: CreditVault, toStudentId: string, creditId: string): { ok: boolean; message: string; transferred?: LessonCredit } {
  const credit = from.credits.find((c) => c.id === creditId && !c.used);
  if (!credit) return { ok: false, message: 'Kredi bulunamadı veya kullanılmış' };
  credit.used = true;
  const transferred: LessonCredit = { ...credit, id: `LC-${Date.now().toString(36)}`, studentId: toStudentId, used: false };
  return { ok: true, message: `Kredi ${toStudentId} hesabına devredildi (365 gün geçerli)`, transferred };
}

/** Check-out sonrası boşalan kontenjanı telafi bekleyenlere öner. */
export function autoFillFreeSlot(waiterIds: string[], capacity = 1): { suggested: string[]; note: string } {
  const suggested = waiterIds.slice(0, capacity);
  return { suggested, note: suggested.length > 0 ? `${suggested.join(', ')} için otomatik kontenjan önerildi` : 'Telafi bekleyen yok' };
}

export function lessonCreditVaultStatus(): string {
  return 'Ders Kredisi Vault [365 gün • grup/özel 3→1 • kardeş transfer • oto kontenjan dolumu]';
}
