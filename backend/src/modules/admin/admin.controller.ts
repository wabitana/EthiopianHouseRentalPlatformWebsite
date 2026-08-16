import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../utils/response';
import { PropertyRepository } from '../properties/property.repository';
import { prisma } from '../../prisma';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      sendSuccess(res, stats, 'Admin dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PropertyRepository.findMany({}, 0, 100);
      sendSuccess(res, { properties: result.properties, total: result.total }, 'All properties retrieved for audit');
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await prisma.payment.findMany({
        include: { owner: true }
      });
      sendSuccess(res, { payments }, 'All payments retrieved');
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
