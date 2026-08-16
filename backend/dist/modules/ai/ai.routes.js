"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ai_service_1 = require("./ai.service");
const ai_memory_1 = require("./ai.memory");
const router = (0, express_1.Router)();
// Optional authentication parser middleware
const parseUserContext = (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        const secret = process.env.JWT_SECRET || 'ethiopian-property-platform-jwt-secret-key-2026';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            req.user = decoded;
        }
        catch (_) { }
    }
    next();
};
// POST /api/v1/ai/chat (Supports single message & web messages array format)
router.post('/chat', parseUserContext, async (req, res) => {
    try {
        const { message, messages, conversationId } = req.body;
        let userPrompt = message;
        if (!userPrompt && Array.isArray(messages) && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            userPrompt = lastMsg.text || lastMsg.content;
        }
        if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
            return res.status(400).json({ error: 'Message text is required.' });
        }
        const context = {
            userId: req.user?.id,
            userRole: req.user?.role || 'seeker',
            userName: req.user?.name,
        };
        const result = await (0, ai_service_1.processAiChat)({
            message: userPrompt.trim(),
            conversationId: conversationId || `conv-${Date.now()}`,
            context,
        });
        return res.json({
            ...result,
            text: result.message || 'I am happy to assist you with properties in Ethiopia.',
            reply: result.message || 'I am happy to assist you with properties in Ethiopia.',
        });
    }
    catch (error) {
        console.error('AI Chat Route Error:', error);
        return res.status(500).json({
            error: 'An error occurred while processing your AI request.',
            message: 'Sorry, I am having trouble processing your request right now. Please try again.',
            reply: 'Sorry, I am having trouble processing your request right now. Please try again.',
            text: 'Sorry, I am having trouble processing your request right now. Please try again.',
            properties: [],
            actions: [],
        });
    }
});
// DELETE /api/v1/ai/chat/:conversationId - Clear history
router.delete('/chat/:conversationId', (_req, res) => {
    const { conversationId } = _req.params;
    (0, ai_memory_1.clearConversationHistory)(conversationId);
    return res.json({ message: 'Conversation history cleared successfully.', conversationId });
});
exports.default = router;
