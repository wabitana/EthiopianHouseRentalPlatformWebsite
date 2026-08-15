import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from './favorite.service';
import { sendSuccess } from '../../utils/response';

export class FavoriteController {
  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const propertyId = req.params.propertyId || req.body.propertyId;
      const fav = await FavoriteService.addFavorite(userId, propertyId);
      sendSuccess(res, fav, 'Property added to favorites', 201);
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const propertyId = req.params.propertyId;
      const result = await FavoriteService.removeFavorite(userId, propertyId);
      sendSuccess(res, result, 'Property removed from favorites');
    } catch (error) {
      next(error);
    }
  }

  static async getMyFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const favorites = await FavoriteService.getUserFavorites(userId);
      sendSuccess(res, favorites, 'Favorite properties retrieved');
    } catch (error) {
      next(error);
    }
  }
}
