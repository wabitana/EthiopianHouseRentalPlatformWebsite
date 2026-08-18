import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../data/repositories/favorites_repository.dart';

class FavoritesProvider extends ChangeNotifier {
  static const String _storageKey = 'saved_favorites_list_v1';
  final FavoritesRepository _favoritesRepository;

  final Set<String> _favoritePropertyIds = {};
  bool _isLoading = false;

  FavoritesProvider({FavoritesRepository? favoritesRepository})
      : _favoritesRepository = favoritesRepository ?? ApiFavoritesRepository() {
    loadFavorites(null);
  }

  Set<String> get favoritePropertyIds => _favoritePropertyIds;
  bool get isLoading => _isLoading;

  bool isFavorite(String propertyId) => _favoritePropertyIds.contains(propertyId);

  Future<void> loadFavorites(String? userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final localList = prefs.getStringList(_storageKey);

      if (localList != null) {
        _favoritePropertyIds.addAll(localList);
      } else {
        // Seed initial demo favorites if first run
        _favoritePropertyIds.addAll(['prop_1', 'prop_3']);
        await prefs.setStringList(_storageKey, _favoritePropertyIds.toList());
      }

      if (userId != null && userId.isNotEmpty) {
        final apiIds = await _favoritesRepository.getFavoriteIds(userId);
        if (apiIds.isNotEmpty) {
          _favoritePropertyIds.addAll(apiIds);
          await prefs.setStringList(_storageKey, _favoritePropertyIds.toList());
        }
      }
    } catch (e) {
      debugPrint('Error loading favorites: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleFavorite(String? userId, String propertyId) async {
    if (_favoritePropertyIds.contains(propertyId)) {
      _favoritePropertyIds.remove(propertyId);
      if (userId != null && userId.isNotEmpty) {
        await _favoritesRepository.removeFavorite(userId, propertyId);
      }
    } else {
      _favoritePropertyIds.add(propertyId);
      if (userId != null && userId.isNotEmpty) {
        await _favoritesRepository.addFavorite(userId, propertyId);
      }
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_storageKey, _favoritePropertyIds.toList());
    } catch (_) {}

    notifyListeners();
  }
}
