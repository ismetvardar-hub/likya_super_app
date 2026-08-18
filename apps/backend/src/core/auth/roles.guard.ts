import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { AuthedRequest, JwtUser } from './jwt-auth.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const user: JwtUser | undefined = req.user;
    if (!user) throw new ForbiddenException('Rol kontrolü için giriş yapılmalı');
    if (user.role === Role.ADMIN) return true; // admin her şeye erişir
    if (!required.includes(user.role)) throw new ForbiddenException('Bu işlem için yetkiniz yok');
    return true;
  }
}
