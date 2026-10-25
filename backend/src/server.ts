import 'dotenv/config';

import app from './app';
import { connectDatabase } from './config/database';
import { startEmailReminderScheduler } from './modules/email/email.scheduler';
import { telegramService } from './modules/telegram/telegram.service';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Main Ethiopian Property Platform REST API Server running on port ${PORT}`);
  await connectDatabase();
  if (process.env.ENABLE_EMAIL_REMINDERS === 'true') {
    startEmailReminderScheduler(48); // Runs every 48 hours in production
  }
  telegramService.init(); // Initialize Telegram Bot service
});

