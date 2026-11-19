import { IsJWT } from 'class-validator';

export class VerifyLinkDto {
  @IsJWT()
  token: string;
}
