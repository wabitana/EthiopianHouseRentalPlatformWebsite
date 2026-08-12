import 'package:flutter/material.dart';
import '../../../data/repositories/property_repository.dart';
import '../../../shared/models/property_model.dart';

class PropertyProvider extends ChangeNotifier {
  final PropertyRepository _propertyRepository;

  List<PropertyModel> _properties = [];
  List<PropertyModel> _providerProperties = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Filter States
  String _selectedCity = 'Addis Ababa';
  String _selectedArea = 'All';
  String _selectedPropertyType = 'All';
  double _minPrice = 0;
  double _maxPrice = 100000;
  int _minRooms = 0;
  int _minBathrooms = 0;
  List<String> _selectedAmenities = [];
  String _searchQuery = '';
  String _sortBy = 'Recommended';

  PropertyProvider({PropertyRepository? propertyRepository})
      : _propertyRepository = propertyRepository ?? MockPropertyRepository() {
    fetchProperties();
  }

  List<PropertyModel> get properties => _properties;
  List<PropertyModel> get featuredProperties =>
      _properties.where((p) => p.isVerified && p.availability).take(5).toList();
  List<PropertyModel> get providerProperties => _providerProperties;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  String get selectedCity => _selectedCity;
  String get selectedArea => _selectedArea;
  String get selectedPropertyType => _selectedPropertyType;
  double get minPrice => _minPrice;
  double get maxPrice => _maxPrice;
  int get minRooms => _minRooms;
  int get minBathrooms => _minBathrooms;
  List<String> get selectedAmenities => _selectedAmenities;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  int get activeFiltersCount {
    int count = 0;
    if (_selectedCity != 'All' && _selectedCity != 'Addis Ababa') count++;
    if (_selectedArea != 'All') count++;
    if (_selectedPropertyType != 'All') count++;
    if (_minPrice > 0 || _maxPrice < 100000) count++;
    if (_minRooms > 0) count++;
    if (_minBathrooms > 0) count++;
    if (_selectedAmenities.isNotEmpty) count += _selectedAmenities.length;
    return count;
  }

  void setSelectedCity(String city) {
    _selectedCity = city;
    _selectedArea = 'All';
    fetchProperties();
  }

  void setSelectedArea(String area) {
    _selectedArea = area;
    fetchProperties();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    fetchProperties();
  }

  void setPropertyType(String type) {
    _selectedPropertyType = type;
    fetchProperties();
  }

  void setPriceRange(double min, double max) {
    _minPrice = min;
    _maxPrice = max;
    fetchProperties();
  }

  void setRooms(int rooms) {
    _minRooms = rooms;
    fetchProperties();
  }

  void setBathrooms(int bathrooms) {
    _minBathrooms = bathrooms;
    fetchProperties();
  }

  void toggleAmenity(String amenity) {
    if (_selectedAmenities.contains(amenity)) {
      _selectedAmenities.remove(amenity);
    } else {
      _selectedAmenities.add(amenity);
    }
    fetchProperties();
  }

  void setSortBy(String sort) {
    _sortBy = sort;
    fetchProperties();
  }

  void resetFilters() {
    _selectedCity = 'Addis Ababa';
    _selectedArea = 'All';
    _selectedPropertyType = 'All';
    _minPrice = 0;
    _maxPrice = 100000;
    _minRooms = 0;
    _minBathrooms = 0;
    _selectedAmenities = [];
    _searchQuery = '';
    _sortBy = 'Recommended';
    fetchProperties();
  }

  Future<void> fetchProperties() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _properties = await _propertyRepository.getProperties(
        city: _selectedCity,
        area: _selectedArea,
        propertyType: _selectedPropertyType,
        minPrice: _minPrice > 0 ? _minPrice : null,
        maxPrice: _maxPrice < 100000 ? _maxPrice : null,
        minRooms: _minRooms > 0 ? _minRooms : null,
        minBathrooms: _minBathrooms > 0 ? _minBathrooms : null,
        requiredAmenities: _selectedAmenities,
        searchQuery: _searchQuery,
        sortBy: _sortBy,
      );
    } catch (e) {
      _errorMessage = 'Failed to load properties';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProviderProperties(String providerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _providerProperties = await _propertyRepository.getProviderProperties(providerId);
    } catch (e) {
      _errorMessage = 'Failed to load provider listings';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<PropertyModel> createProperty(PropertyModel newProperty) async {
    _isLoading = true;
    notifyListeners();
    try {
      final created = await _propertyRepository.createProperty(newProperty);
      _properties.insert(0, created);
      _providerProperties.insert(0, created);
      return created;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleAvailability(String propertyId, bool available) async {
    final updated = await _propertyRepository.toggleAvailability(propertyId, available);
    final index = _properties.indexWhere((p) => p.id == propertyId);
    if (index != -1) _properties[index] = updated;

    final pIndex = _providerProperties.indexWhere((p) => p.id == propertyId);
    if (pIndex != -1) _providerProperties[pIndex] = updated;

    notifyListeners();
  }

  Future<void> deleteProperty(String propertyId) async {
    await _propertyRepository.deleteProperty(propertyId);
    _properties.removeWhere((p) => p.id == propertyId);
    _providerProperties.removeWhere((p) => p.id == propertyId);
    notifyListeners();
  }
}
