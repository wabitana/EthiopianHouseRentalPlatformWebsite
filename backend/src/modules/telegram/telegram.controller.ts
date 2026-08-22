import { Request, Response } from 'express';
import { telegramService } from './telegram.service';

export const getTelegramStatus = async (_req: Request, res: Response) => {
  try {
    const status = telegramService.getStatus();
    return res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Telegram bot status',
      error: error.message,
    });
  }
};

export const generateLinkingCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required to generate linking code',
      });
    }

    const { code, expiresAt } = telegramService.generateLinkingCode(userId);

    return res.json({
      success: true,
      data: {
        code,
        expiresAt,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || 'EthioHouseRentalBot',
        instructions: `Send "/link ${code}" to @${process.env.TELEGRAM_BOT_USERNAME || 'EthioHouseRentalBot'} in Telegram to complete linking.`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Telegram linking code',
      error: error.message,
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const bot = telegramService.getBot();
    if (bot && req.body) {
      bot.processUpdate(req.body);
    }
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, linkUrl } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, title, message',
      });
    }

    const sent = await telegramService.sendNotificationToUser(userId, title, message, linkUrl);

    return res.json({
      success: true,
      delivered: sent,
      message: sent ? 'Telegram notification sent successfully' : 'Telegram notification not sent (user has not linked Telegram account or bot is offline)',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch Telegram notification',
      error: error.message,
    });
  }
};
