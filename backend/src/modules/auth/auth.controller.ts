import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 'User logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  static async verifyPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.verifyPhoneOtp(req.body);
      sendSuccess(res, result, 'Phone verified successfully');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.sendOtp(req.body.phoneOrEmail);
      sendSuccess(res, result, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  }
}
