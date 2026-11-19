import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class SummarizedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  hours?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  limit: number = 1000;
}
