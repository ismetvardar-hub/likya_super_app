import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService, Row } from '../../core/database/database.module';
import { CreateBookingDto } from './dto/booking.dto';

const CATALOG: Record<string, { service_id: string; name: string; price: number }[]> = {
  tur: [
    { service_id: 'tur-01', name: 'Likya Yolu Antik Kent Turu', price: 250 },
    { service_id: 'tur-02', name: 'Patara Kumul Yürüyüşü', price: 180 },
  ],
  tekne: [
    { service_id: 'tekne-01', name: 'Kaş-Kekova Tekne Turu', price: 450 },
    { service_id: 'tekne-02', name: 'Kalkan Batık Şehir Turu', price: 400 },
  ],
  parasut: [
    { service_id: 'parasut-01', name: 'Babadağ Yamaç Paraşütü (Başlangıç)', price: 1200 },
    { service_id: 'parasut-02', name: 'Babadağ Tandem Uçuş', price: 1600 },
  ],
  etkinlik: [
    { service_id: 'etkinlik-01', name: 'Likya Şenlikleri Konser', price: 150 },
  ],
};

/** Keşif & Etkinlik rezervasyon modülü. */
@Injectable()
export class BookingService {
  constructor(private readonly db: DatabaseService) {}

  /** Müsait slotlar: katalog + o tarihteki confirmed rezervasyonlar hariç. */
  async available(type: string, date?: string) {
    const services = CATALOG[type] ?? [];
    const day = date ?? new Date().toISOString().slice(0, 10);

    const booked = await this.db
      .query<Row>(
        `SELECT service_id, count(*) AS booked
           FROM bookings WHERE type = $1 AND slot_ts::date = $2::date
              AND status IN ('pending','confirmed')
          GROUP BY service_id`,
        [type, day],
      )
      .catch(() => [] as Row[]);

    const bookedCount = new Map<string, number>(booked.map((b) => [String(b.service_id), Number(b.booked)]));
    const slots = ['09:00', '11:00', '13:00', '15:00', '17:00'];
    const CAPACITY = 4;

    return {
      date: day,
      type,
      services: services.map((s) => {
        const reserved = bookedCount.get(s.service_id) ?? 0;
        return {
          ...s,
          capacity: CAPACITY,
          remaining: Math.max(0, CAPACITY - reserved),
          slots: reserved >= CAPACITY ? [] : slots,
        };
      }),
    };
  }

  async create(userId: string, dto: CreateBookingDto) {
    const service = (CATALOG[dto.type] ?? []).find((s) => s.service_id === dto.service_id);
    const total = (service?.price ?? 0) * dto.party_size;
    if (total <= 0) throw new BadRequestException('Bilinmeyen hizmet seçildi');

    const rows = await this.db.query<Row>(
      `INSERT INTO bookings (user_id, type, service_id, slot_ts, party_size, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id, type, service_id, slot_ts, party_size, total, status`,
      [userId, dto.type, dto.service_id, dto.slot_ts, dto.party_size, total],
    );
    return { booking: rows[0], message: 'Rezervasyon alındı — onay bekleniyor' };
  }
}
