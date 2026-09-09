import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token when credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'john',
        password: 'hashedPassword',
        role: 'BOARD',
      } as User;

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user);
      vi.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');
      vi.mocked(bcrypt.compare).mockImplementation(async () => true);

      const result = await service.signIn('john', 'password123');

      expect(usersService.findOne).toHaveBeenCalledWith('john');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'john',
        role: 'BOARD',
        groupId: null,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
      });
    });

    it('should include the groupId in the payload when the user belongs to a group', async () => {
      const user = {
        id: 2,
        username: 'junta',
        password: 'hashedPassword',
        role: 'BOARD',
        group: { id: 7 },
      } as User;

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user);
      vi.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');
      vi.mocked(bcrypt.compare).mockImplementation(async () => true);

      await service.signIn('junta', 'password123');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 2,
        username: 'junta',
        role: 'BOARD',
        groupId: 7,
      });
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      vi.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(service.signIn('unknown', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findOne).toHaveBeenCalledWith('unknown');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when the password is incorrect', async () => {
      const user = {
        id: 1,
        username: 'john',
        password: 'hashedPassword',
        role: 'BOARD',
      } as User;

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockImplementation(async () => false);

      await expect(service.signIn('john', 'wrongPassword')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findOne).toHaveBeenCalledWith('john');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
