// ============================================================================
// 💸 CLUB-FINANCE · Application Service: Revenue Router
// Gelen rezervasyon/ödeme gelirini kulüp ve ticari tüzel kişilik arasında
// yönlendirir (komisyon oranına göre); fatura tetikleme olayı yayınlar.
// ============================================================================

import { BookingPayload } from '../../domain/value-objects/booking-payload';
import { InvoiceTriggeredEvent } from '../../domain/events/invoice-triggered.event';
import { Entity_Club } from '../../domain/entities/entity-club';
import { Entity_Commercial } from '../../domain/entities/entity-commercial';
import type { ClubRepository, CommercialRepository } from '../../infrastructure/persistence/repositories';
import type { RouteRevenueDto } from '../dtos/club-finance.dtos';

export interface RevenueRouterResult {
  ok: boolean;
  bookingRef: string;
  clubShareTl: number;
  commercialShareTl: number;
  invoiceTriggered: boolean;
  invoiceRef: string;
}

export class RevenueRouterService {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly commercials: CommercialRepository,
  ) {}

  async route(dto: RouteRevenueDto): Promise<RevenueRouterResult> {
    const payload = BookingPayload.fromRaw({ ...dto, amountTl: dto.amountTl });
    const club = await this.clubs.findById('club-main');
    if (!club) throw new Error('Ana kulüp hesabı bulunamadı — önce Entity_Club oluşturun');
    const commercial = await this.commercials.findById('commercial-main');
    if (!commercial) throw new Error('Ticari işletme hesabı bulunamadı — önce Entity_Commercial oluşturun');

    const commercialShare = payload.amount.multiply(commercial.commissionRate);
    const clubShare = payload.amount.subtract(commercialShare);

    commercial.creditRevenue(commercialShare);
    club.creditRevenue(clubShare);
    await this.commercials.save(commercial);
    await this.clubs.save(club);

    const invoiceRef = `INV-${payload.bookingRef.slice(-6)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const event = new InvoiceTriggeredEvent(invoiceRef, 'COMMERCIAL_SALE', payload.customerName, payload.amount);

    return {
      ok: true,
      bookingRef: payload.bookingRef,
      clubShareTl: clubShare.tl,
      commercialShareTl: commercialShare.tl,
      invoiceTriggered: true,
      invoiceRef,
      lastEvent: event.toJSON(),
    } as RevenueRouterResult & { lastEvent: Record<string, unknown> };
  }
}
