"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteRepository = void 0;
const database_1 = require("../../config/database");
class FavoriteRepository {
    static async addFavorite(userId, propertyId) {
        return database_1.prisma.favorite.upsert({
            where: { userId_propertyId: { userId, propertyId } },
            update: {},
            create: { userId, propertyId },
        });
    }
    static async removeFavorite(userId, propertyId) {
        await database_1.prisma.favorite.deleteMany({
            where: { userId, propertyId },
        });
    }
    static async getUserFavorites(userId) {
        const favorites = await database_1.prisma.favorite.findMany({
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
exports.FavoriteRepository = FavoriteRepository;
