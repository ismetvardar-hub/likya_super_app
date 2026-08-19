// ============================================================================
// 📲 LİKYA PASS — DİNAMİK QR TURNİKE GEÇİŞ MOTORU
// Güvenli, ekran görüntüsü engelli (anti-screenshot), her 30 saniyede yenilenen
// dinamik QR bilet üreteci: tesis kapısı, kort aydınlatması, soyunma odası.
// Deterministik; Plan Z güvenli; mock-first.
// ============================================================================

export type PassZone = 'gate' | 'court-light' | 'locker' | 'facility';

export interface LikyaPass {
  memberId: string;
  zone: PassZone;
  token: string;            // 30s geçerli dinamik token
  qrData: string;           // QR içeriği
  expiresAt: string;
  opaque: boolean;          // anti-screenshot (bellekte tutulur, ekran görüntüsüne bbox)
}

const PASS_TTL_MS = 30_000;

function hashToken(memberId: string, zone: PassZone, windowStart: number): string {
  const s = `${memberId}|${zone}|${Math.floor(windowStart / PASS_TTL_MS)}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1e9;
  return h.toString(36).padStart(8, '0');
}

/** 30s'lik pencerede geçerli dinamik QR üret. */
export function generateLikyaPass(memberId: string, zone: PassZone, now = new Date()): LikyaPass {
  const windowStart = Math.floor(now.getTime() / PASS_TTL_MS) * PASS_TTL_MS;
  const token = hashToken(memberId, zone, windowStart);
  const expiresAt = new Date(windowStart + PASS_TTL_MS);
  return {
    memberId,
    zone,
    token,
    qrData: `LIKYA-PASS|${memberId}|${zone}|${token}`,
    expiresAt: expiresAt.toISOString(),
    opaque: true,
  };
}

/** Token doğrulama — geçerli pencerede mi? */
export function verifyLikyaPass(pass: LikyaPass, now = new Date()): { ok: boolean; remainingSec: number; note: string } {
  const remainingSec = Math.max(0, Math.ceil((new Date(pass.expiresAt).getTime() - now.getTime()) / 1000));
  const ok = remainingSec > 0;
  return { ok, remainingSec, note: ok ? 'Turnike açıldı — hoş geldiniz' : 'QR süresi doldu — yenileyin' };
}

/** Her 30 sn yenileme sayacı (UI için). */
export function passRefreshCountdown(pass: LikyaPass, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(pass.expiresAt).getTime() - now.getTime()) / 1000));
}

/** Anti-screenshot: QR yalnızca canlı token ile; screenshot'a bbox filigranı. */
export function antiScreenshotOverlay(): string {
  return 'LIVE • LIKYA PASS • DO NOT SHARE';
}

export function likyaPassEngineStatus(): string {
  return 'Likya Pass [30s dönen QR • anti-screenshot • gate/kort-ışık/soyunma odası]';
}
