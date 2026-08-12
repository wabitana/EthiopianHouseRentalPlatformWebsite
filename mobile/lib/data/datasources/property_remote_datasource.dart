import '../../shared/models/property_model.dart';
import '../mock_data.dart';

abstract class PropertyRemoteDataSource {
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
  });

  Future<PropertyModel?> fetchPropertyById(String id);
  Future<List<PropertyModel>> fetchProviderProperties(String providerId);
  Future<PropertyModel> postProperty(PropertyModel property);
  Future<PropertyModel> updateProperty(PropertyModel property);
  Future<void> deleteProperty(String id);
  Future<PropertyModel> updateAvailability(String id, bool available);
}

class MockPropertyRemoteDataSource implements PropertyRemoteDataSource {
  final List<PropertyModel> _properties = List.from(MockData.mockProperties);

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
    // Simulate HTTP GET /api/v1/properties
    await Future.delayed(const Duration(milliseconds: 300));
    return _properties.where((p) {
      if (city != null && city.isNotEmpty && city != 'All') {
        if (p.city.toLowerCase() != city.toLowerCase()) return false;
      }
      if (area != null && area.isNotEmpty && area != 'All') {
        if (p.area.toLowerCase() != area.toLowerCase()) return false;
      }
      if (propertyType != null && propertyType.isNotEmpty && propertyType != 'All') {
        if (p.propertyType.toLowerCase() != propertyType.toLowerCase()) return false;
      }
      if (minPrice != null && p.price < minPrice) return false;
      if (maxPrice != null && p.price > maxPrice) return false;
      if (minRooms != null && p.rooms < minRooms) return false;
      if (minBathrooms != null && p.bathrooms < minBathrooms) return false;
      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        final q = searchQuery.toLowerCase().trim();
        if (!p.title.toLowerCase().contains(q) &&
            !p.city.toLowerCase().contains(q) &&
            !p.area.toLowerCase().contains(q) &&
            !p.neighborhood.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  @override
  Future<PropertyModel?> fetchPropertyById(String id) async {
    // Simulate HTTP GET /api/v1/properties/:id
    await Future.delayed(const Duration(milliseconds: 200));
    try {
      return _properties.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<PropertyModel>> fetchProviderProperties(String providerId) async {
    // Simulate HTTP GET /api/v1/providers/:id/properties
    await Future.delayed(const Duration(milliseconds: 250));
    return _properties.where((p) => p.providerId == providerId).toList();
  }

  @override
  Future<PropertyModel> postProperty(PropertyModel property) async {
    // Simulate HTTP POST /api/v1/properties
    await Future.delayed(const Duration(milliseconds: 500));
    _properties.insert(0, property);
    return property;
  }

  @override
  Future<PropertyModel> updateProperty(PropertyModel property) async {
    // Simulate HTTP PUT /api/v1/properties/:id
    await Future.delayed(const Duration(milliseconds: 350));
    final index = _properties.indexWhere((p) => p.id == property.id);
    if (index != -1) _properties[index] = property;
    return property;
  }

  @override
  Future<void> deleteProperty(String id) async {
    // Simulate HTTP DELETE /api/v1/properties/:id
    await Future.delayed(const Duration(milliseconds: 250));
    _properties.removeWhere((p) => p.id == id);
  }

  @override
  Future<PropertyModel> updateAvailability(String id, bool available) async {
    // Simulate HTTP PATCH /api/v1/properties/:id/availability
    await Future.delayed(const Duration(milliseconds: 250));
    final index = _properties.indexWhere((p) => p.id == id);
    if (index != -1) {
      final updated = _properties[index].copyWith(
        availability: available,
        listingStatus: available ? PropertyListingStatus.active : PropertyListingStatus.rented,
      );
      _properties[index] = updated;
      return updated;
    }
    throw Exception('Property not found');
  }
}
