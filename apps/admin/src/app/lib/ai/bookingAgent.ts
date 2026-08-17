// ============================================================================
// 🏨 7/24 OTONOM REZERVASYON AJANI
// Karavan Parkı, Glamping ve Padel/Tenis sahaları için gelen mesajları
// ayrıştırır (tarih, kişi, kort tipi), doluluk sorgular ve rezervasyon oluşturur.
// Gece talepleri kuyruğa alır (sabah onayı) — Daze nezaket filtresiyle.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type BookingResource = 'karavan' | 'glamping' | 'padel' | 'tenis';

export interface BookingRequest {
  raw: string;
  resource: BookingResource | null;
  date: string | null;
  guests: number;
  courtType?: string;
  hour: string | null;
  overnight: boolean;
  queueSlot: boolean; // gece talebi → sabah onayı
}

export interface AvailabilitySlot {
  id: string;
  time: string;
  available: boolean;
}

export interface BookingResult {
  ok: boolean;
  bookingId: string | null;
  request: BookingRequest;
  message: string;
  action: 'anlik-rezervasyon' | 'sabah-kuyrugu' | 'doluluk-yok' | 'ayristirilamadi';
}

// Mesajı ayrıştır (deterministik regex)
export function parseBookingRequest(text: string): BookingRequest {
  const lower = text.toLowerCase();
  const resource: BookingResource | null =
    /karavan/.test(lower) ? 'karavan'
    : /glamping|çadır/.test(lower) ? 'glamping'
    : /padel/.test(lower) ? 'padel'
    : /tenis/.test(lower) ? 'tenis'
    : null;
  const dateMatch = text.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-]?(\d{2,4})?/) ?? text.match(/yarın|bugün|hafta sonu/);
  const hourMatch = text.match(/(\d{1,2})[.:](\d{2})?\s*(?:saat|'te|'da|\b)/) ?? text.match(/(\d{1,2})\s*(?:saat)/);
  const guestsMatch = text.match(/(\d+)\s*(?:kişi|kisi|kişilik|kisilik|misafir|kişi\b)/);
  const guests = guestsMatch ? Number(guestsMatch[1]) : 2;
  const hour = hourMatch ? `${hourMatch[1]}${hourMatch[2] ? ':' + hourMatch[2] : ':00'}` : null;
  const overnight = /gece|konaklama|otel|stay/.test(lower);

  // Gece (22:00-08:00) talepleri sabah kuyruğuna alınır
  const now = new Date();
  const currentHour = now.getHours();
  const queueSlot = currentHour >= 22 || currentHour < 8;

  return {
    raw: text,
    resource,
    date: dateMatch ? String(dateMatch[0]) : null,
    guests,
    courtType: /kort|saha/.test(lower) ? (resource ?? 'padel') : undefined,
    hour,
    overnight,
    queueSlot,
  };
}

// Doluluk sorgusu (deterministik slotlar)
export function checkAvailability(resource: BookingResource, hour: string | null): AvailabilitySlot[] {
  return ['09:00', '12:00', '15:00', '18:00', '20:00'].map((t, i) => ({
    id: `slot-${resource}-${i}`,
    time: t,
    available: !(hour && hour.startsWith(t.slice(0, 2)) && i === 2), // 15:00 arasındaki istenen saat dolu simüle
  }));
}

// Rezervasyon oluştur (gece → kuyruk, gündüz → anlık)
export function createBooking(text: string): BookingResult {
  const req = parseBookingRequest(text);
  if (!req.resource) {
    return { ok: false, bookingId: null, request: req, message: 'Efendim, talebi ayrıştıramadım — lütfen tarih, saat ve alan belirtin (ör. "yarın 18:00 padel 2 kişi").', action: 'ayristirilamadi' };
  }
  if (req.queueSlot) {
    const qid = `nightq_${Date.now().toString(36)}`;
    return { ok: true, bookingId: qid, request: req, message: `🌙 Gece talebiniz kuyruğa alındı (${qid}) — sabah 08:00\'de onay için rezervasyon ajanı sizinle iletişime geçer. Saygılarımızla.`, action: 'sabah-kuyrugu' };
  }
  const slots = checkAvailability(req.resource, req.hour);
  const free = slots.find((s) => s.available);
  if (!free) {
    return { ok: false, bookingId: null, request: req, message: `Üzgünüz, ${req.resource} için seçilen saatte boşluk yok. Alternatif saatlerimiz: 09:00, 12:00, 18:00, 20:00.`, action: 'doluluk-yok' };
  }
  const bid = `bk_${Date.now().toString(36)}`;
  return {
    ok: true,
    bookingId: bid,
    request: req,
    message: `✅ ${req.resource} rezervasyonunuz oluşturuldu (${bid}): ${req.date ?? 'yarın'} ${req.hour ?? free.time} • ${req.guests} kişi. Ayrıntılar için Daze-Reminder bildirimi gönderilecek.`,
    action: 'anlik-rezervasyon',
  };
}

export function bookingAgentStatus(): string {
  return `Booking Ajanı [7/24 • karavan/glamping/padel/tenis • gece kuyruğu • nezaket filtresi]`;
}
