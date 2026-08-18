import { Injectable } from '@nestjs/common';
import { DatabaseService, Row } from '../../core/database/database.module';
import { CreateMarketOrderDto } from './dto/marketplace.dto';

const DEMO_PRODUCTS = [
  { id: 'mkt-01', name: 'Kekik Balı (Yerel Üretici — Finike)', price: 180, unit: 'kg' },
  { id: 'mkt-02', name: 'Keçiboynuzu Pekmezi', price: 120, unit: 'kg' },
  { id: 'mkt-03', name: 'Babadağ Yaylası Peyniri', price: 210, unit: 'kg' },
  { id: 'mkt-04', name: 'Zeytinyağı (Soğuk Sıkım)', price: 260, unit: 'L' },
  { id: 'mkt-05', name: 'Demre Domatesi (Organik)', price: 45, unit: 'kg' },
];

/** Pazar & Yerel Esnaf modülü — fair_products varsa DB, yoksa demo katalog (Plan Z). */
@Injectable()
export class MarketplaceService {
  constructor(private readonly db: DatabaseService) {}

  async products(): Promise<{ source: string; products: Row[] }> {
    try {
      const rows = await this.db.query<Row>('SELECT * FROM fair_products ORDER BY name ASC LIMIT 100');
      if (rows.length > 0) return { source: 'database', products: rows };
    } catch { /* DB kapalı → demo katalog */ }
    return { source: 'catalog', products: DEMO_PRODUCTS as unknown as Row[] };
  }

  async createOrder(userId: string, dto: CreateMarketOrderDto) {
    const rows = await this.db.query<Row>(
      `INSERT INTO marketplace_orders (user_id, product_id, qty, total, address, status)
       VALUES ($1, $2, $3, $4, $5, 'new')
       RETURNING id, product_id, qty, total, status, created_at`,
      [userId, dto.product_id, dto.qty, dto.total, dto.address],
    );
    return { order: rows[0], message: 'Sipariş esnafa iletildi' };
  }
}
