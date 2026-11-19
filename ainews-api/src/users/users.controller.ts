import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserRole } from './enums/user-role.enum.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() current: AuthUser): Promise<UserResponseDto> {
    const user = await this.usersService.findById(current.id);
    return UserResponseDto.from(user);
  }

  @Get()
  @Roles(UserRole.Admin)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => UserResponseDto.from(user));
  }

  @Patch(':id/role')
  @Roles(UserRole.Admin)
  async updateRole(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<UserResponseDto> {
    if (current.id === id) throw new ForbiddenException('You cannot change your own role');
    const user = await this.usersService.updateRole(id, dto.role);
    return UserResponseDto.from(user);
  }
}
