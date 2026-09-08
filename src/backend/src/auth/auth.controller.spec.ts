import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: vi.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn with username and password', async () => {
      const signInDto = {
        username: 'john',
        password: 'password123',
      };

      const response = {
        access_token: 'jwt-token',
      };

      vi.spyOn(authService, 'signIn').mockResolvedValue(response);

      const result = await controller.signIn(signInDto);

      expect(authService.signIn).toHaveBeenCalledWith('john', 'password123');

      expect(result).toBe(response);
    });

    it('should propagate an error when authentication fails', async () => {
      const signInDto = {
        username: 'john',
        password: 'wrong-password',
      };

      vi.spyOn(authService, 'signIn').mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.signIn).toHaveBeenCalledWith('john', 'wrong-password');
    });
  });

  describe('me', () => {
    it('should return the current session derived from the token and the DB', async () => {
      const request = {
        user: { sub: 2, username: 'junta', role: 'BOARD', groupId: 7 },
      } as unknown as Parameters<typeof controller.me>[0];

      vi.spyOn(usersService, 'findOne').mockResolvedValue({
        id: 2,
        username: 'junta',
        role: 'BOARD',
        group: { id: 7 },
      } as User);

      const result = await controller.me(request);

      expect(usersService.findOne).toHaveBeenCalledWith('junta');
      expect(result).toEqual({
        userId: 2,
        username: 'junta',
        role: 'BOARD',
        groupId: 7,
      });
    });

    it('should throw UnauthorizedException when the user no longer exists', async () => {
      const request = {
        user: { sub: 99, username: 'ghost', role: 'BOARD', groupId: null },
      } as unknown as Parameters<typeof controller.me>[0];

      vi.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(controller.me(request)).rejects.toThrow(UnauthorizedException);
    });
  });
});
