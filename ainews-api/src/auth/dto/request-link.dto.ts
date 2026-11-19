import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class RequestLinkDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(320)
  email: string;
}
