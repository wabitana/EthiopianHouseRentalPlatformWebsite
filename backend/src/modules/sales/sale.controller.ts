import { Request, Response, NextFunction } from 'express';
import { SaleService } from './sale.service';
import { sendSuccess } from '../../utils/response';

export class SaleController {
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      const request = await SaleService.submitRequest(buyerId, req.body);
      sendSuccess(res, request, 'Purchase request submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      const requests = await SaleService.getBuyerRequests(buyerId);
      sendSuccess(res, requests, 'Purchase requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getOwnerRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const requests = await SaleService.getOwnerRequests(ownerId);
      sendSuccess(res, requests, 'Received purchase offers retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async respond(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const requestId = req.params.id;
      const updated = await SaleService.respondToRequest(ownerId, requestId, req.body);
      sendSuccess(res, updated, `Purchase request status set to ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }
}
