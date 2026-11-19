import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { authConfig } from '../../config/configuration.js';
import { UsersService } from '../../users/users.service.js';
import { AuthErrorCode, authError } from '../auth-error.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AccessTokenPayload, AuthUser } from '../types/auth-user.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);

    if (isPublic) {
      if (token) request.user = (await this.resolveUser(token).catch(() => undefined)) ?? undefined;
      return true;
    }

    if (!token) throw authError(AuthErrorCode.Unauthenticated, 'Missing access token');
    request.user = await this.resolveUser(token);
    return true;
  }

  private async resolveUser(token: string): Promise<AuthUser> {
    const payload = await this.jwt
      .verifyAsync<AccessTokenPayload>(token, { secret: this.config.jwtSecret })
      .catch(() => {
        throw authError(AuthErrorCode.Unauthenticated, 'Invalid access token');
      });

    const user = await this.usersService.findById(payload.sub).catch(() => {
      throw authError(AuthErrorCode.Unauthenticated, 'User no longer exists');
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
