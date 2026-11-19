import type { UserResponseDto } from '../../users/dto/user-response.dto.js';

export type AuthenticatedResponse = {
  status: 'authenticated';
  accessToken: string;
  user: UserResponseDto;
};

export type RegistrationRequiredResponse = {
  status: 'registration_required';
  email: string;
};

export type VerifyLinkResponse = AuthenticatedResponse | RegistrationRequiredResponse;
