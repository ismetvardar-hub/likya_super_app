// ============================================================================
// 🚪 NFC / DİNAMİK QR OTOMATİK TURNİKE ERİŞİM MOTORU (Adım 137)
// Temassız kort giriş yetkilendirme doğrulayıcı: sporcu ve koçlar için
// zaman sınırlı (60sn dönen) kriptografik QR giriş token'ları ve NFC UID
// geçiş kartları üretir. Kapı kuralları: aktif rezervasyon + geçerli tıbbi
// feragat (Adım 90) + ödenmiş üyelik tier'ı (Adım 89). Tanımlayıcı gerekçelerle
// erişimi reddeder (EXPIRED_WAIVER / NO_ACTIVE_BOOKING / UNPAID_MEMBERSHIP).
// Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export type AccessDecision = 'GRANTED' | 'EXPIRED_WAIVER' | 'NO_ACTIVE_BOOKING' | 'UNPAID_MEMBERSHIP' | 'INVALID_TOKEN' | 'EXPIRED_TOKEN';

export type CredentialKind = 'QR' | 'NFC';

export interface AthleteAccessProfile {
  athleteId: string;
  waiverValid: boolean;        // Adım 90 tıbbi feragat doğrulaması
  activeBooking: boolean;
  membershipTierPaid: boolean; // Adım 89 üyelik tier ödemesi
  membershipTier?: string;
}

export interface EntryToken {
  token: string;
  athleteId: string;
  kind: CredentialKind;
  issuedAtMs: number;
  expiresAtMs: number;
  ttlMs: number;
}

export const QR_TOKEN_TTL_MS = 60_000; // 60sn dönüşümlü
export const NFC_PASS_TTL_MS = 24 * 60 * 60_000;

// ── FNV-1a 64-bit (deterministik kriptografik benzeri imza) ──────────────────
export function fnv1a64(input: string): string {
  let hi = 0xcbf29ce4;
  let lo = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    lo = (lo ^ input.charCodeAt(i)) >>> 0;
    const loMul = lo * 435;
    const newLo = loMul % 0x100000000;
    const carry = Math.floor(loMul / 0x100000000);
    hi = (hi * 435 + lo * 256 + carry) % 0x100000000;
    lo = newLo;
  }
  const hiHex = ('0000000' + hi.toString(16)).slice(-8);
  const loHex = ('0000000' + lo.toString(16)).slice(-8);
  return hiHex + loHex;
}

// ── Token üretimi (zaman kovası imzalı) ──────────────────────────────────────
export function generateQrToken(athleteId: string, secret: string, nowMs: number, ttlMs = QR_TOKEN_TTL_MS): EntryToken {
  const timeBucket = Math.floor(nowMs / ttlMs);
  const sig = fnv1a64(`${secret}:${athleteId}:${timeBucket}`);
  return {
    token: `QR.${athleteId}.${timeBucket}.${sig}`,
    athleteId,
    kind: 'QR',
    issuedAtMs: timeBucket * ttlMs,
    expiresAtMs: (timeBucket + 1) * ttlMs,
    ttlMs,
  };
}

export function generateNfcPass(uid: string, athleteId: string, secret: string, nowMs: number, ttlMs = NFC_PASS_TTL_MS): EntryToken {
  const timeBucket = Math.floor(nowMs / ttlMs);
  const sig = fnv1a64(`${secret}:nfc:${uid}:${timeBucket}`);
  return {
    token: `NFC.${uid}.${timeBucket}.${sig}`,
    athleteId,
    kind: 'NFC',
    issuedAtMs: timeBucket * ttlMs,
    expiresAtMs: (timeBucket + 1) * ttlMs,
    ttlMs,
  };
}

// ── Token doğrulama (TTL + imza) ─────────────────────────────────────────────
export interface TokenVerification {
  valid: boolean;
  reason?: string;
}

