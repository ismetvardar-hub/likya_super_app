// ============================================================================
// 🎓 PİLOT EKİP & VELİ HIZLI KAYIT MOTORU (Adım 104)
// İlk pilot akademi için tek tık kurulum: 1 baş koç + 1 pilot takım
// ("U14 Elit Gelişim") + 4 genç sporcu profili (örnek temel biyometri) +
// otomatik üretilen 4 veli davet linki ve 6 haneli doğrulama OTP'leri.
// Saf/deterministik — RNG enjekte edilebilir (testlerde sabit sonuç).
// ============================================================================

export type Rng = () => number;
export const defaultRng: Rng = () => Math.random();

export const PILOT_SQUAD_NAME = 'U14 Elit Gelişim';
export const PILOT_SQUAD_CATEGORY = 'U14';
export const PILOT_SQUAD_CAPACITY = 8;
export const PILOT_ATHLETE_COUNT = 4;
export const PILOT_SQUAD_ID = 'sq_u14_elit';
export const PARENT_INVITE_TTL_HOURS = 48;
export const OTP_LENGTH = 6;
export const PARENT_VERIFY_BASE_URL = 'https://app.likya.com/parent/verify';

export interface PilotCoach {
  coachId: string;
  fullName: string;
  role: 'head_coach';
  phone: string;
  certification: string;
}

export interface PilotAthleteBaseline {
  heightCm: number;
  weightKg: number;
  restingHR: number;
  sprint20mSec: number;
  standingReachCm: number;
  acwrLast7d: number;
  playerProfile: string;
}

export interface PilotAthleteProfile {
  athleteId: string;
  firstName: string;
  age: number;
  handedness: 'R' | 'L';
  baseline: PilotAthleteBaseline;
}

export interface PilotSquadBatch {
  squad: {
    squadId: string;
    name: string;
    category: string;
    capacity: number;
    coachId: string;
  };
  coach: PilotCoach;
  athletes: PilotAthleteProfile[];
  createdAt: string;
}

export interface ParentInvite {
  inviteId: string;
  athleteId: string;
  athleteName: string;
  inviteLink: string;
  otp: string;
  expiresAt: string;
  status: 'pending' | 'used';
}

// ── 6 haneli OTP üretici (enjekte edilebilir RNG) ─────────────────────────────
export function createOtp(rng: Rng = defaultRng): string {
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += String(Math.floor(Math.abs(rng()) * 10) % 10);
  }
  return code;
}

// ── Pilot takım şablonu (1 koç + 4 genç sporcu + temel biyometri) ─────────────
export function generatePilotSquad(rng: Rng = defaultRng, now = new Date()): PilotSquadBatch {
  void rng; // takım kimlikleri deterministiktir; RNG ileride dinamik tabanlık için ayrılır
  const coach: PilotCoach = {
    coachId: 'co_pilot_head',
    fullName: 'Mert Kaya',
    role: 'head_coach',
    phone: '+90 532 000 1011',
    certification: 'ITF Level 2',
  };
  const athletes: PilotAthleteProfile[] = [
    { athleteId: 'at_u14_01', firstName: 'Deniz', age: 13, handedness: 'R', baseline: { heightCm: 162, weightKg: 48, restingHR: 62, sprint20mSec: 3.42, standingReachCm: 205, acwrLast7d: 0.86, playerProfile: 'temel forehand + tek el backhand' } },
    { athleteId: 'at_u14_02', firstName: 'Zeynep', age: 12, handedness: 'L', baseline: { heightCm: 158, weightKg: 45, restingHR: 65, sprint20mSec: 3.55, standingReachCm: 200, acwrLast7d: 0.78, playerProfile: 'hızlı ayak + kesme vuruşları' } },
    { athleteId: 'at_u14_03', firstName: 'Efe', age: 13, handedness: 'R', baseline: { heightCm: 165, weightKg: 52, restingHR: 58, sprint20mSec: 3.30, standingReachCm: 210, acwrLast7d: 0.92, playerProfile: 'sert servis + ağ oyunu' } },
    { athleteId: 'at_u14_04', firstName: 'Elif', age: 12, handedness: 'R', baseline: { heightCm: 156, weightKg: 44, restingHR: 66, sprint20mSec: 3.60, standingReachCm: 198, acwrLast7d: 0.70, playerProfile: 'toplama direnci + taktik zekâ' } },
  ];
  return {
    squad: { squadId: PILOT_SQUAD_ID, name: PILOT_SQUAD_NAME, category: PILOT_SQUAD_CATEGORY, capacity: PILOT_SQUAD_CAPACITY, coachId: coach.coachId },
    coach,
    athletes,
    createdAt: now.toISOString(),
  };
}

// ── Veli davet linki (athleteId + inviteId parametreli) ───────────────────────
export function buildParentInviteLink(inviteId: string, athleteId: string): string {
  return `${PARENT_VERIFY_BASE_URL}?athlete=${athleteId}&invite=${inviteId}`;
}

export function generateParentInvites(
  athletes: PilotAthleteProfile[],
  opts: { rng?: Rng; ttlHours?: number; now?: Date } = {},
): ParentInvite[] {
  const rng = opts.rng ?? defaultRng;
  const ttlHours = opts.ttlHours ?? PARENT_INVITE_TTL_HOURS;
  const now = opts.now ?? new Date();
  return athletes.map((a) => {
    const inviteId = `inv_${a.athleteId}`;
    const otp = createOtp(rng);
    const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString();
    return {
      inviteId,
      athleteId: a.athleteId,
      athleteName: a.firstName,
      inviteLink: buildParentInviteLink(inviteId, a.athleteId),
      otp,
      expiresAt,
      status: 'pending',
    };
  });
}

// ── Davet ↔ OTP doğrulama (veli linkten girer, OTP girer → bağlanır) ──────────
export function verifyParentInvite(
  invites: ParentInvite[],
  inviteId: string,
  otp: string,
  now = new Date(),
): { ok: boolean; message: string; invite?: ParentInvite } {
  const invite = invites.find((i) => i.inviteId === inviteId);
  if (!invite) return { ok: false, message: 'Davet bulunamadı — link geçersiz' };
  if (invite.status === 'used') return { ok: false, message: 'Davet zaten kullanıldı' };
  if (invite.otp !== otp) return { ok: false, message: 'OTP hatalı — 6 haneli kodu kontrol edin' };
  if (new Date(invite.expiresAt).getTime() < now.getTime()) return { ok: false, message: 'Davet süresi doldu — yeniden oluşturun' };
  invite.status = 'used';
  return { ok: true, message: 'Veli kimlik doğrulandı — sporcu profiline bağlandı', invite };
}

export function pilotOnboardingStatus(): string {
  return `Pilot Kayıt: ${PILOT_SQUAD_NAME} • 1 koç + ${PILOT_ATHLETE_COUNT} sporcu • 6 haneli veli OTP davetleri (48sa)`;
}
