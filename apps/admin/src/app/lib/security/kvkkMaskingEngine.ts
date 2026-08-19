// ============================================================================
// 🔒 AŞAMA 3 — KVKK UYUM & HASSAS VERİ MASKELEME MOTORU
// Telefon, T.C./Pasaport, e-posta ve kart numaralarını veritabanına
// yazmadan önce maskeleme/şifreleme ara katmanı. Deterministik; Plan Z.
// Geri dönüşümlü şifreleme: basit XOR+iv (demo) — üretimde KMS önerilir.
// ============================================================================

export type SensitiveField = 'phone' | 'tc_kimlik' | 'passport' | 'email' | 'card_no' | 'iban';

// ── MASKELEME (geri dönüşsüz görüntüleme) ────────────────────────────────────
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? `${digits.slice(0, 4)}****${digits.slice(-2)}` : '****';
}

export function maskTcKimlik(tc: string): string {
  const d = tc.replace(/\D/g, '');
  return d.length === 11 ? `${d.slice(0, 3)}********` : '********';
}

export function maskPassport(p: string): string {
  return p.length >= 4 ? `${p.slice(0, 2)}**${p.slice(-2)}` : '**';
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskCard(cardNo: string): string {
  const d = cardNo.replace(/\D/g, '');
  return d.length >= 16 ? `**** **** **** ${d.slice(-4)}` : '****';
}

export function maskIban(iban: string): string {
  const clean = iban.replace(/\s/g, '');
  return clean.length >= 12 ? `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}` : '****';
}

export function maskField(field: SensitiveField, value: string): string {
  switch (field) {
    case 'phone': return maskPhone(value);
    case 'tc_kimlik': return maskTcKimlik(value);
    case 'passport': return maskPassport(value);
    case 'email': return maskEmail(value);
    case 'card_no': return maskCard(value);
    case 'iban': return maskIban(value);
  }
}

// ── ŞİFRELEME (geri dönüşümlü — veritabanına yazım öncesi) ──────────────────
export function encryptSensitive(value: string, secret: string): string {
  if (!secret) return `enc:${Buffer.from(value, 'utf-8').toString('base64')}`;
  const iv = Math.floor(Math.random() * 1e6);
  const key = secret.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const xored = value.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((key + i * 31) % 256))).join('');
  return `v1:${iv}:${Buffer.from(xored, 'utf-8').toString('base64')}`;
}

export function decryptSensitive(payload: string, secret: string): string {
  try {
    if (payload.startsWith('enc:')) return Buffer.from(payload.slice(4), 'base64').toString('utf-8');
    if (!payload.startsWith('v1:')) return payload;
    const [, , b64] = payload.split(':');
    const key = secret.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const xored = Buffer.from(b64, 'base64').toString('utf-8');
    return xored.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ((key + i * 31) % 256))).join('');
  } catch { return payload; }
}

/** Veri nesnesini KVKK kuralına göre işle: müşteri alanlarını maskele/şifrele. */
export function kvkkSanitizeRecord<T extends Record<string, unknown>>(record: T, secret: string, encrypt = true): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };
  const sensitiveKeys: Partial<Record<string, SensitiveField>> = {
    phone: 'phone', mobile: 'phone', tc_kimlik: 'tc_kimlik', tcNo: 'tc_kimlik', identityNo: 'tc_kimlik',
    passport: 'passport', email: 'email', card_no: 'card_no', cardNumber: 'card_no', iban: 'iban',
  };
  for (const [key, field] of Object.entries(sensitiveKeys)) {
    if (typeof out[key] === 'string' && (out[key] as string).length > 0) {
      out[key] = encrypt ? encryptSensitive(out[key] as string, secret) : maskField(field, out[key] as string);
    }
  }
  return out;
}

export function kvkkMaskingEngineStatus(): string {
  return 'KVKK Motoru [telefon/TC/pasaport/e-posta/kart/IBAN maskeleme + geri dönüşümlü şifreleme]';
}
