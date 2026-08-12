abstract class FavoritesRepository {
  Future<List<String>> getFavoriteIds(String userId);
  Future<void> addFavorite(String userId, String propertyId);
  Future<void> removeFavorite(String userId, String propertyId);
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
