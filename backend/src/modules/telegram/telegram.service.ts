const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma';

function ensureValidHttpsUrl(rawUrl?: string): string {
  const fallback = 'https://t.me/EthioHouseRentalBot';
  if (!rawUrl || rawUrl.trim() === '') return fallback;

  let target = rawUrl.trim();
  if (
    target.startsWith('http://localhost') ||
    target.startsWith('http://127.0.0.1') ||
    target.startsWith('http://10.0.2.2')
  ) {
    // If FRONTEND_URL is local, fallback to public Telegram Bot link or domain to avoid Telegram 400 Bad Request
    return fallback;
  }
  if (target.startsWith('http://')) {
    return target.replace('http://', 'https://');
  }
  if (!target.startsWith('https://')) {
    return `https://${target}`;
  }
  return target;
}

export class TelegramService {
  private bot: any = null;
  private botUsername: string = process.env.TELEGRAM_BOT_USERNAME || 'EthioHouseRentalBot';
  // Store 6-digit OTP codes for account linking: code -> { userId, expiresAt }
  private otpStore = new Map<string, { userId: string; expiresAt: number }>();

  public init() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token || token.trim() === '' || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
      console.log('⚠️ [TelegramBot] TELEGRAM_BOT_TOKEN is not configured in .env. Bot polling disabled.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });

      // Handle polling errors (like temporary network glitch or 409 conflict on dev reload)
      this.bot.on('polling_error', (error: any) => {
        const msg = error?.message || String(error);
        if (msg.includes('409') || msg.includes('Conflict')) {
          console.log(`⚠️ [TelegramBot] Notice: Polling conflict for @${this.botUsername} (another process was active).`);
        } else {
          console.log(`⚠️ [TelegramBot] Polling notice:`, msg);
        }
      });

      console.log(`🤖 [TelegramBot] Connected & polling initialized successfully for @${this.botUsername}`);

      process.once('SIGINT', () => this.stop());
      process.once('SIGTERM', () => this.stop());

      this.registerCommandHandlers();
      this.registerCallbackQueryHandlers();
      this.registerMessageHandler();
    } catch (error) {
      console.error('❌ [TelegramBot] Failed to start Telegram Bot:', error);
    }
  }

  public stop() {
    if (this.bot) {
      try {
        this.bot.stopPolling();
        console.log(`🤖 [TelegramBot] Polling stopped gracefully for @${this.botUsername}`);
      } catch (_) {}
    }
  }

  public getBot(): any {
    return this.bot;
  }

  public getStatus() {
    return {
      active: !!this.bot,
      botUsername: this.botUsername,
      polling: !!this.bot,
    };
  }

  /**
   * Generate a 6-digit OTP code to pair a user account with Telegram
   */
  public generateLinkingCode(userId: string): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    this.otpStore.set(code, { userId, expiresAt: expiresAt.getTime() });
    return { code, expiresAt };
  }

  /**
   * Pair Telegram chat ID with user using valid code
   */
  public async linkTelegramAccount(chatId: string | number, code: string): Promise<{ success: boolean; message: string; user?: any }> {
    const record = this.otpStore.get(code);

    if (!record) {
      return { success: false, message: 'Invalid or expired OTP code. Please request a new code from the web/mobile platform.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(code);
      return { success: false, message: 'OTP code has expired. Please request a new code.' };
    }

    try {
      const user = await prisma.user.update({
        where: { id: record.userId },
        data: { telegramChatId: chatId.toString() } as any,
      });

      this.otpStore.delete(code);
      return { success: true, message: `Account successfully linked to user **${user.name}** (${user.email})!`, user };
    } catch (err: any) {
      console.error('Error linking Telegram account:', err);
      return { success: false, message: 'Failed to link account. The Telegram ID might already be linked to another account.' };
    }
  }

  /**
   * Dispatch system notification to user's Telegram Chat ID
   */
  public async sendNotificationToUser(userId: string, title: string, message: string, linkUrl?: string): Promise<boolean> {
    if (!this.bot) return false;

    try {
      const user: any = await prisma.user.findUnique({
        where: { id: userId },
        select: { telegramChatId: true, name: true } as any,
      });

      if (!user || !user.telegramChatId) return false;

      const formattedText = `🔔 *${title}*\n\nHi ${user.name},\n${message}${linkUrl ? `\n\n🔗 [View Details](${ensureValidHttpsUrl(linkUrl)})` : ''}`;

      await this.bot.sendMessage(user.telegramChatId, formattedText, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });

      return true;
    } catch (error) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, error);
      return false;
    }
  }

  private registerCommandHandlers() {
    if (!this.bot) return;

    // /start command
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'Valued User';

      const welcomeMessage =
        `🏠 *Welcome to Ethiopian House Rental Platform!* 🇪🇹\n` +
        `ሰላም ${firstName}! 🇪🇹 የቤት ኪራይ እና ሽያጭ ቦት እንኳን ደህና መጡ! \n\n` +
        `Find your dream rental home, apartment, villa, or commercial space across Addis Ababa & regional cities in Ethiopia.\n\n` +
        `*Quick Commands:*\n` +
        `• /houses - Browse available rental & sale properties\n` +
        `• /search <location> - Search by area (e.g. Bole, Kazanchis, CMC)\n` +
        `• /link <code> - Pair your website account with Telegram\n` +
        `• /post - Instructions for landlords to list property\n` +
        `• /help - Support and guidance`;

      const webAppUrl = ensureValidHttpsUrl(process.env.FRONTEND_URL);

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🏠 Browse Houses', callback_data: 'cmd_houses' },
            { text: '🔍 Search Area', callback_data: 'cmd_search_prompt' },
          ],
          [
            { text: '🔗 Link Account', callback_data: 'cmd_link_prompt' },
            { text: '➕ Post Property', callback_data: 'cmd_post_info' },
          ],
          [
            { text: '🌐 Open Web Platform', url: webAppUrl },
            { text: '📞 Customer Support', callback_data: 'cmd_support' },
          ],
        ],
      };

      await this.bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    });

    // /houses command
    this.bot.onText(/\/houses/, async (msg: any) => {
      await this.handleBrowseHouses(msg.chat.id);
    });

    // /search command (e.g. /search Bole)
    this.bot.onText(/\/search(?:\s+(.+))?/, async (msg: any, match: any) => {
      const query = match ? match[1] : null;
      if (!query || query.trim() === '') {
        await this.bot.sendMessage(
          msg.chat.id,
          '🔍 Please specify a location or area keyword.\n\nExample: `/search Bole` or `/search Kazanchis`',
          { parse_mode: 'Markdown' }
        );
        return;
      }
      await this.handleSearchHouses(msg.chat.id, query.trim());
    });

    // /link <code> command
    this.bot.onText(/\/link(?:\s+(.+))?/, async (msg: any, match: any) => {
      const code = match ? match[1] : null;
      if (!code || code.trim() === '') {
        await this.bot.sendMessage(
          msg.chat.id,
          '🔗 *Account Linking*\n\nTo link your Telegram account to your profile:\n' +
          '1. Log in to your Ethiopian House Rental account on Web or Mobile app.\n' +
          '2. Go to Profile Settings -> Telegram Integration.\n' +
          '3. Generate a 6-digit OTP code.\n' +
          '4. Send `/link 123456` here in chat.',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const result = await this.linkTelegramAccount(msg.chat.id, code.trim());
      await this.bot.sendMessage(msg.chat.id, result.message, { parse_mode: 'Markdown' });
    });

    // /post command
    this.bot.onText(/\/post/, async (msg: any) => {
      await this.handlePostInfo(msg.chat.id);
    });

    // /help command
    this.bot.onText(/\/help/, async (msg: any) => {
      await this.handleSupportInfo(msg.chat.id);
    });
  }

  private registerCallbackQueryHandlers() {
    if (!this.bot) return;

    this.bot.on('callback_query', async (query: any) => {
      const chatId = query.message?.chat?.id;
      const data = query.data;

      if (!chatId || !data) return;

      try {
        await this.bot.answerCallbackQuery(query.id);
      } catch (_) {}

      if (data === 'cmd_houses') {
        await this.handleBrowseHouses(chatId);
      } else if (data === 'cmd_search_prompt') {
        await this.bot.sendMessage(
          chatId,
          '🔍 *Search Properties*\n\nReply with `/search <location>` to find properties.\n\nExample:\n`/search Bole`\n`/search Kazanchis`\n`/search 3 bedrooms`',
          { parse_mode: 'Markdown' }
        );
      } else if (data === 'cmd_link_prompt') {
        await this.bot.sendMessage(
          chatId,
          '🔗 *Link Account*\n\nSend `/link <your-6-digit-otp>` to connect your platform profile for instant Telegram alerts.',
          { parse_mode: 'Markdown' }
        );
      } else if (data === 'cmd_post_info') {
        await this.handlePostInfo(chatId);
      } else if (data === 'cmd_support') {
        await this.handleSupportInfo(chatId);
      }
    });
  }

  private registerMessageHandler() {
    if (!this.bot) return;

    // Handle plain text queries when user types location directly
    this.bot.on('message', async (msg: any) => {
      if (!msg.text || msg.text.startsWith('/')) return;

      const text = msg.text.trim();
      if (text.length > 2 && text.length < 30) {
        await this.handleSearchHouses(msg.chat.id, text);
      }
    });
  }

  private async handleBrowseHouses(chatId: number | string) {
    if (!this.bot) return;

    try {
      const properties = await prisma.property.findMany({
        where: {
          availability: true,
          listingStatus: 'active',
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      if (properties.length === 0) {
        await this.bot.sendMessage(
          chatId,
          '🏠 No active house listings found right now. Check back soon or visit our web platform!',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      await this.bot.sendMessage(chatId, `📍 *Latest Active Property Listings (${properties.length}):*`, { parse_mode: 'Markdown' });

      for (const prop of properties) {
        const title = prop.title;
        const price = prop.price || prop.rentPrice || prop.salePrice || 0;
        const formattedPrice = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(price);
        const typeBadge = prop.transactionType === 'SALE' ? '🏷️ FOR SALE' : '🔑 FOR RENT';
        const location = `${prop.area}, ${prop.city}`;
        const specs = `🛏️ ${prop.rooms} Beds | 🚿 ${prop.bathrooms} Baths | 📐 ${prop.rentalPeriod || 'Monthly'}`;

        let imageUrl = '';
        try {
          const parsedImages = JSON.parse(prop.images || '[]');
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            imageUrl = parsedImages[0];
          }
        } catch {
          imageUrl = '';
        }

        const messageText =
          `*${title}*\n` +
          `${typeBadge} • *${formattedPrice}*\n` +
          `📍 ${location}\n` +
          `${specs}\n\n` +
          `📞 *Provider:* ${prop.providerName} (${prop.providerPhone})`;

        const webUrl = ensureValidHttpsUrl(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/properties/${prop.id}` : '');

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🌐 View Property Details', url: webUrl },
              { text: '🔍 Search More Houses', callback_data: 'cmd_houses' },
            ],
          ],
        };

        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
          try {
            await this.bot.sendPhoto(chatId, imageUrl, {
              caption: messageText,
              parse_mode: 'Markdown',
              reply_markup: inlineKeyboard,
            });
            continue;
          } catch (e) {
            // Fallback to text if image sending fails
          }
        }

        await this.bot.sendMessage(chatId, messageText, {
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard,
        });
      }
    } catch (error) {
      console.error('Error in handleBrowseHouses:', error);
      await this.bot.sendMessage(chatId, '❌ Unable to fetch listings at the moment. Please try again later.');
    }
  }

  private async handleSearchHouses(chatId: number | string, keyword: string) {
    if (!this.bot) return;

    try {
      const properties = await prisma.property.findMany({
        where: {
          availability: true,
          listingStatus: 'active',
          OR: [
            { area: { contains: keyword, mode: 'insensitive' } },
            { city: { contains: keyword, mode: 'insensitive' } },
            { neighborhood: { contains: keyword, mode: 'insensitive' } },
            { title: { contains: keyword, mode: 'insensitive' } },
            { propertyType: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      if (properties.length === 0) {
        await this.bot.sendMessage(
          chatId,
          `🔍 No active properties found matching "*${keyword}*". Try searching for areas like *Bole*, *Kazanchis*, *CMC*, or *Sarbet*.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      await this.bot.sendMessage(
        chatId,
        `🎯 *Found ${properties.length} active listings matching "${keyword}":*`,
        { parse_mode: 'Markdown' }
      );

      for (const prop of properties) {
        const title = prop.title;
        const price = prop.price || prop.rentPrice || prop.salePrice || 0;
        const formattedPrice = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(price);
        const typeBadge = prop.transactionType === 'SALE' ? '🏷️ FOR SALE' : '🔑 FOR RENT';
        const location = `${prop.area}, ${prop.city}`;

        const messageText =
          `*${title}*\n` +
          `${typeBadge} • *${formattedPrice}*\n` +
          `📍 ${location}\n` +
          `🛏️ ${prop.rooms} Beds | 🚿 ${prop.bathrooms} Baths\n\n` +
          `📞 *Provider:* ${prop.providerName} (${prop.providerPhone})`;

        const webUrl = ensureValidHttpsUrl(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/properties/${prop.id}` : '');

        await this.bot.sendMessage(chatId, messageText, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🌐 View Full Details', url: webUrl }]],
          },
        });
      }
    } catch (error) {
      console.error('Error searching houses:', error);
      await this.bot.sendMessage(chatId, '❌ Error performing property search.');
    }
  }

  private async handlePostInfo(chatId: number | string) {
    if (!this.bot) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const message =
      `➕ *List Your Property on Ethiopian House Rental Platform*\n\n` +
      `Are you a house owner or registered Delala agent?\n` +
      `You can list your house, apartment, villa, or commercial space to thousands of house seekers across Ethiopia!\n\n` +
      `*Steps to Post:*\n` +
      `1. Open our Web Portal or Mobile App.\n` +
      `2. Sign up or Log in as a *House Provider*.\n` +
      `3. Click *Post Property*, upload photos, set price & amenities.\n` +
      `4. Our Admin team will review & publish your property!\n\n` +
      `🔗 [Click here to Post Property on Web](${ensureValidHttpsUrl(`${frontendUrl}/provider/create`)})`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  private async handleSupportInfo(chatId: number | string) {
    if (!this.bot) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const message =
      `📞 *Ethiopian House Rental Customer Support*\n\n` +
      `• *Office Location:* Addis Ababa, Ethiopia\n` +
      `• *Support Phone:* +251 911 000 000 / +251 922 111 222\n` +
      `• *Email:* support@delala.com\n` +
      `• *Website:* [${ensureValidHttpsUrl(frontendUrl)}](${ensureValidHttpsUrl(frontendUrl)})\n\n` +
      `We operate 24/7 to assist house seekers, providers, and regional agents. Feel free to contact us anytime!`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }
}

export const telegramService = new TelegramService();
