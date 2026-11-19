import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '../config/configuration.js';
import { MailService } from '../mail/mail.service.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import type { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { UsersService } from '../users/users.service.js';
import { AuthErrorCode, authError } from './auth-error.js';
import type { AuthenticatedResponse, VerifyLinkResponse } from './dto/auth-response.dto.js';
import type { CompleteRegistrationDto } from './dto/complete-registration.dto.js';
import { MagicLinkService } from './magic-link.service.js';
import { PasswordService } from './password.service.js';
import type { AccessTokenPayload, RegisterLinkPayload } from './types/auth-user.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly magicLinks: MagicLinkService,
    private readonly mail: MailService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async requestLink(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    const token = user
      ? await this.magicLinks.sign({ purpose: 'login', sub: user.id, ver: this.loginVersion(user) })
      : await this.magicLinks.sign({ purpose: 'register', email });

    await this.mail.sendMagicLink({
      to: email,
      purpose: user ? 'login' : 'register',
      link: this.buildLink(token),
      ttlMinutes: this.magicLinks.ttlMinutes,
    });
  }

  async verifyLink(token: string): Promise<VerifyLinkResponse> {
    const payload = await this.magicLinks.verify(token);

    if (payload.purpose === 'register') {
      await this.assertEmailAvailable(payload);
      return { status: 'registration_required', email: payload.email };
    }

    const user = await this.usersService.findById(payload.sub).catch(() => {
      throw authError(AuthErrorCode.InvalidLink, 'This link is invalid');
    });
    if (this.loginVersion(user) !== payload.ver) {
      throw authError(AuthErrorCode.LinkAlreadyUsed, 'This link has already been used');
    }

    return this.createSession(await this.usersService.markLoggedIn(user));
  }

  async completeRegistration(dto: CompleteRegistrationDto): Promise<AuthenticatedResponse> {
    const payload = await this.magicLinks.verify(dto.token);
    if (payload.purpose !== 'register') {
      throw authError(AuthErrorCode.InvalidLink, 'This link is not a registration link');
    }
    await this.assertEmailAvailable(payload);

    const user = await this.usersService.create({
      email: payload.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: this.app.adminEmails.includes(payload.email) ? UserRole.Admin : UserRole.User,
    });

    return this.createSession(user);
  }

  async adminLogin(email: string, password: string): Promise<AuthenticatedResponse> {
    const user = await this.usersService.findByEmailWithPassword(email);
    const valid = await this.passwords.verify(password, user?.passwordHash);
    if (!user || !valid || user.role !== UserRole.Admin) {
      throw authError(AuthErrorCode.InvalidCredentials, 'Email or password is incorrect');
    }
    return this.createSession(await this.usersService.markLoggedIn(user));
  }

  private async assertEmailAvailable(payload: RegisterLinkPayload): Promise<void> {
    const existing = await this.usersService.findByEmail(payload.email);
    if (existing) {
      throw authError(AuthErrorCode.AccountExists, 'An account with this email already exists');
    }
  }

  private async createSession(user: User): Promise<AuthenticatedResponse> {
    const payload: AccessTokenPayload = { sub: user.id };
    const accessToken = await this.jwt.signAsync(payload);
    return { status: 'authenticated', accessToken, user: UserResponseDto.from(user) };
  }

  private loginVersion(user: User): number {
    return user.lastLoginAt?.getTime() ?? 0;
  }

  private buildLink(token: string): string {
    const url = new URL('/hesab/dogrula', this.app.url);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
