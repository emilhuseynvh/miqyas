import { Transform } from 'class-transformer';
import { IsJWT, IsString, Length } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CompleteRegistrationDto {
  @IsJWT()
  token: string;

  @Transform(trim)
  @IsString()
  @Length(1, 100)
  firstName: string;

  @Transform(trim)
  @IsString()
  @Length(1, 100)
  lastName: string;
}
