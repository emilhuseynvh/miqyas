import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class SubscribeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(320)
  email: string;
}
