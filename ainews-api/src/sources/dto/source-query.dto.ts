import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.js';
import { SourceStatus } from '../enums/source-status.enum.js';

export class SourceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SourceStatus)
  status?: SourceStatus;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
