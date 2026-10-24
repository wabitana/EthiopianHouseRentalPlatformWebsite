import 'dotenv/config';

import app from './app';
import { startEmailReminderScheduler } from './modules/email/email.scheduler';
import { initTelegramBot } from './bot';

const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Main Ethiopian Property Platform REST API Server running on port ${PORT} (0.0.0.0)`);
  startEmailReminderScheduler(48); // Runs every 48 hours (2 days)
  initTelegramBot();
});
