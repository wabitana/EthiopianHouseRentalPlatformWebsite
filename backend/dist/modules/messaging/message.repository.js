"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const database_1 = require("../../config/database");
class MessageRepository {
    static async sendMessage(data) {
        return database_1.prisma.message.create({
            data,
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
    }
    static async getThread(user1Id, user2Id, propertyId) {
        return database_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id },
                ],
                ...(propertyId && { propertyId }),
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            },
        });
    }
    static async getUserConversations(userId) {
        const messages = await database_1.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true } },
                property: { select: { id: true, title: true } },
            },
        });
        return messages;
    }
}
exports.MessageRepository = MessageRepository;
