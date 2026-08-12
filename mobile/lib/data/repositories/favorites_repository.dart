import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';

abstract class FavoritesRepository {
  Future<List<String>> getFavoriteIds(String userId);
  Future<void> addFavorite(String userId, String propertyId);
  Future<void> removeFavorite(String userId, String propertyId);
}

class ApiFavoritesRepository implements FavoritesRepository {
  @override
  Future<List<String>> getFavoriteIds(String userId) async {
    try {
      final res = await ApiClient.get(ApiEndpoints.favorites);
      if (res is List) {
        return res.map((item) => (item['id'] as String? ?? '')).where((id) => id.isNotEmpty).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  @override
  Future<void> addFavorite(String userId, String propertyId) async {
    try {
      await ApiClient.post(ApiEndpoints.favoriteItem(propertyId));
    } catch (_) {}
  }

  @override
  Future<void> removeFavorite(String userId, String propertyId) async {
    try {
      await ApiClient.delete(ApiEndpoints.favoriteItem(propertyId));
    } catch (_) {}
  }
}

class MockFavoritesRepository implements FavoritesRepository {
  final Map<String, Set<String>> _favorites = {
    'user_seeker_1': {'prop_1', 'prop_3'},
  };

  @override
  Future<List<String>> getFavoriteIds(String userId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return (_favorites[userId] ?? {}).toList();
  }

  @override
  Future<void> addFavorite(String userId, String propertyId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _favorites.putIfAbsent(userId, () => {}).add(propertyId);
  }

  @override
  Future<void> removeFavorite(String userId, String propertyId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _favorites[userId]?.remove(propertyId);
  }
}
