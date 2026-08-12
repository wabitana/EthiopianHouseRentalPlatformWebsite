import '../../shared/models/report_model.dart';

abstract class ReportRepository {
  Future<void> submitReport(ReportModel report);
}

class MockReportRepository implements ReportRepository {
  final List<ReportModel> _reports = [];

  @override
  Future<void> submitReport(ReportModel report) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _reports.add(report);
  }
}
