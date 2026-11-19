import { ArrayMaxSize, IsArray, IsString, Matches } from 'class-validator';

export class InterestsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Matches(/^[a-z0-9-]+$/, { each: true })
  categories: string[];
}
