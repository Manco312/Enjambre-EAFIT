import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { UsersService } from '../../../src/users/users.service.js'; 
import { User } from '../../../src/users/entities/user.entity.js'; 
import { Group } from '../../../src/groups/entities/group.entity.js'; 

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async () => 'hashed-password'),
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let groupsRepository: Repository<Group>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Group),
          useValue: {
            findOneBy: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    groupsRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user (with its group) when it exists', async () => {
      const user = { id: 1, username: 'john' } as User;

      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne('john');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'john' },
        relations: { group: true },
      });
      expect(result).toBe(user);
    });

    it('should return null when the user does not exist', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne('john');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const dto = { username: 'junta', password: 'password123', groupId: 7 };

    it('should hash the password and save a BOARD user tied to the group', async () => {
      const group = { id: 7 } as Group;
      const savedUser = { id: 2, username: 'junta', role: 'BOARD' } as User;

      // 1ra llamada: lookup por username (libre). 2da: ¿el grupo ya tiene usuario? (no).
      vi.spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      vi.spyOn(groupsRepository, 'findOneBy').mockResolvedValue(group);
      vi.spyOn(usersRepository, 'create').mockReturnValue(savedUser);
      vi.spyOn(usersRepository, 'save').mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(groupsRepository.findOneBy).toHaveBeenCalledWith({ id: 7 });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: 'junta',
        password: 'hashed-password',
        role: 'BOARD',
        group,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toBe(savedUser);
    });

    it('should throw BadRequestException when the username is already in use', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue({ id: 1 } as User);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the group does not exist', async () => {
      vi.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      vi.spyOn(groupsRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the group already has a board user', async () => {
      vi.spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 99 } as User);
      vi.spyOn(groupsRepository, 'findOneBy').mockResolvedValue({
        id: 7,
      } as Group);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });
});
