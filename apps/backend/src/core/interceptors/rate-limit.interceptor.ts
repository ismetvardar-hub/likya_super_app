import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RedisService } from '../redis/redis.module';

const WINDOW_SEC = 60;
const MAX_REQ = 120;

/** Redis tabanlı IP rate limit (Redis yoksa pasif geçer — Plan Z). */
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private readonly redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ ip?: string; originalUrl?: string }>();
    const ip = req.ip ?? 'unknown';
    const route = (req.originalUrl ?? 'unknown').split('?')[0];

    void this.redis.incr(`rl:${ip}:${route}`, WINDOW_SEC).then((count) => {
      if (count > MAX_REQ) {
        throw new HttpException('Çok fazla istek — lütfen 1 dakika sonra tekrar deneyin', HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    return next.handle().pipe(tap(() => undefined));
  }
}

