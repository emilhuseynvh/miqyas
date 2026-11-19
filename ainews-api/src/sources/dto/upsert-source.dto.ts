import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class CreateSourceDto {
  @Transform(trim)
  @IsString()
  @Length(1, 200)
  name: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  siteUrl: string;

  @IsOptional()
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  feedUrl?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  kind?: string;

  @IsOptional()
  @IsInt()
  defaultCategoryId?: number | null;
}

export class UpdateSourceDto extends PartialType(CreateSourceDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
