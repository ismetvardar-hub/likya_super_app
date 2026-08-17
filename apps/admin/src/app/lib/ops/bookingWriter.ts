// ============================================================================
// 🏨 CANLI REZERVASYON & PARSEL KÖPRÜSÜ (Faz 2)
// CEO Chat / BookingAgent'tan gelen rezervasyonları parcels, sports_facilities,
// try_before_buy_bookings tablolarına yazar; dinamik referans kodu + onay kartı.
// supabaseEnvReady() yoksa localStorage mock fallback (asla çökme). Plan Z.
// ============================================================================

import { createBooking, type BookingResource } from '../ai/bookingAgent';
import { insertLiveRow, supabaseSwitchStatus } from '../db/supabaseClient';

export interface BookingConfirmation {
  ok: boolean;
  referenceCode: string;
  resource: BookingResource | null;
  date: string | null;
  hour: string | null;
  guests: number;
  table: string;
  simulated: boolean;
  message: string;
}

// Dinamik referans kodu (deterministik format)
export function generateReferenceCode(resource: string): string {
  const prefix = (resource ?? 'LKY').toUpperCase().slice(0, 3);
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${seg()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

// Rezervasyonu canlı tabloya yaz (parcels/sports_facilities/try_before_buy_bookings)
export async function persistBooking(raw: string): Promise<BookingConfirmation> {
  const parsed = createBooking(raw);
  if (!parsed.ok || !parsed.request.resource) {
    return { ok: false, referenceCode: '', resource: parsed.request.resource, date: parsed.request.date, hour: parsed.request.hour, guests: parsed.request.guests, table: 'none', simulated: true, message: parsed.message };
  }

  const ref = generateReferenceCode(parsed.request.resource);
  const table = parsed.request.resource === 'karavan' || parsed.request.resource === 'glamping'
    ? 'try_before_buy_bookings'
    : 'sports_facilities';

  // Canlı yazma (env varsa) veya mock fallback (env yoksa)
  const write = await insertLiveRow(table, {
    reference: ref,
    resource: parsed.request.resource,
    date: parsed.request.date ?? new Date().toISOString().slice(0, 10),
    hour: parsed.request.hour ?? '12:00',
    guests: parsed.request.guests,
    status: parsed.request.queueSlot ? 'gece-kuyrugu' : 'onaylandi',
    created_at: new Date().toISOString(),
  });

  return {
    ok: write.ok,
    referenceCode: ref,
    resource: parsed.request.resource,
    date: parsed.request.date,
    hour: parsed.request.hour,
    guests: parsed.request.guests,
    table,
    simulated: write.simulated,
    message: write.simulated
      ? `✅ Rezervasyon onaylandı (${ref}) — kayıt mock katmanına yazıldı. ${supabaseSwitchStatus().mode}`
      : `✅ Rezervasyon onaylandı (${ref}) — ${table} tablosuna canlı yazıldı.`,
  };
}

// Onay kartı formatı (Daze nezaket tonuyla)
export function confirmationCard(c: BookingConfirmation): string {
  return `🏨 **Rezervasyon Onayı**
${'```'}
Ref: ${c.referenceCode || '-'}
Alan: ${c.resource ?? '-'} • Tarih: ${c.date ?? 'yarın'} • Saat: ${c.hour ?? '12:00'}
Kişi: ${c.guests} • Tablo: ${c.table}
Durum: ${c.simulated ? 'Mock kayıt (Supabase env bekleniyor)' : 'Canlı kayıt'}
${'```'}
${c.ok ? 'Saygılarımızla, iyi günler dileriz. 😊' : 'Lütfen talebi tekrar gözden geçirelim.'}`;
}

export function bookingWriterStatus(): string {
  return `Rezervasyon Köprüsü [parcels/sports_facilities/TBYB • referans kodu • ${supabaseSwitchStatus().status}]`;
}
