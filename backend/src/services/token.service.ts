import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: Role[];
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  }
}
