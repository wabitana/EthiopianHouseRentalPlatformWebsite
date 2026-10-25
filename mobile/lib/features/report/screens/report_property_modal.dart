import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/report_repository.dart';
import '../../../shared/models/report_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notification_provider.dart';

class ReportPropertyModal extends StatefulWidget {
  final String propertyId;
  final String propertyTitle;

  const ReportPropertyModal({
    super.key,
    required this.propertyId,
    required this.propertyTitle,
  });

  @override
  State<ReportPropertyModal> createState() => _ReportPropertyModalState();
}

class _ReportPropertyModalState extends State<ReportPropertyModal> {
  final ReportRepository _reportRepository = ApiReportRepository();

  String _selectedReason = AppConstants.reportReasons.first;
  final _detailsController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please log in to submit a security report.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (_selectedReason == 'Other' && _detailsController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please describe the issue in the additional details field.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final report = ReportModel(
      id: 'rep_${DateTime.now().millisecondsSinceEpoch}',
      propertyId: widget.propertyId,
      propertyTitle: widget.propertyTitle,
      reporterId: user.id,
      reason: _selectedReason,
      details: _detailsController.text.trim(),
    );

    try {
      await _reportRepository.submitReport(report);

      if (!mounted) return;

      // Refresh in-app notifications
      context.read<NotificationProvider>().fetchNotifications(user.id);

      Navigator.of(context).pop();

      _showSuccessDialog();
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit report: ${e.toString().replaceAll("Exception: ", "")}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.shield, color: AppColors.success, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Security Report Dispatched',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Thank you for reporting "${widget.propertyTitle}".',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            const Text(
              'Our trust and compliance team has logged your complaint in the database and is actively reviewing this listing.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Flagged for: $_selectedReason',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.report_problem_outlined, color: AppColors.rejected, size: 22),
                  SizedBox(width: 8),
                  Text('Report Property Listing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
            ],
          ),
          const Divider(),
          const SizedBox(height: 6),

          // Property Title
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.home_outlined, size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    widget.propertyTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Reason Selector
          const Text('Select Reason for Reporting', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _selectedReason,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
            items: AppConstants.reportReasons.map((reason) {
              return DropdownMenuItem(value: reason, child: Text(reason, style: const TextStyle(fontSize: 13)));
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedReason = val);
            },
          ),
          const SizedBox(height: 16),

          // Additional Details
          const Text('Additional Details', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _detailsController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Describe why this listing seems suspicious, inaccurate, or already rented...',
              hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 20),

          // Submit Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.rejected,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 2,
            ),
            icon: _isSubmitting
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.shield, size: 18),
            label: Text(
              _isSubmitting ? 'Submitting Security Report...' : 'Submit Security Report',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            onPressed: _isSubmitting ? null : _submitReport,
          ),
        ],
      ),
    );
  }
}
