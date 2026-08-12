enum InquiryStatus {
  newInquiry,
  responded,
  viewingArranged,
  closed,
}

extension InquiryStatusExtension on InquiryStatus {
  String get displayName {
    switch (this) {
      case InquiryStatus.newInquiry:
        return 'New';
      case InquiryStatus.responded:
        return 'Responded';
      case InquiryStatus.viewingArranged:
        return 'Viewing Arranged';
      case InquiryStatus.closed:
        return 'Closed';
    }
  }

  String get code => name;

  static InquiryStatus fromCode(String code) {
    switch (code) {
      case 'newInquiry':
      case 'new_inquiry':
        return InquiryStatus.newInquiry;
      case 'responded':
        return InquiryStatus.responded;
      case 'viewingArranged':
      case 'viewing_arranged':
        return InquiryStatus.viewingArranged;
      case 'closed':
        return InquiryStatus.closed;
      default:
        return InquiryStatus.newInquiry;
    }
  }
}

class InquiryModel {
  final String id;
  final String propertyId;
  final String propertyTitle;
  final String propertyImage;
  final double propertyPrice;
  final String propertyCity;
  final String propertyArea;

  final String seekerId;
  final String seekerName;
  final String seekerPhone;
  final String? seekerAvatar;

  final String providerId;

  final String message;
  final String? providerReply;
  final InquiryStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  InquiryModel({
    required this.id,
    required this.propertyId,
    required this.propertyTitle,
    required this.propertyImage,
    this.propertyPrice = 0.0,
    this.propertyCity = 'Addis Ababa',
    this.propertyArea = 'Bole',
    required this.seekerId,
    required this.seekerName,
    required this.seekerPhone,
    this.seekerAvatar,
    required this.providerId,
    required this.message,
    this.providerReply,
    this.status = InquiryStatus.newInquiry,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  InquiryModel copyWith({
    InquiryStatus? status,
    String? providerReply,
  }) {
    return InquiryModel(
      id: id,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      propertyImage: propertyImage,
      propertyPrice: propertyPrice,
      propertyCity: propertyCity,
      propertyArea: propertyArea,
      seekerId: seekerId,
      seekerName: seekerName,
      seekerPhone: seekerPhone,
      seekerAvatar: seekerAvatar,
      providerId: providerId,
      message: message,
      providerReply: providerReply ?? this.providerReply,
      status: status ?? this.status,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'propertyTitle': propertyTitle,
      'propertyImage': propertyImage,
      'propertyPrice': propertyPrice,
      'propertyCity': propertyCity,
      'propertyArea': propertyArea,
      'seekerId': seekerId,
      'seekerName': seekerName,
      'seekerPhone': seekerPhone,
      'seekerAvatar': seekerAvatar,
      'providerId': providerId,
      'message': message,
      'response': providerReply,
      'status': status.code,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory InquiryModel.fromJson(Map<String, dynamic> json) {
    return InquiryModel(
      id: json['id'] as String,
      propertyId: json['propertyId'] as String? ?? '',
      propertyTitle: json['propertyTitle'] as String? ?? 'Rental Property',
      propertyImage: json['propertyImage'] as String? ?? '',
      propertyPrice: (json['propertyPrice'] as num?)?.toDouble() ?? 0.0,
      propertyCity: json['propertyCity'] as String? ?? 'Addis Ababa',
      propertyArea: json['propertyArea'] as String? ?? 'Bole',
      seekerId: json['seekerId'] as String? ?? '',
      seekerName: json['seekerName'] as String? ?? 'House Seeker',
      seekerPhone: json['seekerPhone'] as String? ?? '',
      seekerAvatar: json['seekerAvatar'] as String?,
      providerId: json['providerId'] as String? ?? '',
      message: json['message'] as String? ?? '',
      providerReply: (json['response'] ?? json['providerReply']) as String?,
      status: InquiryStatusExtension.fromCode(json['status'] as String? ?? 'newInquiry'),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
    );
  }
}
