import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { authConfig } from '../config/configuration.js';
import { AuthErrorCode, authError } from './auth-error.js';
import type { MagicLinkPayload } from './types/auth-user.js';

@Injectable()
export class MagicLinkService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
  ) {}

  get ttlMinutes(): number {
    return this.config.magicLinkTtlMinutes;
  }

  sign(payload: MagicLinkPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.magicLinkSecret,
      expiresIn: this.config.magicLinkTtlMinutes * 60,
    });
  }

  async verify(token: string): Promise<MagicLinkPayload> {
    try {
      return await this.jwt.verifyAsync<MagicLinkPayload>(token, {
        secret: this.config.magicLinkSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw authError(AuthErrorCode.ExpiredLink, 'This link has expired');
      }
      throw authError(AuthErrorCode.InvalidLink, 'This link is invalid');
    }
  }
}
