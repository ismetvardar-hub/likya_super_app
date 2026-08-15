// ============================================================================
// 👥 LİKYA OTONOM İŞE DAVET & DİNAMİK VARDİYA MOTORU (hr/shiftDispatchEngine.ts)
// Yoğunluk analizi ➔ Personel skorlama ➔ İki taraflı otonom davet (EVET/HAYIR)
// ➔ Availability Pool hafızası. 100% deterministik — LLM YOK.
// ERP (erpEngine) bordro şemasıyla uyumlu; notifications/WhatsApp şablonları.
// ============================================================================

export type DepartmentId =
  | 'PADEL' | 'FNB' | 'ETKINLIK' | 'GUVENLIK' | 'MUTFUK' | 'RESEPSIYON' | 'HAVUZ' | 'BAKIM';

export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  PADEL: '🎾 Padel Sahaları',
  FNB: '🍽️ Yiyecek & İçecek',
  ETKINLIK: '🎪 Etkinlik & Organizasyon',
  GUVENLIK: '🛡️ Güvenlik',
  MUTFUK: '👨‍🍳 Mutfak',
  RESEPSIYON: '🏨 Resepsiyon',
  HAVUZ: '🏊 Havuz & Aquapark',
  BAKIM: '🔧 Tesis Bakım',
};

// ----------------------------------------------------------------------------
// 1️⃣ YOĞUNLUK & DEPARTMAN İHTİYAÇ ANALİZİ
// ----------------------------------------------------------------------------
export interface DensityInput {
  dept: DepartmentId;
  intensityScore: number;     // 0-100 mevcut/öngörülen yoğunluk
  eventFlag?: boolean;        // özel etkinlik var mı
  bookedPct?: number;         // rezervasyon doluluk % (0-100)
  date?: string;              // 'YYYY-MM-DD' (ileri tarih öngörüsü)
  startHour: number;          // ihtiyaç başlangıç saati
  endHour: number;            // ihtiyaç bitiş saati
}

export interface StaffNeed {
  dept: DepartmentId;
  date: string;
  startHour: number;
  endHour: number;
  requiredStaff: number;
  reason: string;
  urgency: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
}

// Yoğunluk skorundan deterministik personel ihtiyacı
export function analyzeStaffNeed(input: DensityInput): StaffNeed {
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const intensity = input.intensityScore;
  const booked = input.bookedPct ?? 0;

  let requiredStaff = 1;
  if (intensity > 75 || booked > 80) requiredStaff += 2;
  else if (intensity > 50 || booked > 55) requiredStaff += 1;
  if (input.eventFlag) requiredStaff += 1;

  const urgency: StaffNeed['urgency'] =
    requiredStaff >= 4 ? 'KRİTİK' : requiredStaff === 3 ? 'YÜKSEK' : requiredStaff === 2 ? 'ORTA' : 'DÜŞÜK';

  const reasonParts: string[] = [];
  if (intensity > 75) reasonParts.push('yoğunluk %' + intensity);
  if (booked > 80) reasonParts.push('rezervasyon %' + booked);
  if (input.eventFlag) reasonParts.push('özel etkinlik');

  return {
    dept: input.dept,
    date,
    startHour: input.startHour,
    endHour: input.endHour,
    requiredStaff,
    reason: reasonParts.length > 0 ? reasonParts.join(' + ') : 'normal akış',
    urgency,
  };
}

// Birden çok departman için toplu ihtiyaç analizi
export function analyzeAllNeeds(inputs: DensityInput[]): StaffNeed[] {
  return inputs.map(analyzeStaffNeed).sort((a, b) => b.requiredStaff - a.requiredStaff);
}

// ----------------------------------------------------------------------------
// 2️⃣ PERSONEL HAVUZU & PERFORMANS/UYGUNLUK SKORLAMA (Candidate Ranking)
// ----------------------------------------------------------------------------
export interface AvailabilitySlot {
  date: string;       // 'YYYY-MM-DD' veya 'hafta-ici'/'hafta-sonu'
  startHour: number;
  endHour: number;
}

export interface StaffProfile {
  id: string;
  name: string;
  departments: DepartmentId[];
  hourlyRateTL: number;
  performanceScore: number;   // 0-100 hız, başarı, misafir memnuniyeti
  reliabilityScore: number;   // 0-100 dakiklik, devamsızlık
  availability: AvailabilitySlot[];
  rating: number;             // ⭐ 0-5
}

export interface RankingOptions {
  budgetHourlyTL: number;     // saatlik bütçe tavanı
  requiredDept: DepartmentId;
  date: string;
  startHour: number;
  endHour: number;
}

export interface RankedCandidate {
  staff: StaffProfile;
  compositeScore: number;     // 0-100
  performanceScore: number;
  reliabilityScore: number;
  budgetFitScore: number;
  availabilityBonus: number;
  reasons: string[];
}

