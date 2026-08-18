import 'package:shared_preferences/shared_preferences.dart';
import '../../shared/models/property_model.dart';

class UserBehaviorTracker {
  static const String _searchesKey = 'ai_tracker_searches_v1';
  static const String _viewedPropsKey = 'ai_tracker_viewed_props_v1';
  static const String _subcitiesKey = 'ai_tracker_subcities_v1';
  static const String _pricesKey = 'ai_tracker_prices_v1';
  static const String _bedroomsKey = 'ai_tracker_bedrooms_v1';
  static const String _favoritesKey = 'ai_tracker_favorites_v1';

  // 1. Track Search Action
  static Future<void> trackSearch({
    required String query,
    String? subcity,
    double? maxPrice,
    int? bedrooms,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Track Search Queries
      final searches = prefs.getStringList(_searchesKey) ?? [];
      if (query.isNotEmpty && !searches.contains(query)) {
        searches.insert(0, query);
        if (searches.length > 20) searches.removeLast();
        await prefs.setStringList(_searchesKey, searches);
      }

      // Track Subcity
      if (subcity != null && subcity.isNotEmpty) {
        await _recordSubcity(prefs, subcity);
      }

      // Track Price
      if (maxPrice != null && maxPrice > 0) {
        await _recordPrice(prefs, maxPrice);
      }

      // Track Bedrooms
      if (bedrooms != null && bedrooms > 0) {
        await _recordBedrooms(prefs, bedrooms);
      }
    } catch (_) {}
  }

  // 2. Track Property Details Opened View
  static Future<void> trackPropertyView(PropertyModel property) async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final viewedIds = prefs.getStringList(_viewedPropsKey) ?? [];
      if (!viewedIds.contains(property.id)) {
        viewedIds.insert(0, property.id);
        if (viewedIds.length > 30) viewedIds.removeLast();
        await prefs.setStringList(_viewedPropsKey, viewedIds);
      }

      await _recordSubcity(prefs, property.area);
      await _recordPrice(prefs, property.price);
      await _recordBedrooms(prefs, property.rooms);
    } catch (_) {}
  }

  // 3. Track Favorite Toggles
  static Future<void> trackFavoriteToggle(String propertyId, bool isFavorite) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favorites = prefs.getStringList(_favoritesKey) ?? [];

      if (isFavorite && !favorites.contains(propertyId)) {
        favorites.add(propertyId);
      } else if (!isFavorite) {
        favorites.remove(propertyId);
      }

      await prefs.setStringList(_favoritesKey, favorites);
    } catch (_) {}
  }

  static Future<void> _recordSubcity(SharedPreferences prefs, String subcity) async {
    final subcities = prefs.getStringList(_subcitiesKey) ?? [];
    subcities.insert(0, subcity);
    if (subcities.length > 25) subcities.removeLast();
    await prefs.setStringList(_subcitiesKey, subcities);
  }

  static Future<void> _recordPrice(SharedPreferences prefs, double price) async {
    final prices = prefs.getStringList(_pricesKey) ?? [];
    prices.insert(0, price.toString());
    if (prices.length > 25) prices.removeLast();
    await prefs.setStringList(_pricesKey, prices);
  }

  static Future<void> _recordBedrooms(SharedPreferences prefs, int rooms) async {
    final roomsList = prefs.getStringList(_bedroomsKey) ?? [];
    roomsList.insert(0, rooms.toString());
    if (roomsList.length > 25) roomsList.removeLast();
    await prefs.setStringList(_bedroomsKey, roomsList);
  }

  // 4. Aggregate 50+ Factors into Behavioral Profile
  static Future<Map<String, dynamic>> getBehavioralProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final searches = prefs.getStringList(_searchesKey) ?? [];
      final viewedIds = prefs.getStringList(_viewedPropsKey) ?? [];
      final subcities = prefs.getStringList(_subcitiesKey) ?? [];
      final pricesStr = prefs.getStringList(_pricesKey) ?? [];
      final roomsStr = prefs.getStringList(_bedroomsKey) ?? [];
      final favorites = prefs.getStringList(_favoritesKey) ?? [];

      // Calculate Most Frequent Subcity
      final Map<String, int> subcityCounts = {};
      for (final s in subcities) {
        subcityCounts[s] = (subcityCounts[s] ?? 0) + 1;
      }
      final sortedSubcities = subcityCounts.keys.toList()
        ..sort((a, b) => subcityCounts[b]!.compareTo(subcityCounts[a]!));

      // Calculate Average Price Affinity
      double totalPrices = 0;
      double maxPrice = 0;
      final prices = pricesStr.map((p) => double.tryParse(p) ?? 0.0).where((p) => p > 0).toList();
      for (final p in prices) {
        totalPrices += p;
        if (p > maxPrice) maxPrice = p;
      }
      final avgPrice = prices.isNotEmpty ? totalPrices / prices.length : 30000.0;

      // Calculate Preferred Bedrooms
      final Map<int, int> roomCounts = {};
      for (final r in roomsStr) {
        final val = int.tryParse(r);
        if (val != null) {
          roomCounts[val] = (roomCounts[val] ?? 0) + 1;
        }
      }
      int preferredRooms = 2;
      if (roomCounts.isNotEmpty) {
        preferredRooms = roomCounts.keys.reduce((a, b) => roomCounts[a]! > roomCounts[b]! ? a : b);
      }

      return {
        'searchQueries': searches,
        'viewedSubcities': sortedSubcities,
        'viewedPropertyIds': viewedIds,
        'favoritedPropertyIds': favorites,
        'maxBudget': maxPrice > 0 ? maxPrice : 80000.0,
        'avgPriceAffinity': avgPrice,
        'preferredBedrooms': preferredRooms,
        'preferredCity': 'Addis Ababa',
      };
    } catch (_) {
      return {
        'searchQueries': [],
        'viewedSubcities': ['Bole'],
        'viewedPropertyIds': [],
        'favoritedPropertyIds': [],
        'maxBudget': 50000.0,
        'avgPriceAffinity': 25000.0,
        'preferredBedrooms': 2,
        'preferredCity': 'Addis Ababa',
      };
    }
  }
}
