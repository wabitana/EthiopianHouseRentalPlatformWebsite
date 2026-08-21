enum UserRole {
  seeker,
  provider,
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.seeker:
        return 'House Seeker';
      case UserRole.provider:
        return 'House Provider';
    }
  }

  String get code {
    switch (this) {
      case UserRole.seeker:
        return 'seeker';
      case UserRole.provider:
        return 'provider';
    }
  }

  static UserRole fromCode(String code) {
    return code.toLowerCase() == 'provider'
        ? UserRole.provider
        : UserRole.seeker;
  }
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final UserRole role;
  final String? avatarUrl;
  final bool isVerified;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final double rating;
  final int totalListings;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.avatarUrl,
    this.isVerified = false,
    this.isEmailVerified = false,
    this.isPhoneVerified = false,
    this.rating = 4.8,
    this.totalListings = 0,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    UserRole? role,
    String? avatarUrl,
    bool? isVerified,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    double? rating,
    int? totalListings,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isVerified: isVerified ?? this.isVerified,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      rating: rating ?? this.rating,
      totalListings: totalListings ?? this.totalListings,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role.code,
      'avatarUrl': avatarUrl,
      'isVerified': isVerified,
      'isEmailVerified': isEmailVerified,
      'isPhoneVerified': isPhoneVerified,
      'rating': rating,
      'totalListings': totalListings,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: (json['phone'] as String?) ?? '',
      role: UserRoleExtension.fromCode(json['role'] as String),
      avatarUrl: json['avatarUrl'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
      isPhoneVerified: json['isPhoneVerified'] as bool? ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      totalListings: json['totalListings'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }
}
