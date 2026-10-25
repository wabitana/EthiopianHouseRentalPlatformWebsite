enum MaintenanceStatus {
  pending,
  inProgress,
  resolved,
  rejected,
}

extension MaintenanceStatusExtension on MaintenanceStatus {
  String get displayName {
    switch (this) {
      case MaintenanceStatus.pending:
        return 'Pending Review';
      case MaintenanceStatus.inProgress:
        return 'In Progress';
      case MaintenanceStatus.resolved:
        return 'Resolved';
      case MaintenanceStatus.rejected:
        return 'Rejected';
    }
  }

  String get apiCode {
    switch (this) {
      case MaintenanceStatus.pending:
        return 'PENDING';
      case MaintenanceStatus.inProgress:
        return 'IN_PROGRESS';
      case MaintenanceStatus.resolved:
        return 'RESOLVED';
      case MaintenanceStatus.rejected:
        return 'REJECTED';
    }
  }

  static MaintenanceStatus fromString(String? code) {
    switch (code?.toUpperCase()) {
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return MaintenanceStatus.inProgress;
      case 'RESOLVED':
        return MaintenanceStatus.resolved;
      case 'REJECTED':
        return MaintenanceStatus.rejected;
      case 'PENDING':
      default:
        return MaintenanceStatus.pending;
    }
  }
}

class MaintenanceRequestModel {
  final String id;
  final String tenantId;
  final String providerId;
  final String? propertyId;
  final String? propertyTitle;
  final String title;
  final String description;
  final String category;
  final MaintenanceStatus status;
  final String? tenantName;
  final String? tenantPhone;
  final String? providerName;
  final String? providerNotes;
  final DateTime createdAt;
  final DateTime updatedAt;

  MaintenanceRequestModel({
    required this.id,
    required this.tenantId,
    required this.providerId,
    this.propertyId,
    this.propertyTitle,
    required this.title,
    required this.description,
    this.category = 'General',
    this.status = MaintenanceStatus.pending,
    this.tenantName,
    this.tenantPhone,
    this.providerName,
    this.providerNotes,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory MaintenanceRequestModel.fromJson(Map<String, dynamic> json) {
    return MaintenanceRequestModel(
      id: json['id'] ?? '',
      tenantId: json['tenantId'] ?? '',
      providerId: json['providerId'] ?? '',
      propertyId: json['propertyId'],
      propertyTitle: json['propertyTitle'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'General',
      status: MaintenanceStatusExtension.fromString(json['status']),
      tenantName: json['tenantName'],
      tenantPhone: json['tenantPhone'],
      providerName: json['providerName'],
      providerNotes: json['providerNotes'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'providerId': providerId,
      'propertyId': propertyId,
      'propertyTitle': propertyTitle,
      'title': title,
      'description': description,
      'category': category,
      'status': status.apiCode,
      'tenantName': tenantName,
      'tenantPhone': tenantPhone,
      'providerName': providerName,
      'providerNotes': providerNotes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  MaintenanceRequestModel copyWith({
    String? id,
    String? tenantId,
    String? providerId,
    String? propertyId,
    String? propertyTitle,
    String? title,
    String? description,
    String? category,
    MaintenanceStatus? status,
    String? tenantName,
    String? tenantPhone,
    String? providerName,
    String? providerNotes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return MaintenanceRequestModel(
      id: id ?? this.id,
      tenantId: tenantId ?? this.tenantId,
      providerId: providerId ?? this.providerId,
      propertyId: propertyId ?? this.propertyId,
      propertyTitle: propertyTitle ?? this.propertyTitle,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      tenantName: tenantName ?? this.tenantName,
      tenantPhone: tenantPhone ?? this.tenantPhone,
      providerName: providerName ?? this.providerName,
      providerNotes: providerNotes ?? this.providerNotes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
