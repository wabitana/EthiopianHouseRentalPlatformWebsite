import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      sendSuccess(res, stats, 'Admin dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AdminService.getAuditLogs();
      sendSuccess(res, logs, 'System audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}
