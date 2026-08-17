// ============================================================================
// 👥 LİKYA OPEN-CRM ADAPTÖRÜ — Twenty CRM veri modeline uyumlu
// Müşteri/üye profilleri, rezervasyon geçmişi, harcama alışkanlıkları ve
// sponsor temas noktaları. Deterministik stub: env anahtarı yoksa simülasyon.
// Plan Z güvenli — asla çökme. Kırılmasız.
// ============================================================================

export type CrmMemberStatus = 'aktif' | 'dondurulmus' | 'misafir' | 'vip';

export interface CrmMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: CrmMemberStatus;
  membershipType: 'aylik' | 'sezonluk' | 'yillik';
  joinDate: string;
  totalSpent: number;
  reservations: number;
  lastVisit: string;
  segment: string;      // 'sporcu' | 'misafir' | 'is-ortagi' | 'sponsor'
  tags: string[];
  sponsorContact?: boolean;
}

export interface ReservationRecord {
  id: string;
  memberId: string;
  resource: string;     // 'padel-kort-1' | 'glamping' | 'daze-chef' | ...
  date: string;
  amount: number;
  status: 'tamam' | 'iptal' | 'beklemede';
}

// Deterministik örnek üye veritabanı (Twenty uyumlu şema)
export const SAMPLE_MEMBERS: CrmMember[] = [
  { id: 'm-1', fullName: 'Aylin Kaya', email: 'aylin@example.com', phone: '+905001112233', status: 'vip', membershipType: 'yillik', joinDate: '2025-06-01', totalSpent: 28500, reservations: 24, lastVisit: '2026-08-15', segment: 'sporcu', tags: ['padel', 'vip', 'bireysel'] },
  { id: 'm-2', fullName: 'Mehmet Demir', email: 'mehmet@example.com', phone: '+905004445566', status: 'aktif', membershipType: 'sezonluk', joinDate: '2026-02-10', totalSpent: 9200, reservations: 9, lastVisit: '2026-08-12', segment: 'misafir', tags: ['glamping', 'aile'] },
  { id: 'm-3', fullName: 'Zeynep Arslan', email: 'zeynep@example.com', phone: '+905007778899', status: 'aktif', membershipType: 'aylik', joinDate: '2026-07-20', totalSpent: 3400, reservations: 4, lastVisit: '2026-08-14', segment: 'sporcu', tags: ['tenis', 'bireysel'] },
  { id: 'm-4', fullName: 'Can Yılmaz (Spor Toto)', email: 'can@sponsor.com', phone: '+905001234567', status: 'vip', membershipType: 'yillik', joinDate: '2025-11-05', totalSpent: 64000, reservations: 12, lastVisit: '2026-08-10', segment: 'sponsor', tags: ['sponsor', 'vip'], sponsorContact: true },
];

export const SAMPLE_RESERVATIONS: ReservationRecord[] = [
  { id: 'r-1', memberId: 'm-1', resource: 'padel-kort-1', date: '2026-08-16 18:00', amount: 120, status: 'beklemede' },
  { id: 'r-2', memberId: 'm-2', resource: 'glamping-3', date: '2026-08-17 14:00', amount: 450, status: 'tamam' },
  { id: 'r-3', memberId: 'm-1', resource: 'daze-chef', date: '2026-08-15 20:30', amount: 340, status: 'tamam' },
];

// Üyeyi bul + harcama/segment analizi (deterministik)
export function getMemberProfile(memberId: string): { member: CrmMember | null; reservations: ReservationRecord[]; lifetimeValue: number; tier: string } {
  const member = SAMPLE_MEMBERS.find((m) => m.id === memberId) ?? null;
  const reservations = SAMPLE_RESERVATIONS.filter((r) => r.memberId === memberId);
  const lifetimeValue = member?.totalSpent ?? 0;
  const tier = lifetimeValue >= 50000 ? 'VIP' : lifetimeValue >= 10000 ? 'GOLD' : lifetimeValue >= 3000 ? 'SILVER' : 'BRONZE';
  return { member, reservations, lifetimeValue, tier };
}

// Sponsor temas noktası kaydı
export function logSponsorTouchpoint(memberId: string, channel: 'whatsapp' | 'email' | 'toplanti', note: string): { ok: boolean; message: string } {
  const member = SAMPLE_MEMBERS.find((m) => m.id === memberId);
  if (!member) return { ok: false, message: 'Üye bulunamadı' };
  return {
    ok: true,
    message: `🤝 ${member.fullName} — ${channel} teması kaydedildi: ${note}${member.sponsorContact ? ' (sponsor temas noktası)' : ''}`,
  };
}

export function twentyCrmStatus(): string {
  return `Likya Open-CRM [Twenty modeli • ${SAMPLE_MEMBERS.length} üye • rezervasyon+harcama+sponsor temas]`;
}
