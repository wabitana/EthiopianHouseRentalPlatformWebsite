import { Telegraf } from 'telegraf';
import {
  handleStartCommand,
  handleCitySelection,
  handleCityFilter,
  handleLatestProperties
} from './handlers/searchHandler';
import { setBotInstance } from './services/botNotificationService';

let bot: Telegraf | null = null;

export function initTelegramBot(): Telegraf | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log('ℹ️ TELEGRAM_BOT_TOKEN not provided in .env - Telegram Bot mode disabled.');
    return null;
  }

  try {
    bot = new Telegraf(token);
    setBotInstance(bot);

    // Bot Commands
    bot.start((ctx) => handleStartCommand(ctx));
    bot.command('search', (ctx) => handleCitySelection(ctx));
    bot.command('latest', (ctx) => handleLatestProperties(ctx));
    bot.command('help', (ctx) => {
      return ctx.replyWithMarkdown(
        `🛠️ *Ethiopian House Rental Bot Help Center*\n\n` +
        `• /search - Search properties by city\n` +
        `• /latest - Browse recent rental listings\n` +
        `• Contact Support: support@ethiopianhouserental.et\n` +
        `• Phone: +251 94 634 0709`
      );
    });

    // Callback Query Actions
    bot.action('SEARCH_CITY', (ctx) => handleCitySelection(ctx));
    bot.action('LATEST_PROPERTIES', (ctx) => handleLatestProperties(ctx));

    // Handle city button callbacks like SEARCH_CITY_ADDIS_ABABA
    bot.action(/^SEARCH_CITY_(.+)$/, (ctx) => {
      const cityName = ctx.match[1];
      return handleCityFilter(ctx, cityName);
    });

    bot.action(/^CONTACT_(.+)$/, (ctx) => {
      ctx.answerCbQuery();
      return ctx.reply('📞 Contact request registered! Landlord phone details are displayed in the property card.');
    });

    // Launch Bot asynchronously (polling in dev)
    bot.launch()
      .then(() => console.log('🤖 Telegram Bot launched successfully and listening for commands!'))
      .catch((err) => console.error('❌ Failed to launch Telegram Bot:', err));

    // Enable graceful stop
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));

    return bot;
  } catch (error) {
    console.error('❌ Error initializing Telegram Bot:', error);
    return null;
  }
}
