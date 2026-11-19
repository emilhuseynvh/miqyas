import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UserRole } from './enums/user-role.enum.js';

type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  count(): Promise<number> {
    return this.users.count();
  }

  findAll(): Promise<User[]> {
    return this.users.find({ order: { createdAt: 'DESC' } });
  }

  create(input: CreateUserInput): Promise<User> {
    const user = this.users.create({
      ...input,
      email: input.email.toLowerCase(),
      role: input.role ?? UserRole.User,
      lastLoginAt: new Date(),
    });
    return this.users.save(user);
  }

  async markLoggedIn(user: User): Promise<User> {
    user.lastLoginAt = new Date();
    return this.users.save(user);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.users.save(user);
  }
}
