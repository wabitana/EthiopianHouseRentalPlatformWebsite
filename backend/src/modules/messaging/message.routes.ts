import { Router } from 'express';
import { MessageController } from './message.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', MessageController.send);
router.get('/conversations', MessageController.getConversations);
router.get('/thread/:otherUserId', MessageController.getThread);

export default router;
