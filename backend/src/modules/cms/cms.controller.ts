import { Request, Response, NextFunction } from 'express';
import { CmsService } from './cms.service';
import { sendSuccess } from '../../utils/response';

export class CmsController {
  static async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await CmsService.getConfig();
      sendSuccess(res, { config }, 'CMS config retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value } = req.body;
      const updated = await CmsService.updateConfig(key, value);
      sendSuccess(res, { config: updated }, 'CMS config updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
