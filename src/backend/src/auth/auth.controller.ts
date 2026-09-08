import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { Public } from './decorators/public.decorator.js';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  groupId: number | null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('me')
  async me(@Req() request: Request & { user: JwtPayload }) {
    const payload = request.user;
    const user = await this.usersService.findOne(payload.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      groupId: user.group?.id ?? null,
    };
  }
}
