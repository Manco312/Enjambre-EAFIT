import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOne(createUserDto.username);

    if (existingUser) {
      throw new BadRequestException('Este nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'board',
    });

    return await this.usersRepository.save(user);
  }

  async createAdmin(): Promise<User> {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

    const admin = this.usersRepository.create({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      role: 'admin',
    });

    return await this.usersRepository.save(admin);
  }
}
