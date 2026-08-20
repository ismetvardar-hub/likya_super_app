// ============================================================================
// 🗓️ KORT REZERVASYON, ÇAKIŞMA ÖNLEME & OTOMATİK ZAMANLAMA (Adım 87)
// • Kort/koç/kohort arası çakışan rezervasyonları tespit ve engelle
// • Tampon süre (10 dk kort değişimi), aydınlatma zamanlaması, tekrarlayan
//   akademi takım rezervasyonları. Deterministik; sıfır bağımlılık.
// ============================================================================

export interface Booking {
  id: string;
  courtId: string;
  startMin: number;   // mutlak dakika
  durationMin: number;
  coachId: string;
  cohortId?: string;
  bufferMin?: number; // varsayılan 10
}

export const DEFAULT_CHANGEOVER_BUFFER_MIN = 10;

/** İki rezervasyonun tampon dahil çakışıp çakışmadığını kontrol eder. */
export function bookingsOverlap(a: Booking, b: Booking, bufferMin = DEFAULT_CHANGEOVER_BUFFER_MIN): boolean {
  const aEnd = a.startMin + a.durationMin;
  const bEnd = b.startMin + b.durationMin;
  const aBuf = a.startMin - bufferMin;
  const bBuf = b.startMin - bufferMin;
  return a.startMin < bEnd && b.startMin < aEnd || aBuf < bEnd && bBuf < aEnd;
}

export type ConflictReason = 'court' | 'coach' | 'cohort';

export interface Conflict {
  bookingAId: string;
  bookingBId: string;
  reason: ConflictReason;
}

/** Tüm rezervasyon setindeki çakışmaları bulur (kort, koç, kohort). */
export function findConflicts(bookings: Booking[], bufferMin = DEFAULT_CHANGEOVER_BUFFER_MIN): Conflict[] {
  const conflicts: Conflict[] = [];
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const a = bookings[i];
      const b = bookings[j];
      if (a.courtId === b.courtId && bookingsOverlap(a, b, bufferMin)) {
        conflicts.push({ bookingAId: a.id, bookingBId: b.id, reason: 'court' });
      } else if (a.coachId === b.coachId && bookingsOverlap(a, b, bufferMin)) {
        conflicts.push({ bookingAId: a.id, bookingBId: b.id, reason: 'coach' });
      } else if (a.cohortId && a.cohortId === b.cohortId && bookingsOverlap(a, b, bufferMin)) {
        conflicts.push({ bookingAId: a.id, bookingBId: b.id, reason: 'cohort' });
      }
    }
  }
  return conflicts;
}

/** Kort belirtilen aralıkta müsait mi? (tampon dahil). */
export function isCourtAvailable(bookings: Booking[], courtId: string, startMin: number, durationMin: number, bufferMin = DEFAULT_CHANGEOVER_BUFFER_MIN): boolean {
  const candidate: Booking = { id: 'candidate', courtId, startMin, durationMin, coachId: '' };
  return !bookings.some((b) => b.courtId === courtId && bookingsOverlap(b, candidate, bufferMin));
}

export interface AddBookingResult {
  ok: boolean;
  booking?: Booking;
  conflicts: Conflict[];
}

/** Rezervasyon ekler; çakışma varsa reddeder. */
export function addBooking(bookings: Booking[], booking: Booking, bufferMin = DEFAULT_CHANGEOVER_BUFFER_MIN): AddBookingResult {
  const conflicts = findConflicts([...bookings, booking], bufferMin);
  if (conflicts.length > 0) return { ok: false, conflicts };
  return { ok: true, booking, conflicts: [] };
}

/** Kortta belirtilen süre için sonraki boş zaman dilimini bulur (fromMin'den itibaren). */
export function nextFreeSlot(bookings: Booking[], courtId: string, durationMin: number, fromMin: number, bufferMin = DEFAULT_CHANGEOVER_BUFFER_MIN): number {
  let t = fromMin;
  while (true) {
    if (isCourtAvailable(bookings, courtId, t, durationMin, bufferMin)) return t;
    t += 15;
  }
}

/** Tekrarlayan akademi takım rezervasyonu (her hafta aynı gün/saat). */
export function recurringBooking(idPrefix: string, courtId: string, weekdayStartMin: number, durationMin: number, weeks: number, coachId: string, cohortId: string, weekStart = 0): Booking[] {
  return Array.from({ length: weeks }, (_, w) => ({
    id: `${idPrefix}_w${w}`,
    courtId,
    startMin: weekStart + w * 7 * 24 * 60 + weekdayStartMin,
    durationMin,
    coachId,
    cohortId,
  }));
}

export function courtBookingStatus(): string {
  return 'Kort Rezervasyon: çakışma önleme (kort/koç/kohort) • 10dk tampon • tekrarlayan takım';
}
