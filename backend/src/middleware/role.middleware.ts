import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}
