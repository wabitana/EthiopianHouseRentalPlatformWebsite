import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startEmailReminderScheduler } from './modules/email/email.scheduler';
import { telegramService } from './modules/telegram/telegram.service';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Main Ethiopian Property Platform REST API Server running on port ${PORT}`);
  startEmailReminderScheduler(48); // Runs every 48 hours (2 days)
  telegramService.init(); // Initialize Telegram Bot service
});
