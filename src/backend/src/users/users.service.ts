import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { Group } from '../groups/entities/group.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { USER_ROLES } from '../auth/roles.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { username },
      relations: { group: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, groupId } = createUserDto;

    const existingUser = await this.findOne(username);

    if (existingUser) {
      throw new BadRequestException('The username is already in use');
    }

    const group = await this.groupsRepository.findOneBy({ id: groupId });

    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    const groupHasUser = await this.usersRepository.findOne({
      where: { group: { id: groupId } },
    });

    if (groupHasUser) {
      throw new ConflictException(
        `Group with id ${groupId} already has a board user`,
      );
    }

    const user = this.usersRepository.create({
      username,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: USER_ROLES.BOARD,
      group,
    });

    return await this.usersRepository.save(user);
  }
}
