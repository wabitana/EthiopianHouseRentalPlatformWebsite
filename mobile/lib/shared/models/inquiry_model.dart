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
        return InquiryStatus.newInquiry;
      case 'responded':
        return InquiryStatus.responded;
      case 'viewingArranged':
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
    required this.propertyPrice,
    required this.propertyCity,
    required this.propertyArea,
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
}
