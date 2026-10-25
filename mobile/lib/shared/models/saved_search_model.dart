class SavedSearchPropertyPreview {
  final String id;
  final String title;
  final double price;
  final String city;
  final String area;
  final int rooms;
  final String propertyType;
  final List<String> images;

  SavedSearchPropertyPreview({
    required this.id,
    required this.title,
    required this.price,
    required this.city,
    required this.area,
    required this.rooms,
    required this.propertyType,
    required this.images,
  });

  factory SavedSearchPropertyPreview.fromJson(Map<String, dynamic> json) {
    List<String> parsedImages = [];
    if (json['images'] != null) {
      if (json['images'] is List) {
        parsedImages = (json['images'] as List).map((e) => e.toString()).toList();
      } else if (json['images'] is String) {
        parsedImages = [json['images'].toString()];
      }
    }

    return SavedSearchPropertyPreview(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      city: json['city']?.toString() ?? '',
      area: json['area']?.toString() ?? '',
      rooms: (json['rooms'] as num?)?.toInt() ?? 1,
      propertyType: json['propertyType']?.toString() ?? 'House',
      images: parsedImages,
    );
  }
}

class SavedSearchModel {
  final String id;
  final String title;
  final String city;
  final String area;
  final String propertyType;
  final double minPrice;
  final double maxPrice;
  final int minRooms;
  final String criteria;
  final int matchesCount;
  final String matches;
  bool isNotify;
  final List<SavedSearchPropertyPreview> matchingProperties;
  final DateTime? createdAt;

  SavedSearchModel({
    required this.id,
    required this.title,
    required this.city,
    required this.area,
    required this.propertyType,
    required this.minPrice,
    required this.maxPrice,
    required this.minRooms,
    required this.criteria,
    required this.matchesCount,
    required this.matches,
    required this.isNotify,
    this.matchingProperties = const [],
    this.createdAt,
  });

  factory SavedSearchModel.fromJson(Map<String, dynamic> json) {
    List<SavedSearchPropertyPreview> previews = [];
    if (json['matchingProperties'] != null && json['matchingProperties'] is List) {
      previews = (json['matchingProperties'] as List)
          .map((item) => SavedSearchPropertyPreview.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return SavedSearchModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Saved Search',
      city: json['city']?.toString() ?? 'Addis Ababa',
      area: json['area']?.toString() ?? 'All',
      propertyType: json['propertyType']?.toString() ?? 'All',
      minPrice: (json['minPrice'] as num?)?.toDouble() ?? 0.0,
      maxPrice: (json['maxPrice'] as num?)?.toDouble() ?? 100000.0,
      minRooms: (json['minRooms'] as num?)?.toInt() ?? 0,
      criteria: json['criteria']?.toString() ?? '',
      matchesCount: (json['matchesCount'] as num?)?.toInt() ?? 0,
      matches: json['matches']?.toString() ?? '0 Matches',
      isNotify: json['isNotify'] == true,
      matchingProperties: previews,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'city': city,
      'area': area,
      'propertyType': propertyType,
      'minPrice': minPrice,
      'maxPrice': maxPrice,
      'minRooms': minRooms,
      'isNotify': isNotify,
    };
  }

  SavedSearchModel copyWith({
    String? id,
    String? title,
    String? city,
    String? area,
    String? propertyType,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    String? criteria,
    int? matchesCount,
    String? matches,
    bool? isNotify,
    List<SavedSearchPropertyPreview>? matchingProperties,
    DateTime? createdAt,
  }) {
    return SavedSearchModel(
      id: id ?? this.id,
      title: title ?? this.title,
      city: city ?? this.city,
      area: area ?? this.area,
      propertyType: propertyType ?? this.propertyType,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      minRooms: minRooms ?? this.minRooms,
      criteria: criteria ?? this.criteria,
      matchesCount: matchesCount ?? this.matchesCount,
      matches: matches ?? this.matches,
      isNotify: isNotify ?? this.isNotify,
      matchingProperties: matchingProperties ?? this.matchingProperties,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
