// ============================================================================
// 🏦 CLUB-FINANCE · Domain Value Object: TaxId (TR Vergi Kimlik No)
// İzole, framework-agnostic. Format + checksum doğrulama (VKN algoritması).
// ============================================================================

export function isValidTrTaxId(raw: string): boolean {
  const vkn = raw.replace(/[\s.-]/g, '');
  if (!/^\d{10}$/.test(vkn)) return false;
  if (vkn[0] === '0') return false; // ilk hane sıfır olamaz

  let t = 0;
  for (let i = 0; i < 9; i++) {
    const d = Number(vkn[i]);
    const td = (d + t) % 10;
    t = td === 0 ? 0 : ((td * 2) % 9) || 9;
  }
  const check = (t + Number(vkn[9])) % 10;
  return check === 0;
}

export class TaxId {
  private constructor(public readonly value: string) {}

  static from(raw: string): TaxId {
    if (!isValidTrTaxId(raw)) {
      throw new Error(`Geçersiz TR vergi kimlik numarası: "${raw}" — 10 hane + checksum gereklidir`);
    }
    return new TaxId(raw.replace(/[\s.-]/g, ''));
  }

  static tryFrom(raw: string): TaxId | null {
    try { return TaxId.from(raw); } catch { return null; }
  }

  equals(other: TaxId): boolean {
    return this.value === other.value;
  }
}
