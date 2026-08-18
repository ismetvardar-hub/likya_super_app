import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { loadConfig } from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { RedisModule } from './core/redis/redis.module';
import { AuthModule } from './core/auth/auth.module';
import { RouterModule } from './core/router/router.module';
import { RateLimitInterceptor } from './core/interceptors/rate-limit.interceptor';
import { TrailModule } from './modules/trail/trail.module';
import { BookingModule } from './modules/booking/booking.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [loadConfig] }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    RouterModule,
    TrailModule,
    BookingModule,
    MarketplaceModule,
    WalletModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RateLimitInterceptor },
  ],
})
export class AppModule {}
