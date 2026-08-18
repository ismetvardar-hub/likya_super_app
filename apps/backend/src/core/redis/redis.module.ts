import { Global, Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis önbellek/sayaç servisi (opsiyonel degrade).
 * - REDIS_URL yoksa veya bağlantı çökerse servis sessizce boş değer döner;
 *   uygulama asla Redis yüzünden kilitlenmez (Plan Z prensibi).
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor() {
    const url = process.env.REDIS_URL ?? '';
    if (url) {
      try {
        this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
      } catch (err) {
        this.logger.warn(`Redis bağlantısı kurulamadı (degrade mod): ${(err as Error).message}`);
        this.client = null;
      }
    }
  }

  get available(): boolean {
    return this.client !== null;
  }

  async set(key: string, value: string, ttlSec?: number): Promise<void> {
    try {
      if (this.client) await (ttlSec ? this.client.set(key, value, 'EX', ttlSec) : this.client.set(key, value));
    } catch (err) {
      this.logger.warn(`Redis set başarısız: ${(err as Error).message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.client) return null;
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`Redis get başarısız: ${(err as Error).message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client) await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Redis del başarısız: ${(err as Error).message}`);
    }
  }

  async incr(key: string, ttlSec?: number): Promise<number> {
    try {
      if (!this.client) return 0;
      const n = await this.client.incr(key);
      if (ttlSec) await this.client.expire(key, ttlSec);
      return n;
    } catch (err) {
      this.logger.warn(`Redis incr başarısız: ${(err as Error).message}`);
      return 0;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
