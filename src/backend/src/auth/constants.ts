import type { JwtSignOptions } from '@nestjs/jwt';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: (process.env.JWT_EXPIRES_IN ??
    '1d') as JwtSignOptions['expiresIn'],
};
