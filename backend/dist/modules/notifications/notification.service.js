"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../../config/database");
class NotificationService {
    static async send(options) {
        // 1. Create database notification record
        const notification = await database_1.prisma.notification.create({
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
    static async getUserNotifications(userId) {
        return database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    static async markAsRead(notificationId) {
        return database_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    static dispatchChannel(channel, userId, title, message) {
        console.log(`🔔 [NOTIFICATION PROVIDER SIMULATION] Channel: ${channel} | User: ${userId} | Title: "${title}" | Message: "${message}"`);
    }
}
exports.NotificationService = NotificationService;
