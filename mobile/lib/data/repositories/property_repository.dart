import '../datasources/property_remote_datasource.dart';
import '../datasources/property_remote_datasource_impl.dart';
import '../../shared/models/property_model.dart';

abstract class PropertyRepository {
  Future<List<PropertyModel>> getProperties({
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

  Future<PropertyModel?> getPropertyById(String id);
  Future<List<PropertyModel>> getProviderProperties(String providerId);
  Future<PropertyModel> createProperty(PropertyModel property);
  Future<PropertyModel> updateProperty(PropertyModel property);
  Future<void> deleteProperty(String id);
  Future<PropertyModel> toggleAvailability(String id, bool available);
  Future<PropertyModel> updateListingStatus(String id, PropertyListingStatus status);
}

class PropertyRepositoryImpl implements PropertyRepository {
  final PropertyRemoteDataSource _remoteDataSource;

  PropertyRepositoryImpl({PropertyRemoteDataSource? remoteDataSource})
      : _remoteDataSource = remoteDataSource ?? ApiPropertyRemoteDataSource();

  @override
  Future<List<PropertyModel>> getProperties({
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
    try {
      final list = await _remoteDataSource.fetchProperties(
        city: city,
        area: area,
        propertyType: propertyType,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minRooms: minRooms,
        minBathrooms: minBathrooms,
        requiredAmenities: requiredAmenities,
        searchQuery: searchQuery,
        sortBy: sortBy,
      );

      list.sort((a, b) {
        if (sortBy == 'Lowest price') return a.price.compareTo(b.price);
        if (sortBy == 'Highest price') return b.price.compareTo(a.price);
        if (sortBy == 'Newest') return b.createdAt.compareTo(a.createdAt);
        return b.viewsCount.compareTo(a.viewsCount);
      });

      return list;
    } catch (_) {
      return [];
    }
  }

  @override
  Future<PropertyModel?> getPropertyById(String id) async {
    try {
      return await _remoteDataSource.fetchPropertyById(id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<PropertyModel>> getProviderProperties(String providerId) async {
    try {
      return await _remoteDataSource.fetchProviderProperties(providerId);
    } catch (_) {
      return [];
    }
  }

  @override
  Future<PropertyModel> createProperty(PropertyModel property) =>
      _remoteDataSource.postProperty(property);

  @override
  Future<PropertyModel> updateProperty(PropertyModel property) =>
      _remoteDataSource.updateProperty(property);

  @override
  Future<void> deleteProperty(String id) => _remoteDataSource.deleteProperty(id);

  @override
  Future<PropertyModel> toggleAvailability(String id, bool available) =>
      _remoteDataSource.updateAvailability(id, available);

  @override
  Future<PropertyModel> updateListingStatus(String id, PropertyListingStatus status) async {
    final property = await getPropertyById(id);
    if (property != null) {
      final updated = property.copyWith(
        listingStatus: status,
        availability: status == PropertyListingStatus.active,
      );
      return updateProperty(updated);
    }
    throw Exception('Property not found');
  }
}

// Backward compatibility alias for MockPropertyRepository
typedef MockPropertyRepository = PropertyRepositoryImpl;
