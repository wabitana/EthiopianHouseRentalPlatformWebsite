import { Response } from 'express';

export function successResponse(res: Response, data: any, statusCode: number = 200, message?: string) {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
}

export function errorResponse(res: Response, message: string, statusCode: number = 400, errorCode?: string) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode || 'BAD_REQUEST',
      message,
    },
  });
}
