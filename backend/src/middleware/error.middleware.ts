import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof AppError) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.code,
      (err as any).errors || undefined
    );
  }

  // Handle unexpected operational errors
  const isDev = env.NODE_ENV === 'development';
  return sendError(
    res,
    isDev ? err.message : 'An unexpected error occurred on the server',
    500,
    'INTERNAL_SERVER_ERROR',
    isDev ? err.stack : undefined
  );
}
