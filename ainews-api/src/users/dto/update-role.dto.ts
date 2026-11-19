import { IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum.js';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
