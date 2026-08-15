import { prisma } from '../../config/database';
import { Favorite } from '@prisma/client';

export class FavoriteRepository {
  static async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    return prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      update: {},
      create: { userId, propertyId },
    });
  }

  static async removeFavorite(userId: string, propertyId: string): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });
  }

  static async getUserFavorites(userId: string): Promise<any[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: true,
            owner: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.property);
  }
}