export function verifyToken(token: string, secret: string, nowMs: number): TokenVerification {
  const parts = token.split('.');
  if (parts.length !== 4) return { valid: false, reason: 'INVALID_TOKEN' };
  const kind = parts[0] === 'NFC' ? 'NFC' : parts[0] === 'QR' ? 'QR' : null;
  if (!kind) return { valid: false, reason: 'INVALID_TOKEN' };
  const ttlMs = kind === 'NFC' ? NFC_PASS_TTL_MS : QR_TOKEN_TTL_MS;
  const timeBucket = Number(parts[2]);
  if (!Number.isInteger(timeBucket)) return { valid: false, reason: 'INVALID_TOKEN' };
  const currentBucket = Math.floor(nowMs / ttlMs);
  if (timeBucket !== currentBucket) return { valid: false, reason: 'EXPIRED_TOKEN' };
  const expectedSig = kind === 'NFC' ? fnv1a64(`${secret}:nfc:${parts[1]}:${timeBucket}`) : fnv1a64(`${secret}:${parts[1]}:${timeBucket}`);
  return expectedSig === parts[3] ? { valid: true } : { valid: false, reason: 'INVALID_TOKEN' };
}

// ── Kapı yetkilendirme: token + feragat + rezervasyon + üyelik ───────────────
export interface AccessEvaluation {
  decision: AccessDecision;
  reason: string;
}

export function evaluateAccess(profile: AthleteAccessProfile, token: string, secret: string, nowMs: number): AccessEvaluation {
  const verification = verifyToken(token, secret, nowMs);
  if (!verification.valid) return { decision: verification.reason === 'EXPIRED_TOKEN' ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN', reason: `Token ${verification.reason}: giriş reddedildi` };
  if (!profile.waiverValid) return { decision: 'EXPIRED_WAIVER', reason: `Tıbbi feragat geçersiz (Adım 90) — ${profile.athleteId} için giriş reddedildi` };
  if (!profile.activeBooking) return { decision: 'NO_ACTIVE_BOOKING', reason: `Aktif kort rezervasyonu yok — ${profile.athleteId} için giriş reddedildi` };
  if (!profile.membershipTierPaid) return { decision: 'UNPAID_MEMBERSHIP', reason: `Üyelik ödemesi alınmadı (Adım 89) — ${profile.athleteId} için giriş reddedildi` };
  return { decision: 'GRANTED', reason: `${profile.athleteId} girişe yetkili — ${profile.membershipTier ?? 'üyelik'} tier + rezervasyon + feragat geçerli` };
}

// ── Turnike erişim koordinatörü (token üretimi + doğrulama) ──────────────────
export class TurnstileAccessEngine {
  private readonly secret: string;

  constructor(secret = 'likya-turnstile-secret') {
    this.secret = secret;
  }

  issueQr(profile: AthleteAccessProfile, nowMs: number): EntryToken {
    return generateQrToken(profile.athleteId, this.secret, nowMs);
  }

  issueNfc(uid: string, profile: AthleteAccessProfile, nowMs: number): EntryToken {
    return generateNfcPass(uid, profile.athleteId, this.secret, nowMs);
  }

  authorize(profile: AthleteAccessProfile, credential: { token?: string; uid?: string }, nowMs: number): AccessEvaluation {
    if (credential.uid) {
      const nfc = generateNfcPass(credential.uid, profile.athleteId, this.secret, nowMs);
      return evaluateAccess(profile, nfc.token, this.secret, nowMs);
    }
    if (!credential.token) return { decision: 'INVALID_TOKEN', reason: 'Kimlik bilgisi yok' };
    return evaluateAccess(profile, credential.token, this.secret, nowMs);
  }
}

export function turnstileAccessStatus(): string {
  return `Turnike: QR ${QR_TOKEN_TTL_MS / 1000}sn dönüşümlü + NFC 24sa • feragat/rezervasyon/üyelik kapı kuralları`;
}

