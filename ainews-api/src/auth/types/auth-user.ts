import type { UserRole } from '../../users/enums/user-role.enum.js';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AccessTokenPayload = {
  sub: string;
};

export type LoginLinkPayload = {
  purpose: 'login';
  sub: string;
  ver: number;
};

export type RegisterLinkPayload = {
  purpose: 'register';
  email: string;
};

export type MagicLinkPayload = LoginLinkPayload | RegisterLinkPayload;
