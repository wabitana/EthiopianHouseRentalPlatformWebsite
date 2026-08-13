import 'package:flutter/material.dart';
import '../../../data/repositories/favorites_repository.dart';

class FavoritesProvider extends ChangeNotifier {
  final FavoritesRepository _favoritesRepository;

  final Set<String> _favoritePropertyIds = {};
  bool _isLoading = false;

  FavoritesProvider({FavoritesRepository? favoritesRepository})
      : _favoritesRepository = favoritesRepository ?? ApiFavoritesRepository();

  Set<String> get favoritePropertyIds => _favoritePropertyIds;
  bool get isLoading => _isLoading;

  bool isFavorite(String propertyId) => _favoritePropertyIds.contains(propertyId);

  Future<void> loadFavorites(String userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final ids = await _favoritesRepository.getFavoriteIds(userId);
      if (ids.isNotEmpty) {
        _favoritePropertyIds.clear();
        _favoritePropertyIds.addAll(ids);
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> toggleFavorite(String userId, String propertyId) async {
    if (_favoritePropertyIds.contains(propertyId)) {
      _favoritePropertyIds.remove(propertyId);
      await _favoritesRepository.removeFavorite(userId, propertyId);
    } else {
      _favoritePropertyIds.add(propertyId);
      await _favoritesRepository.addFavorite(userId, propertyId);
    }
    notifyListeners();
  }
}
