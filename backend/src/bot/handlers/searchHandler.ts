import { Context, Markup } from 'telegraf';
import { prisma } from '../../config/database';

export async function handleStartCommand(ctx: Context) {
  const welcomeText = 
    `🏢 *Welcome to Ethiopian House Rental (Delala) Bot!* 🇪🇹\n\n` +
    `Find apartments, villas, and houses for rent across Ethiopia, or manage your property inquiries right from Telegram.\n\n` +
    `*Available Commands:*\n` +
    `• /search - Search active rental listings\n` +
    `• /latest - View newest house listings\n` +
    `• /help - Get assistance & contact support`;

  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:3001';

  return ctx.replyWithMarkdownV2(
    welcomeText.replace(/([!.-])/g, '\\$1'),
    Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Search Houses', 'SEARCH_CITY')],
      [Markup.button.callback('✨ Newest Listings', 'LATEST_PROPERTIES')],
      [Markup.button.url('🌐 Open Web Marketplace', webAppUrl)]
    ])
  );
}

export async function handleCitySelection(ctx: Context) {
  const text = '📍 *Select a City to find house rentals:*';
  const cities = ['Addis Ababa', 'Bishoftu', 'Hawassa', 'Adama', 'Dire Dawa'];

  const buttons = cities.map((city) =>
    [Markup.button.callback(`🏙️ ${city}`, `SEARCH_CITY_${city.toUpperCase().replace(/\s+/g, '_')}`)]
  );

  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
    return ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  }

  return ctx.replyWithMarkdown(text, Markup.inlineKeyboard(buttons));
}

export async function handleCityFilter(ctx: Context, cityName: string) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();

  const formattedCity = cityName.replace(/_/g, ' ');

  try {
    const properties = await prisma.property.findMany({
      where: {
        city: { contains: formattedCity, mode: 'insensitive' },
        listingStatus: 'active',
        availability: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (properties.length === 0) {
      return ctx.reply(
        `❌ No active house listings found in ${formattedCity} right now.\nCheck back soon or try /search for another city!`
      );
    }

    await ctx.reply(`🔍 *Found ${properties.length} rental properties in ${formattedCity}:*`, { parse_mode: 'Markdown' });

    for (const prop of properties) {
      const priceText = `${prop.price.toLocaleString()} ETB/${prop.rentalPeriod || 'Month'}`;
      let images: string[] = [];
      try {
        images = JSON.parse(prop.images || '[]');
      } catch {
        images = [];
      }

      const caption = 
        `🏠 *${prop.title}*\n` +
        `📍 ${prop.area || ''}, ${prop.city}\n` +
        `💰 *Price:* ${priceText}\n` +
        `🛏️ ${prop.rooms} Rooms | 🛁 ${prop.bathrooms} Baths\n` +
        `👤 *Landlord:* ${prop.providerName} (${prop.providerPhone})\n\n` +
        `📝 ${prop.description.substring(0, 150)}...`;

      const webUrl = process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:3001';
      const detailUrl = `${webUrl}/properties/${prop.id}`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('🔗 View Full Details', detailUrl)],
        [Markup.button.callback('📞 Contact Landlord', `CONTACT_${prop.id}`)]
      ]);

      if (images.length > 0 && images[0].startsWith('http')) {
        await ctx.replyWithPhoto(images[0], {
          caption,
          parse_mode: 'Markdown',
          ...keyboard
        });
      } else {
        await ctx.reply(caption, {
          parse_mode: 'Markdown',
          ...keyboard
        });
      }
    }
  } catch (error) {
    console.error('Telegram search error:', error);
    await ctx.reply('⚠️ Error fetching properties. Please try again.');
  }
}

export async function handleLatestProperties(ctx: Context) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();

  try {
    const properties = await prisma.property.findMany({
      where: { listingStatus: 'active', availability: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (properties.length === 0) {
      return ctx.reply('❌ No active house listings available at the moment.');
    }

    await ctx.reply('✨ *Latest Rental Listings in Ethiopia:*', { parse_mode: 'Markdown' });

    for (const prop of properties) {
      const priceText = `${prop.price.toLocaleString()} ETB/${prop.rentalPeriod || 'Month'}`;
      const caption = 
        `🏠 *${prop.title}*\n` +
        `📍 ${prop.area}, ${prop.city}\n` +
        `💰 *Price:* ${priceText}\n` +
        `🛏️ ${prop.rooms} Rooms | 🛁 ${prop.bathrooms} Baths\n\n` +
        `👤 Landlord: ${prop.providerName}`;

      const webUrl = process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:3001';
      const detailUrl = `${webUrl}/properties/${prop.id}`;

      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('🔗 View Property', detailUrl)]
        ])
      });
    }
  } catch (error) {
    console.error('Error fetching latest properties for bot:', error);
    await ctx.reply('⚠️ Error loading latest properties.');
  }
}
