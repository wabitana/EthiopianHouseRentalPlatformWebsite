import { Request, Response, NextFunction } from 'express';
import { TokenService, TokenPayload } from '../services/token.service';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
