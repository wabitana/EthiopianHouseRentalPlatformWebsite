import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/report_model.dart';

abstract class ReportRepository {
  Future<void> submitReport(ReportModel report);
}

class ApiReportRepository implements ReportRepository {
  @override
  Future<void> submitReport(ReportModel report) async {
    final response = await ApiClient.post(
      ApiEndpoints.reports,
      body: {
        'propertyId': report.propertyId,
        'reason': report.reason,
        'details': report.details,
      },
    );
    if (response is Map<String, dynamic> && response['error'] != null) {
      throw Exception(response['error']);
    }
  }
}

class MockReportRepository implements ReportRepository {
  final List<ReportModel> _reports = [];

  @override
  Future<void> submitReport(ReportModel report) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _reports.add(report);
  }
}
