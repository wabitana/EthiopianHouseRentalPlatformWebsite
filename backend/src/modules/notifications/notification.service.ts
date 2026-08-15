import { prisma } from '../../config/database';

export interface SendNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type?: 'SYSTEM' | 'INQUIRY' | 'PROPERTY' | 'RENTAL' | 'SALE' | 'SUBSCRIPTION';
  channels?: ('SMS' | 'EMAIL' | 'TELEGRAM' | 'PUSH')[];
}

export class NotificationService {
  static async send(options: SendNotificationOptions) {
    // 1. Create database notification record
    const notification = await prisma.notification.create({
      data: {
        userId: options.userId,
        title: options.title,
        message: options.message,
        type: options.type || 'SYSTEM',
      },
    });

    // 2. Dispatch simulated channel abstractions
    const channels = options.channels || ['PUSH', 'EMAIL'];
    for (const channel of channels) {
      this.dispatchChannel(channel, options.userId, options.title, options.message);
    }

    return notification;
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  private static dispatchChannel(channel: string, userId: string, title: string, message: string) {
    console.log(`🔔 [NOTIFICATION PROVIDER SIMULATION] Channel: ${channel} | User: ${userId} | Title: "${title}" | Message: "${message}"`);
  }
}
