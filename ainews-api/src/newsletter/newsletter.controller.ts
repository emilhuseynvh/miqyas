import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { DigestService } from './digest.service.js';
import { SubscribeDto } from './dto/subscribe.dto.js';
import { TokenDto } from './dto/token.dto.js';
import { NewsletterService, type SubscribeResult, type TokenResult } from './newsletter.service.js';

@Controller()
export class NewsletterController {
  constructor(
    private readonly newsletter: NewsletterService,
    private readonly digest: DigestService,
  ) {}

  @Public()
  @Post('newsletter/subscribe')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  subscribe(@Body() dto: SubscribeDto): Promise<SubscribeResult> {
    return this.newsletter.subscribe(dto.email);
  }

  @Public()
  @Post('newsletter/confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Body() dto: TokenDto): Promise<TokenResult> {
    return this.newsletter.confirm(dto.token);
  }

  @Public()
  @Post('newsletter/unsubscribe')
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: TokenDto): Promise<TokenResult> {
    return this.newsletter.unsubscribe(dto.token);
  }

  @Roles(UserRole.Admin)
  @Get('admin/newsletter/preview')
  @Header('content-type', 'text/html; charset=utf-8')
  preview(): Promise<string> {
    return this.digest.preview();
  }
}
