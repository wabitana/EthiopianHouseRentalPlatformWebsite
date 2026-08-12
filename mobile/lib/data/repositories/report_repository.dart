import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/report_model.dart';

abstract class ReportRepository {
  Future<void> submitReport(ReportModel report);
}

class ApiReportRepository implements ReportRepository {
  @override
  Future<void> submitReport(ReportModel report) async {
    try {
      await ApiClient.post(
        ApiEndpoints.reports,
        body: {
          'propertyId': report.propertyId,
          'reason': report.reason,
          'details': report.details,
        },
      );
    } catch (_) {}
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
