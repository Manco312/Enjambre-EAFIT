import { Injectable, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOne(createUserDto.username);

    if (existingUser) {
      throw new BadRequestException('Este nombre de usuario ya está en uso.');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      role: 'user',
    });

    return await this.usersRepository.save(user);
  }

  async createAdmin(): Promise<User> {
    const admin = this.usersRepository.create({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });

    return await this.usersRepository.save(admin);
  }
}
