import { Request, Response, NextFunction } from 'express';
import { RentalService } from './rental.service';
import { sendSuccess } from '../../utils/response';

export class RentalController {
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const renterId = req.user!.userId;
      const request = await RentalService.submitRequest(renterId, req.body);
      sendSuccess(res, request, 'Rental request submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const renterId = req.user!.userId;
      const requests = await RentalService.getRenterRequests(renterId);
      sendSuccess(res, requests, 'Rental requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getOwnerRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const requests = await RentalService.getOwnerRequests(ownerId);
      sendSuccess(res, requests, 'Received rental requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async respond(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const requestId = req.params.id;
      const updated = await RentalService.respondToRequest(ownerId, requestId, req.body);
      sendSuccess(res, updated, `Rental request ${req.body.status.toLowerCase()} successfully`);
    } catch (error) {
      next(error);
    }
  }
}
