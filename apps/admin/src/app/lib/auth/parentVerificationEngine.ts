// ============================================================================
// 🔐 GÜVENLİ VELİ-ÇOCUK BAĞLAMA & OTP MOTORU (Adım 59)
// • 6 haneli geçici OTP / sihirli doğrulama token'ı üretimi
// • Bağlama: antrenör/kulüp onayı VEYA kayıtlı milli sporcu kimliği/telefon eşleşmesi
// • Token 15 dakika sonra dolar; isteğe bağlı iptal (revoke) edilebilir
// Deterministik OTP (test için seed desteği); sıfır bağımlılık.
// ============================================================================

export const OTP_TTL_MINUTES = 15;

export type VerificationStatus = 'pending' | 'verified' | 'expired' | 'revoked';

export interface VerificationToken {
  token: string;           // 6 haneli OTP
  athleteId: string;
  parentUserId: string;
  createdAt: string;
  expiresAt: string;
  status: VerificationStatus;
}

export interface VerificationContext {
  token: string;
  nowMs?: number;                        // test için saat geçersiz kılma
  nationalIdMatch?: boolean;             // kayıtlı milli sporcu kimliği eşleşmesi
  phoneMatch?: boolean;                  // kayıtlı öğrenci telefonu eşleşmesi
  coachConfirmed?: boolean;              // antrenör/kulüp onayı
}

/** 6 haneli OTP üretir (seed verilirse deterministik). */
export function generateSixDigitOtp(seed?: number): string {
  if (seed !== undefined) {
    const s = seed >>> 0;
    const x = Math.imul(s ^ (s >>> 15), 1 | s);
    const y = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    const v = ((y ^ (y >>> 14)) >>> 0) % 1_000_000;
    return String(v).padStart(6, '0');
  }
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

export class ParentVerificationEngine {
  private tokens = new Map<string, VerificationToken>();

  /** Sporcu için veli OTP token'ı oluşturur (15 dk geçerli). */
  generateOtp(athleteId: string, parentUserId: string, seed?: number): VerificationToken {
    const now = new Date();
    const expires = new Date(now.getTime() + OTP_TTL_MINUTES * 60_000);
    const token: VerificationToken = {
      token: generateSixDigitOtp(seed),
      athleteId,
      parentUserId,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: 'pending',
    };
    this.tokens.set(token.token, token);
    return token;
  }

  /**
   * OTP'yi doğrular: süre + kod + bağlama koşulu.
   * Bağlama için antrenör onayı VEYA milli kimlik/telefon eşleşmesi gerekir.
   */
  verify(input: VerificationContext): { ok: boolean; error?: string } {
    const nowMs = input.nowMs ?? Date.now();
    const token = this.tokens.get(input.token);
    if (!token) return { ok: false, error: 'TOKEN_YOK' };
    if (token.status === 'revoked') return { ok: false, error: 'TOKEN_REVOKED' };
    if (new Date(token.expiresAt).getTime() < nowMs) {
      token.status = 'expired';
      return { ok: false, error: 'TOKEN_EXPIRED' };
    }
    if (!input.coachConfirmed && !input.nationalIdMatch && !input.phoneMatch) {
      return { ok: false, error: 'LINK_NOT_CONFIRMED: antrenör onayı veya kimlik/telefon eşleşmesi gerekli' };
    }
    token.status = 'verified';
    return { ok: true };
  }

  /** Antrenör/kulüp onaylı bağlama (alt yol). */
  confirmByCoach(tokenCode: string, coachId: string): { ok: boolean; error?: string } {
    const token = this.tokens.get(tokenCode);
    if (!token) return { ok: false, error: 'TOKEN_YOK' };
    if (token.status !== 'pending') return { ok: false, error: `TOKEN_${token.status.toUpperCase()}` };
    token.status = 'verified';
    return { ok: true };
  }

  /** Token'ı iptal eder. */
  revoke(tokenCode: string): boolean {
    const token = this.tokens.get(tokenCode);
    if (!token) return false;
    token.status = 'revoked';
    return true;
  }

  statusOf(tokenCode: string): VerificationStatus | null {
    return this.tokens.get(tokenCode)?.status ?? null;
  }
}

export function parentVerificationStatus(): string {
  return `Veli Bağlama: 6 haneli OTP • ${OTP_TTL_MINUTES}dk geçerli • antrenör/kimlik/telefon onayı • revoke`;
}
