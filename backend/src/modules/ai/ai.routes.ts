import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { processAiChat } from './ai.service';
import { clearConversationHistory } from './ai.memory';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// Optional authentication parser middleware
const parseUserContext = (req: AuthRequest, _res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const secret = process.env.JWT_SECRET || 'ethiopian-property-platform-jwt-secret-key-2026';
    try {
      const decoded: any = jwt.verify(token, secret);
      req.user = decoded;
    } catch (_) {}
  }
  next();
};

// POST /api/v1/ai/chat or /api/v1/chat
router.post(['/', '/chat'], parseUserContext, async (req: AuthRequest, res: Response) => {
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

    const result = await processAiChat({
      message: userPrompt.trim(),
      conversationId: conversationId || `conv-${Date.now()}`,
      context,
    });

    return res.json({
      ...result,
      text: result.message || 'I am happy to assist you with properties in Ethiopia.',
      reply: result.message || 'I am happy to assist you with properties in Ethiopia.',
    });
  } catch (error: any) {
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
  clearConversationHistory(conversationId);
  return res.json({ message: 'Conversation history cleared successfully.', conversationId });
});

export default router;
