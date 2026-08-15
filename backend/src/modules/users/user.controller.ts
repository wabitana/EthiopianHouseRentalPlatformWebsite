import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await UserService.getProfile(userId);
      sendSuccess(res, user, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updated = await UserService.updateProfile(userId, req.body);
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = req.params.id;
      const updated = await UserService.updateUserRoles(targetUserId, req.body);
      sendSuccess(res, updated, 'User roles updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await UserService.getAllUsers(page, limit);
      sendSuccess(res, result.users, 'Users retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
