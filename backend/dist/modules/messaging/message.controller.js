"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_service_1 = require("./message.service");
const response_1 = require("../../utils/response");
class MessageController {
    static async send(req, res, next) {
        try {
            const senderId = req.user.userId;
            const { receiverId, content, propertyId } = req.body;
            const message = await message_service_1.MessageService.sendMessage(senderId, receiverId, content, propertyId);
            (0, response_1.sendSuccess)(res, message, 'Message sent successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getThread(req, res, next) {
        try {
            const userId = req.user.userId;
            const otherUserId = req.params.otherUserId;
            const propertyId = req.query.propertyId;
            const thread = await message_service_1.MessageService.getThread(userId, otherUserId, propertyId);
            (0, response_1.sendSuccess)(res, thread, 'Message thread retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getConversations(req, res, next) {
        try {
            const userId = req.user.userId;
            const conversations = await message_service_1.MessageService.getUserConversations(userId);
            (0, response_1.sendSuccess)(res, conversations, 'Conversations list retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
