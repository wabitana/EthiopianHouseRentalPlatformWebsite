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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type.name,
      'relatedPropertyId': relatedPropertyId,
      'relatedInquiryId': relatedInquiryId,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? '',
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      type: NotificationType.systemAlert,
      relatedPropertyId: json['relatedPropertyId'] as String?,
      relatedInquiryId: json['relatedInquiryId'] as String?,
      isRead: json['isRead'] as bool? ?? json['read'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }
}
