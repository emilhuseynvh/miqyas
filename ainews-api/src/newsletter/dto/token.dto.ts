import { IsUUID } from 'class-validator';

export class TokenDto {
  @IsUUID()
  token: string;
}
