import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/property_model.dart';
import 'property_remote_datasource.dart';

class ApiPropertyRemoteDataSource implements PropertyRemoteDataSource {
  @override
  Future<List<PropertyModel>> fetchProperties({
    String? city,
    String? area,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    int? minBathrooms,
    List<String>? requiredAmenities,
    String? searchQuery,
    String? sortBy,
  }) async {
    final queryParams = <String, String>{};
    if (city != null && city.isNotEmpty) queryParams['city'] = city;
    if (area != null && area.isNotEmpty) queryParams['area'] = area;
    if (propertyType != null && propertyType.isNotEmpty) queryParams['propertyType'] = propertyType;
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (minRooms != null) queryParams['minRooms'] = minRooms.toString();
    if (minBathrooms != null) queryParams['minBathrooms'] = minBathrooms.toString();
    if (searchQuery != null && searchQuery.isNotEmpty) queryParams['searchQuery'] = searchQuery;
    if (sortBy != null && sortBy.isNotEmpty) queryParams['sortBy'] = sortBy;

    final uri = Uri.parse(ApiEndpoints.properties).replace(queryParameters: queryParams);
    final res = await ApiClient.get(uri.toString(), requireAuth: false);

    if (res is List) {
      return res.map((item) => PropertyModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  @override
  Future<PropertyModel?> fetchPropertyById(String id) async {
    final res = await ApiClient.get(ApiEndpoints.propertyDetail(id), requireAuth: false);
    if (res != null && res is Map<String, dynamic>) {
      return PropertyModel.fromJson(res);
    }
    return null;
  }

  @override
  Future<List<PropertyModel>> fetchProviderProperties(String providerId) async {
    final res = await ApiClient.get(ApiEndpoints.providerProperties, requireAuth: true);
    if (res is List) {
      return res.map((item) => PropertyModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  @override
  Future<PropertyModel> postProperty(PropertyModel property) async {
    final res = await ApiClient.post(
      ApiEndpoints.properties,
      body: property.toJson(),
      requireAuth: true,
    );
    if (res is Map<String, dynamic>) {
      return PropertyModel.fromJson(res);
    }
    throw ApiException('Failed to post property');
  }

  @override
  Future<PropertyModel> updateProperty(PropertyModel property) async {
    final res = await ApiClient.patch(
      ApiEndpoints.propertyDetail(property.id),
      body: property.toJson(),
      requireAuth: true,
    );
    if (res is Map<String, dynamic>) {
      return PropertyModel.fromJson(res);
    }
    throw ApiException('Failed to update property');
  }

  @override
  Future<void> deleteProperty(String id) async {
    await ApiClient.delete(ApiEndpoints.propertyDetail(id), requireAuth: true);
  }

  @override
  Future<PropertyModel> updateAvailability(String id, bool available) async {
    final res = await ApiClient.patch(
      ApiEndpoints.propertyAvailability(id),
      body: {'availability': available},
      requireAuth: true,
    );
    if (res is Map<String, dynamic>) {
      return PropertyModel.fromJson(res);
    }
    throw ApiException('Failed to update property availability');
  }
}
