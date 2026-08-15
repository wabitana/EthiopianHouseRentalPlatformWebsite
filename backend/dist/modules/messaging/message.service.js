"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_repository_1 = require("./message.repository");
const errors_1 = require("../../utils/errors");
class MessageService {
    static async sendMessage(senderId, receiverId, content, propertyId) {
        if (senderId === receiverId) {
            throw new errors_1.BadRequestError('Cannot send message to yourself');
        }
        return message_repository_1.MessageRepository.sendMessage({ senderId, receiverId, content, propertyId });
    }
    static async getThread(userId, otherUserId, propertyId) {
        return message_repository_1.MessageRepository.getThread(userId, otherUserId, propertyId);
    }
    static async getUserConversations(userId) {
        return message_repository_1.MessageRepository.getUserConversations(userId);
    }
}
exports.MessageService = MessageService;
