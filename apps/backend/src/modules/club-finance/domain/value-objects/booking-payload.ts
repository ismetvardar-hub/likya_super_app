// ============================================================================
// 📦 CLUB-FINANCE · Domain Value Object: BookingPayload
// Revenue Router'a giren rezervasyon/ödeme ham verisinin doğrulanmış şekli.
// ============================================================================

import { Money } from './money';

export type BookingChannel = 'pos' | 'online' | 'mobile' | 'vpos';

export interface BookingPayloadData {
  bookingRef: string;
  resource: string;
  amountTl: number;
  channel: BookingChannel;
  customerName?: string;
  date?: string;
}

export class BookingPayload {
  readonly bookingRef: string;
  readonly resource: string;
  readonly amount: Money;
  readonly channel: BookingChannel;
  readonly customerName: string;
  readonly date: string;

  private constructor(data: BookingPayloadData) {
    this.bookingRef = data.bookingRef;
    this.resource = data.resource;
    this.amount = Money.fromTl(data.amountTl);
    this.channel = data.channel;
    this.customerName = data.customerName ?? 'Misafir';
    this.date = data.date ?? new Date().toISOString().slice(0, 10);
  }

  static fromRaw(raw: Record<string, unknown>): BookingPayload {
    const bookingRef = String(raw.bookingRef ?? raw.reference ?? '');
    const resource = String(raw.resource ?? '');
    const amountTl = Number(raw.amountTl ?? raw.amount ?? 0);
    const channel = String(raw.channel ?? 'pos') as BookingChannel;

    if (!bookingRef) throw new Error('BookingPayload: bookingRef zorunlu');
    if (!resource) throw new Error('BookingPayload: resource zorunlu');
    if (!Number.isFinite(amountTl) || amountTl <= 0) throw new Error('BookingPayload: geçerli tutar gerekli');

    return new BookingPayload({ bookingRef, resource, amountTl, channel, customerName: raw.customerName ? String(raw.customerName) : undefined, date: raw.date ? String(raw.date) : undefined });
  }
}
