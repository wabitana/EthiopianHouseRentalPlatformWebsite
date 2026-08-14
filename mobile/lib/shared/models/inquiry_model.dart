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

class ChatMessageModel {
  final String id;
  final String senderId;
  final String senderName;
  final String senderRole; // 'seeker' or 'provider'
  final String text;
  final DateTime createdAt;

  ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.text,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'senderRole': senderRole,
      'text': text,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] as String? ?? 'msg_${DateTime.now().millisecondsSinceEpoch}',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? 'User',
      senderRole: json['senderRole'] as String? ?? 'seeker',
      text: json['text'] as String? ?? json['message'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
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
  final List<ChatMessageModel> messages;
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
    List<ChatMessageModel>? messages,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : messages = messages ?? [],
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  InquiryModel copyWith({
    InquiryStatus? status,
    String? providerReply,
    List<ChatMessageModel>? messages,
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
      messages: messages ?? this.messages,
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
      'messages': messages.map((m) => m.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory InquiryModel.fromJson(Map<String, dynamic> json) {
    List<ChatMessageModel> parsedMessages = [];
    if (json['messages'] != null && json['messages'] is List) {
      parsedMessages = (json['messages'] as List)
          .map((m) => ChatMessageModel.fromJson(m as Map<String, dynamic>))
          .toList();
    }

    // Fallback if messages list is empty
    if (parsedMessages.isEmpty && json['message'] != null) {
      parsedMessages.add(
        ChatMessageModel(
          id: 'msg_seeker_init',
          senderId: json['seekerId'] as String? ?? '',
          senderName: json['seekerName'] as String? ?? 'House Seeker',
          senderRole: 'seeker',
          text: json['message'] as String? ?? '',
          createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
        ),
      );
      final reply = (json['response'] ?? json['providerReply']) as String?;
      if (reply != null && reply.isNotEmpty) {
        parsedMessages.add(
          ChatMessageModel(
            id: 'msg_provider_init',
            senderId: json['providerId'] as String? ?? '',
            senderName: 'House Provider',
            senderRole: 'provider',
            text: reply,
            createdAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
          ),
        );
      }
    }

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
      messages: parsedMessages,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
