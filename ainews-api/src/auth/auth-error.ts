import { ConflictException, UnauthorizedException } from '@nestjs/common';

export enum AuthErrorCode {
  InvalidLink = 'INVALID_LINK',
  ExpiredLink = 'EXPIRED_LINK',
  LinkAlreadyUsed = 'LINK_ALREADY_USED',
  AccountExists = 'ACCOUNT_EXISTS',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  Unauthenticated = 'UNAUTHENTICATED',
}

export const authError = (code: AuthErrorCode, message: string) =>
  code === AuthErrorCode.AccountExists
    ? new ConflictException({ code, message })
    : new UnauthorizedException({ code, message });
