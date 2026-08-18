import { Global, Injectable, Module, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

export interface Row { [key: string]: unknown }

/**
 * PostgreSQL + PostGIS erişim servisi.
 * - DATABASE_URL set edilmemişse bağlantı açmaz; sorgular anlamlı 503 döndürür.
 * - coğrafi (PostGIS) yardımcıları ST_MakePoint / ST_DWithin üzerinden çalışır.
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool | null = null;

  constructor() {
    const url = process.env.DATABASE_URL ?? '';
    if (url) {
      this.pool = new Pool({ connectionString: url, max: 10, connectionTimeoutMillis: 3000 });
    }
  }

  get isConnected(): boolean {
    return this.pool !== null;
  }

  async query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new ServiceUnavailableException('DATABASE_URL yapılandırılmadı — PostGIS/PG bağlantısı kapalı');
    }
    const res = await this.pool.query(text, params);
    return res.rows as T[];
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