// Birleşik skor: Performans %50 + Güvenilirlik %30 + Bütçe Uyumu %20 + müsaitlik bonusu
export function rankCandidates(pool: StaffProfile[], opts: RankingOptions): RankedCandidate[] {
  return pool
    .filter((s) => s.departments.includes(opts.requiredDept))
    .map((staff) => {
      const reasons: string[] = [];
      const performanceScore = Math.max(0, Math.min(100, staff.performanceScore));
      const reliabilityScore = Math.max(0, Math.min(100, staff.reliabilityScore));

      // Bütçe uyumu: saatlik ücret tavanın %80'ini geçerse puan düşer
      const budgetFitScore = Math.max(0, Math.min(100, 100 * (1 - Math.max(0, staff.hourlyRateTL - opts.budgetHourlyTL * 0.8) / opts.budgetHourlyTL)));
      if (staff.hourlyRateTL <= opts.budgetHourlyTL) reasons.push('bütçe uyumlu');
      else reasons.push(`saatlik ${staff.hourlyRateTL}₺ > tavan ${opts.budgetHourlyTL}₺`);

      // Müsaitlik bonusu: vardiya penceresinde müsaitse +15
      let availabilityBonus = 0;
      const isAvailable = staff.availability.some(
        (slot) =>
          slot.date === opts.date &&
          slot.startHour <= opts.startHour &&
          slot.endHour >= opts.endHour
      );
      if (isAvailable) { availabilityBonus = 15; reasons.push('müsait'); }
      else reasons.push('müsaitlik pencerede değil');

      const compositeScore = Math.round(performanceScore * 0.5 + reliabilityScore * 0.3 + budgetFitScore * 0.2 + availabilityBonus);
      return { staff, compositeScore, performanceScore, reliabilityScore, budgetFitScore, availabilityBonus, reasons };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);
}


// ----------------------------------------------------------------------------
// 3️⃣ İKİ TARAFLI OTONOM DAVET DİYALOĞU (WhatsApp / SMS)
// ----------------------------------------------------------------------------
export type InviteStatus = 'BEKLİYOR' | 'GÖNDERİLDİ' | 'KABUL' | 'RET' | 'MÜSAİTLİK_BİLDİRDİ';

export interface Invite {
  id: string;
  staffId: string;
  name: string;
  dept: DepartmentId;
  date: string;
  startHour: number;
  endHour: number;
  hourlyRateTL: number;
  bonusTL: number;
  status: InviteStatus;
  sentAt: string;
  message: string;
  responseAt?: string;
}

export interface InviteOptions {
  hourlyRateTL: number;
  bonusTL?: number;
}

// WhatsApp davet şablonu
export function buildInviteMessage(staff: StaffProfile, need: StaffNeed, opts: InviteOptions): string {
  const hours = need.endHour - need.startHour;
  const total = opts.hourlyRateTL * hours + (opts.bonusTL ?? 0);
  return `Merhaba ${staff.name} 👋,\nyarın (${need.date}) ${String(need.startHour).padStart(2, '0')}:00-${String(need.endHour).padStart(2, '0')}:00 arasında ${DEPARTMENT_LABELS[need.dept]} alanında yoğunluk öngörülüyor. Göreve gelebilir misin?\n(Saatlik: ${opts.hourlyRateTL}₺ + ${opts.bonusTL ?? 0}₺ prim → toplam ~${total}₺)\n\n📲 EVET yaz → vardiyan takvime işlensin, QR kartın üretilsin.\n📅 HAYIR → müsait olduğun alternatif gün/saati yaz.`;
}

// Davet oluştur (durum: GÖNDERİLDİ)
export function createInvite(
  staff: StaffProfile,
  need: StaffNeed,
  opts: InviteOptions,
  now = new Date().toISOString()
): Invite {
  return {
    id: `INV-${need.date}-${need.dept}-${staff.id}`,
    staffId: staff.id,
    name: staff.name,
    dept: need.dept,
    date: need.date,
    startHour: need.startHour,
    endHour: need.endHour,
    hourlyRateTL: opts.hourlyRateTL,
    bonusTL: opts.bonusTL ?? 0,
    status: 'GÖNDERİLDİ',
    sentAt: now,
    message: buildInviteMessage(staff, need, opts),
  };
}

// İki taraflı yanıt işleme
export interface AvailabilityReport { staffId: string; date: string; startHour: number; endHour: number; }

export interface InviteResponse {
  invite: Invite;
  accepted?: boolean;
  availabilityAdded?: AvailabilityReport;
}

export function respondInvite(
  invite: Invite,
  answer: 'KABUL' | 'RET',
  alternative?: AvailabilitySlot,
  now = new Date().toISOString()
): InviteResponse {
  const updated: Invite = { ...invite, status: answer === 'KABUL' ? 'KABUL' : 'RET', responseAt: now };
  let availabilityAdded: AvailabilityReport | undefined;
  if (answer === 'RET' && alternative) {
    updated.status = 'MÜSAİTLİK_BİLDİRDİ';
    availabilityAdded = {
      staffId: invite.staffId,
      date: alternative.date,
      startHour: alternative.startHour,
      endHour: alternative.endHour,
    };
  }
  return { invite: updated, accepted: answer === 'KABUL', availabilityAdded };
}

// ----------------------------------------------------------------------------
// 4️⃣ AVAILABILITY POOL HAFIZASI & QR
// ----------------------------------------------------------------------------
export interface AvailabilityPoolEntry {
  staffId: string;
  date: string;
  startHour: number;
  endHour: number;
  notedAt: string;
}

export type AvailabilityPool = AvailabilityPoolEntry[];

export function addAvailability(
  pool: AvailabilityPool,
  staffId: string,
  slot: AvailabilitySlot,
  now = new Date().toISOString()
): AvailabilityPool {
  return [...pool, { staffId, date: slot.date, startHour: slot.startHour, endHour: slot.endHour, notedAt: now }];
}

// Personelin yeni davetlere müsait olduğu pencereleri bul
export function findMatchingAvailability(pool: AvailabilityPool, staffId: string, need: StaffNeed): AvailabilitySlot[] {
  return pool
    .filter((e) => e.staffId === staffId && e.date === need.date)
    .filter((e) => e.startHour <= need.startHour && e.endHour >= need.endHour)
    .map((e) => ({ date: e.date, startHour: e.startHour, endHour: e.endHour }));
}

// Vardiya QR kartı verisi (turnike/saat girişi için)
export function buildShiftQrPayload(invite: Invite): string {
  return `LKY|${invite.id}|${invite.staffId}|${invite.date}|${invite.startHour}-${invite.endHour}|${invite.dept}|ONAYLI`;
}

