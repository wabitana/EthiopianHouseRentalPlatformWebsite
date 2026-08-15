import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from './subscription.service';
import { sendSuccess } from '../../utils/response';

export class SubscriptionController {
  static async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await SubscriptionService.createPlan(req.body);
      sendSuccess(res, plan, 'Subscription plan created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await SubscriptionService.getActivePlans();
      sendSuccess(res, plans, 'Active subscription plans retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const sub = await SubscriptionService.getOwnerActiveSubscription(ownerId);
      sendSuccess(res, sub, 'Active subscription details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const userEmail = req.user!.email;
      const result = await SubscriptionService.subscribeOwner(ownerId, userEmail, userEmail, req.body);
      sendSuccess(res, result, 'Subscription order initialized', 201);
    } catch (error) {
      next(error);
    }
  }

  static async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const txRef = req.body.txRef || (req.query.tx_ref as string);
      const activated = await SubscriptionService.confirmPaymentAndActivate(txRef);
      sendSuccess(res, activated, 'Payment confirmed and subscription activated');
    } catch (error) {
      next(error);
    }
  }
}
