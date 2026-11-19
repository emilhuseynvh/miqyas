import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import type { AuthenticatedResponse, VerifyLinkResponse } from './dto/auth-response.dto.js';
import { CompleteRegistrationDto } from './dto/complete-registration.dto.js';
import { RequestLinkDto } from './dto/request-link.dto.js';
import { VerifyLinkDto } from './dto/verify-link.dto.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async requestLink(@Body() dto: RequestLinkDto): Promise<{ sent: true }> {
    await this.authService.requestLink(dto.email);
    return { sent: true };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyLinkDto): Promise<VerifyLinkResponse> {
    return this.authService.verifyLink(dto.token);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CompleteRegistrationDto): Promise<AuthenticatedResponse> {
    return this.authService.completeRegistration(dto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  adminLogin(@Body() dto: AdminLoginDto): Promise<AuthenticatedResponse> {
    return this.authService.adminLogin(dto.email, dto.password);
  }
}
