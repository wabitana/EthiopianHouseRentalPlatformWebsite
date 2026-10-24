import { Router } from 'express';
import {
  getTelegramStatus,
  generateLinkingCode,
  handleWebhook,
  sendNotification,
} from './telegram.controller';

const router = Router();

router.get('/status', getTelegramStatus);
router.post('/link-code', generateLinkingCode);
router.post('/webhook', handleWebhook);
router.post('/notify', sendNotification);

export default router;
