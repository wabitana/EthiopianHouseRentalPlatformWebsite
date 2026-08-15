import { Request, Response, NextFunction } from 'express';
import { PropertyService } from './property.service';
import { sendSuccess } from '../../utils/response';

export class PropertyController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const result = await PropertyService.createProperty(ownerId, req.body);
      sendSuccess(res, result, 'Property submitted for admin review successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await PropertyService.getPropertyDetails(req.params.id);
      sendSuccess(res, property, 'Property details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getPublished(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await PropertyService.getPublishedProperties(page, limit);
      sendSuccess(res, result.properties, 'Published properties retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.roles.includes('ADMIN');
      const updated = await PropertyService.updateProperty(userId, req.params.id, req.body, isAdmin);
      sendSuccess(res, updated, 'Property updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await PropertyService.updateStatus(req.params.id, req.body.status);
      sendSuccess(res, updated, 'Property status updated by admin');
    } catch (error) {
      next(error);
    }
  }
}
