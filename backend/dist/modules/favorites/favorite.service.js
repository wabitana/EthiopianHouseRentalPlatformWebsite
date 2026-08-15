"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
const favorite_repository_1 = require("./favorite.repository");
const property_repository_1 = require("../properties/property.repository");
const errors_1 = require("../../utils/errors");
class FavoriteService {
    static async addFavorite(userId, propertyId) {
        const property = await property_repository_1.PropertyRepository.findById(propertyId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        return favorite_repository_1.FavoriteRepository.addFavorite(userId, propertyId);
    }
    static async removeFavorite(userId, propertyId) {
        await favorite_repository_1.FavoriteRepository.removeFavorite(userId, propertyId);
        return { success: true, message: 'Property removed from favorites' };
    }
    static async getUserFavorites(userId) {
        return favorite_repository_1.FavoriteRepository.getUserFavorites(userId);
    }
}
exports.FavoriteService = FavoriteService;
