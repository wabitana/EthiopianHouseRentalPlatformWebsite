import { MessageRepository } from './message.repository';
import { BadRequestError } from '../../utils/errors';

export class MessageService {
  static async sendMessage(senderId: string, receiverId: string, content: string, propertyId?: string) {
    if (senderId === receiverId) {
      throw new BadRequestError('Cannot send message to yourself');
    }
    return MessageRepository.sendMessage({ senderId, receiverId, content, propertyId });
  }

  static async getThread(userId: string, otherUserId: string, propertyId?: string) {
    return MessageRepository.getThread(userId, otherUserId, propertyId);
  }

  static async getUserConversations(userId: string) {
    return MessageRepository.getUserConversations(userId);
  }
}
