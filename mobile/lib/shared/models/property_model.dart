enum PropertyListingStatus {
  active,
  pending,
  rented,
  rejected,
}

extension PropertyListingStatusExtension on PropertyListingStatus {
  String get displayName {
    switch (this) {
      case PropertyListingStatus.active:
        return 'Active';
      case PropertyListingStatus.pending:
        return 'Pending Review';
      case PropertyListingStatus.rented:
        return 'Rented';
      case PropertyListingStatus.rejected:
        return 'Rejected';
    }
  }

  String get code => name;

  static PropertyListingStatus fromCode(String code) {
    switch (code.toLowerCase()) {
      case 'active':
        return PropertyListingStatus.active;
      case 'pending':
        return PropertyListingStatus.pending;
      case 'rented':
        return PropertyListingStatus.rented;
      case 'rejected':
        return PropertyListingStatus.rejected;
      default:
        return PropertyListingStatus.active;
    }
  }
}

class PropertyModel {
  final String id;
  final String providerId;
  final String providerName;
  final String providerPhone;
  final String? providerAvatar;
  final bool providerIsVerified;

  final String title;
  final String description;
  final String propertyType;
  final double price;
  final String rentalPeriod;
  final int rooms;
  final int bathrooms;

  final String city;
  final String area;
  final String neighborhood;
  final String? addressDetails;
  final double? latitude;
  final double? longitude;

  final List<String> images;
  final List<String> amenities;

  final bool availability;
  final bool isVerified;
  final PropertyListingStatus listingStatus;

  final int viewsCount;
  final int inquiriesCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  PropertyModel({
    required this.id,
    required this.providerId,
    required this.providerName,
    required this.providerPhone,
    this.providerAvatar,
    this.providerIsVerified = true,
    required this.title,
    required this.description,
    required this.propertyType,
    required this.price,
    this.rentalPeriod = 'Monthly',
    required this.rooms,
    required this.bathrooms,
    required this.city,
    required this.area,
    required this.neighborhood,
    this.addressDetails,
    this.latitude,
    this.longitude,
    required this.images,
    required this.amenities,
    this.availability = true,
    this.isVerified = true,
    this.listingStatus = PropertyListingStatus.active,
    this.viewsCount = 120,
    this.inquiriesCount = 4,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  PropertyModel copyWith({
    String? id,
    String? providerId,
    String? providerName,
    String? providerPhone,
    String? providerAvatar,
    bool? providerIsVerified,
    String? title,
    String? description,
    String? propertyType,
    double? price,
    String? rentalPeriod,
    int? rooms,
    int? bathrooms,
    String? city,
    String? area,
    String? neighborhood,
    String? addressDetails,
    double? latitude,
    double? longitude,
    List<String>? images,
    List<String>? amenities,
    bool? availability,
    bool? isVerified,
    PropertyListingStatus? listingStatus,
    int? viewsCount,
    int? inquiriesCount,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      providerId: providerId ?? this.providerId,
      providerName: providerName ?? this.providerName,
      providerPhone: providerPhone ?? this.providerPhone,
      providerAvatar: providerAvatar ?? this.providerAvatar,
      providerIsVerified: providerIsVerified ?? this.providerIsVerified,
      title: title ?? this.title,
      description: description ?? this.description,
      propertyType: propertyType ?? this.propertyType,
      price: price ?? this.price,
      rentalPeriod: rentalPeriod ?? this.rentalPeriod,
      rooms: rooms ?? this.rooms,
      bathrooms: bathrooms ?? this.bathrooms,
      city: city ?? this.city,
      area: area ?? this.area,
      neighborhood: neighborhood ?? this.neighborhood,
      addressDetails: addressDetails ?? this.addressDetails,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      images: images ?? this.images,
      amenities: amenities ?? this.amenities,
      availability: availability ?? this.availability,
      isVerified: isVerified ?? this.isVerified,
      listingStatus: listingStatus ?? this.listingStatus,
      viewsCount: viewsCount ?? this.viewsCount,
      inquiriesCount: inquiriesCount ?? this.inquiriesCount,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'providerId': providerId,
      'providerName': providerName,
      'providerPhone': providerPhone,
      'providerAvatar': providerAvatar,
      'providerIsVerified': providerIsVerified,
      'title': title,
      'description': description,
      'propertyType': propertyType,
      'price': price,
      'rentalPeriod': rentalPeriod,
      'rooms': rooms,
      'bathrooms': bathrooms,
      'city': city,
      'area': area,
      'neighborhood': neighborhood,
      'addressDetails': addressDetails,
      'latitude': latitude,
      'longitude': longitude,
      'images': images,
      'amenities': amenities,
      'availability': availability,
      'isVerified': isVerified,
      'listingStatus': listingStatus.code,
      'viewsCount': viewsCount,
      'inquiriesCount': inquiriesCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] as String,
      providerId: json['providerId'] as String,
      providerName: json['providerName'] as String,
      providerPhone: json['providerPhone'] as String,
      providerAvatar: json['providerAvatar'] as String?,
      providerIsVerified: json['providerIsVerified'] as bool? ?? true,
      title: json['title'] as String,
      description: json['description'] as String,
      propertyType: json['propertyType'] as String,
      price: (json['price'] as num).toDouble(),
      rentalPeriod: json['rentalPeriod'] as String? ?? 'Monthly',
      rooms: json['rooms'] as int,
      bathrooms: json['bathrooms'] as int,
      city: json['city'] as String,
      area: json['area'] as String,
      neighborhood: json['neighborhood'] as String,
      addressDetails: json['addressDetails'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      images: List<String>.from(json['images'] as List),
      amenities: List<String>.from(json['amenities'] as List),
      availability: json['availability'] as bool? ?? true,
      isVerified: json['isVerified'] as bool? ?? true,
      listingStatus: PropertyListingStatusExtension.fromCode(
          json['listingStatus'] as String? ?? 'active'),
      viewsCount: json['viewsCount'] as int? ?? 0,
      inquiriesCount: json['inquiriesCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }
}
