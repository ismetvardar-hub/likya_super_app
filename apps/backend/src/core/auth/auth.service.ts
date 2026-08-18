import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService, Row } from '../database/database.module';
import { RedisService } from '../redis/redis.module';
import { Role } from './role.enum';
import { JwtUser } from './jwt-auth.guard';
import { hashPassword, verifyPassword } from './password.util';

interface AppUser extends Row {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

const REFRESH_PREFIX = 'refresh:';

@Injectable()
export class AuthService {
  // Redis yoksa bellek içi refresh deposu (Plan Z degrade)
  private memoryStore = new Map<string, string>();

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: { email: string; password: string; full_name: string; role?: Role }) {
    const role = dto.role ?? Role.TOURIST;

    try {
      const existing = await this.db.query<AppUser>('SELECT id FROM app_users WHERE email = $1', [dto.email.toLowerCase()]);
      if (existing.length > 0) throw new ConflictException('Bu e-posta zaten kayıtlı');

      const passwordHash = await hashPassword(dto.password);
      const created = await this.db.query<AppUser>(
        `INSERT INTO app_users (email, full_name, role) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING RETURNING id, email, full_name, role`,
        [dto.email.toLowerCase(), dto.full_name, role],
      );
      if (created.length === 0) throw new ConflictException('Bu e-posta zaten kayıtlı');
      const userId = String(created[0].id);

      await this.db.query('INSERT INTO auth_credentials (user_id, password_hash) VALUES ($1, $2)', [userId, passwordHash]);

      return this.issueTokens({ id: userId, email: dto.email.toLowerCase(), role });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      if (err instanceof UnauthorizedException) throw err;
      throw err;
    }
  }

  async login(email: string, password: string) {
    const users = await this.db.query<AppUser>('SELECT id, email, full_name, role FROM app_users WHERE email = $1', [email.toLowerCase()]);
    if (users.length === 0) throw new UnauthorizedException('E-posta veya şifre hatalı');

    const user = users[0];
    const creds = await this.db.query<{ password_hash: string }>('SELECT password_hash FROM auth_credentials WHERE user_id = $1', [user.id]);
    if (creds.length === 0) throw new UnauthorizedException('Kimlik bilgisi bulunamadı');

    const ok = await verifyPassword(password, creds[0].password_hash);
    if (!ok) throw new UnauthorizedException('E-posta veya şifre hatalı');

    return this.issueTokens({ id: String(user.id), email: user.email, role: user.role });
  }

  async refresh(refreshToken: string) {
    let payload: JwtUser;
    try {
      payload = await this.jwt.verifyAsync<JwtUser>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token geçersiz veya süresi dolmuş');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Refresh token bekleniyor');

    // Oturum doğrulaması: Redis'te yoksa bellek deposuna düş (Plan Z degrade).
    let session: string | null;
    if (this.redis.available) {
      session = await this.redis.get(REFRESH_PREFIX + refreshToken);
    } else {
      session = this.memoryStore.get(REFRESH_PREFIX + refreshToken) ?? null;
    }
    if (session === null) throw new UnauthorizedException('Oturum iptal edilmiş veya bulunamadı');

    const access = await this.jwt.signAsync(
      { sub: payload.sub, email: payload.email, role: payload.role, type: 'access' },
      { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
    );
    return { access_token: access, token_type: 'bearer', role: payload.role };
  }

  async me(userId: string) {
    const rows = await this.db.query<AppUser>('SELECT id, email, full_name, role, created_at FROM app_users WHERE id = $1', [userId]);
    if (rows.length === 0) throw new UnauthorizedException('Kullanıcı bulunamadı');
    const u = rows[0];
    return { id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at };
  }

  private async issueTokens(user: { id: string; email: string; role: Role }) {
    const secret = process.env.JWT_SECRET ?? 'change_me_jwt_secret_32chars_min';
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
    const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

    const access = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role, type: 'access' },
      { secret, expiresIn },
    );
    const refresh = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role, type: 'refresh' },
      { secret, expiresIn: refreshExpires },
    );

    // Refresh token'ı sakla (iptal edilebilir oturum): Redis → yoksa bellek
    if (this.redis.available) await this.redis.set(REFRESH_PREFIX + refresh, user.id, 7 * 24 * 3600);
    else this.memoryStore.set(REFRESH_PREFIX + refresh, user.id);

    return {
      access_token: access,
      refresh_token: refresh,
      token_type: 'bearer',
      expires_in: expiresIn,
      role: user.role,
    };
  }
}
