import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';
import { sendSuccess } from '../../utils/response';

export class MessageController {
  static async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const senderId = req.user!.userId;
      const { receiverId, content, propertyId } = req.body;
      const message = await MessageService.sendMessage(senderId, receiverId, content, propertyId);
      sendSuccess(res, message, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const otherUserId = req.params.otherUserId;
      const propertyId = req.query.propertyId as string | undefined;
      const thread = await MessageService.getThread(userId, otherUserId, propertyId);
      sendSuccess(res, thread, 'Message thread retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const conversations = await MessageService.getUserConversations(userId);
      sendSuccess(res, conversations, 'Conversations list retrieved');
    } catch (error) {
      next(error);
    }
  }
}
