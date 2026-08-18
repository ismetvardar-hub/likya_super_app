import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from './role.enum';

export interface JwtUser {
  sub: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
}

export interface AuthedRequest {
  user?: JwtUser;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  originalUrl?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers['authorization'];
    if (!header || Array.isArray(header)) throw new UnauthorizedException('Yetkilendirme başlığı eksik');

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Geçersiz Bearer token');

    try {
      const payload = await this.jwtService.verifyAsync<JwtUser>(token, {
        secret: process.env.JWT_SECRET ?? 'change_me_jwt_secret_32chars_min',
      });
      if (payload.type !== 'access') throw new UnauthorizedException('Access token bekleniyor');
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token geçersiz veya süresi dolmuş');
    }
  }
}

/** Aktif kullanıcıyı controller parametresine enjekte eder. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtUser => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>();
  if (!req.user) throw new UnauthorizedException('Kullanıcı doğrulanamadı');
  return req.user;
});

