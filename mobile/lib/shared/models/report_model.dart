class ReportModel {
  final String id;
  final String propertyId;
  final String propertyTitle;
  final String reporterId;
  final String reason;
  final String details;
  final DateTime createdAt;

  ReportModel({
    required this.id,
    required this.propertyId,
    required this.propertyTitle,
    required this.reporterId,
    required this.reason,
    required this.details,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}
