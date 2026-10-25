import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/saved_search_model.dart';

abstract class SavedSearchRepository {
  Future<List<SavedSearchModel>> getSavedSearches();
  Future<SavedSearchModel> createSavedSearch({
    required String title,
    String? city,
    String? area,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    bool isNotify = true,
  });
  Future<bool> toggleAlert(String id, bool isNotify);
  Future<bool> deleteSavedSearch(String id);
}

class SavedSearchRepositoryImpl implements SavedSearchRepository {
  @override
  Future<List<SavedSearchModel>> getSavedSearches() async {
    try {
      final res = await ApiClient.get(ApiEndpoints.savedSearches, requireAuth: true);
      List<dynamic> list = [];
      if (res is Map<String, dynamic> && res.containsKey('data') && res['data'] is List) {
        list = res['data'] as List<dynamic>;
      } else if (res is List) {
        list = res;
      }

      return list
          .map((item) => SavedSearchModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Return empty list on failure rather than crashing
      return [];
    }
  }

  @override
  Future<SavedSearchModel> createSavedSearch({
    required String title,
    String? city,
    String? area,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    bool isNotify = true,
  }) async {
    final body = <String, dynamic>{
      'title': title,
      'isNotify': isNotify,
    };
    if (city != null) body['city'] = city;
    if (area != null) body['area'] = area;
    if (propertyType != null) body['propertyType'] = propertyType;
    if (minPrice != null) body['minPrice'] = minPrice;
    if (maxPrice != null) body['maxPrice'] = maxPrice;
    if (minRooms != null) body['minRooms'] = minRooms;

    final res = await ApiClient.post(
      ApiEndpoints.savedSearches,
      body: body,
      requireAuth: true,
    );

    if (res is Map<String, dynamic> && res['data'] != null) {
      return SavedSearchModel.fromJson(res['data'] as Map<String, dynamic>);
    }

    throw ApiException('Failed to create saved search');
  }

  @override
  Future<bool> toggleAlert(String id, bool isNotify) async {
    try {
      final res = await ApiClient.patch(
        ApiEndpoints.savedSearchToggle(id),
        body: {'isNotify': isNotify},
        requireAuth: true,
      );
      if (res is Map<String, dynamic> && res['success'] == true) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> deleteSavedSearch(String id) async {
    try {
      final res = await ApiClient.delete(
        ApiEndpoints.savedSearchDetail(id),
        requireAuth: true,
      );
      if (res is Map<String, dynamic> && res['success'] == true) {
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
