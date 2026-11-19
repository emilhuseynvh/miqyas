import { IsIn } from 'class-validator';
import type { ReactionValue } from '../engagement.service.js';

export class ReactionDto {
  @IsIn([-1, 0, 1])
  value: ReactionValue;
}
