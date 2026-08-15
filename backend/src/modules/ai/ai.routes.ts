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
    const secret = process.env.JWT_SECRET || 'ethiopian_house_rental_super_secret_jwt_key_2026';
    try {
      const decoded: any = jwt.verify(token, secret);
      req.user = decoded;
    } catch (_) {}
  }
  next();
};

// POST /api/v1/ai/chat
router.post('/chat', parseUserContext, async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const context = {
      userId: req.user?.id,
      userRole: req.user?.role || 'seeker',
      userName: req.user?.name,
    };

    const result = await processAiChat({
      message: message.trim(),
      conversationId: conversationId || `conv-${Date.now()}`,
      context,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('AI Chat Route Error:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your AI housing request.',
      message: 'Sorry, I am having trouble searching houses right now. Please try again.',
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
