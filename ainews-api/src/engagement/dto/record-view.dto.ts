import { IsBoolean, IsOptional } from 'class-validator';

export class RecordViewDto {
  @IsOptional()
  @IsBoolean()
  exploration?: boolean;
}
