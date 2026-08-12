enum NotificationType {
  inquiryReply,
  propertyApproved,
  propertyRejected,
  propertyRented,
  newInquiry,
  systemAlert,
}

class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String message;
  final NotificationType type;
  final String? relatedPropertyId;
  final String? relatedInquiryId;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    this.relatedPropertyId,
    this.relatedInquiryId,
    this.isRead = false,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  NotificationModel copyWith({
    bool? isRead,
  }) {
    return NotificationModel(
      id: id,
      userId: userId,
      title: title,
      message: message,
      type: type,
      relatedPropertyId: relatedPropertyId,
      relatedInquiryId: relatedInquiryId,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }
}
