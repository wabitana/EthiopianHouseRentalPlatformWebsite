import { Telegraf } from 'telegraf';

let botInstance: Telegraf | null = null;

export function setBotInstance(bot: Telegraf) {
  botInstance = bot;
}

export async function sendTelegramNotification(chatId: string | number, message: string) {
  if (!botInstance) {
    console.warn('⚠️ Telegram Bot instance not initialized. Notification skipped.');
    return false;
  }

  try {
    await botInstance.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Telegram notification to ${chatId}:`, error);
    return false;
  }
}

export async function notifyNewPropertyListed(propertyTitle: string, city: string, price: number, propertyId: string) {
  if (!botInstance) return;

  const channelOrGroup = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelOrGroup) return;

  const webUrl = process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:3001';
  const detailUrl = `${webUrl}/properties/${propertyId}`;

  const message = 
    `🔔 *NEW PROPERTY LISTED!* 🏠\n\n` +
    `*${propertyTitle}*\n` +
    `📍 City: ${city}\n` +
    `💰 Rent: ${price.toLocaleString()} ETB/Month\n\n` +
    `👉 [View Details on Web](${detailUrl})`;

  await sendTelegramNotification(channelOrGroup, message);
}
