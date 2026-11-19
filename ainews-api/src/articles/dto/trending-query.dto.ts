import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class TrendingQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  category?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
