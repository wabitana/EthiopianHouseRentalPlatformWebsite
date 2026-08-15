import { FavoriteRepository } from './favorite.repository';
import { PropertyRepository } from '../properties/property.repository';
import { NotFoundError } from '../../utils/errors';

export class FavoriteService {
  static async addFavorite(userId: string, propertyId: string) {
    const property = await PropertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }
    return FavoriteRepository.addFavorite(userId, propertyId);
  }

  static async removeFavorite(userId: string, propertyId: string) {
    await FavoriteRepository.removeFavorite(userId, propertyId);
    return { success: true, message: 'Property removed from favorites' };
  }

  static async getUserFavorites(userId: string) {
    return FavoriteRepository.getUserFavorites(userId);
  }
}
