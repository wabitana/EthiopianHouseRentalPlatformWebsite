"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteController = void 0;
const favorite_service_1 = require("./favorite.service");
const response_1 = require("../../utils/response");
class FavoriteController {
    static async add(req, res, next) {
        try {
            const userId = req.user.userId;
            const propertyId = req.params.propertyId || req.body.propertyId;
            const fav = await favorite_service_1.FavoriteService.addFavorite(userId, propertyId);
            (0, response_1.sendSuccess)(res, fav, 'Property added to favorites', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async remove(req, res, next) {
        try {
            const userId = req.user.userId;
            const propertyId = req.params.propertyId;
            const result = await favorite_service_1.FavoriteService.removeFavorite(userId, propertyId);
            (0, response_1.sendSuccess)(res, result, 'Property removed from favorites');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyFavorites(req, res, next) {
        try {
            const userId = req.user.userId;
            const favorites = await favorite_service_1.FavoriteService.getUserFavorites(userId);
            (0, response_1.sendSuccess)(res, favorites, 'Favorite properties retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FavoriteController = FavoriteController;
