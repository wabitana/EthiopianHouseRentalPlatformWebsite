import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/report_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../data/repositories/report_repository.dart';

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
  String _selectedReason = AppConstants.reportReasons.first;
  final _detailsController = TextEditingController();
  bool _isSubmitting = false;

  void _submitReport() async {
    setState(() {
      _isSubmitting = true;
    });

    final report = ReportModel(
      id: 'report_${DateTime.now().millisecondsSinceEpoch}',
      propertyId: widget.propertyId,
      propertyTitle: widget.propertyTitle,
      reporterId: 'user_current',
      reason: _selectedReason,
      details: _detailsController.text.trim(),
    );

    final repo = MockReportRepository();
    await repo.submitReport(report);

    if (mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Report submitted. Thank you for keeping Ethiopian House Rental safe!'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Report Property Listing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
            ],
          ),
          const Divider(),
          const SizedBox(height: 8),

          Text('Property: ${widget.propertyTitle}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
          const SizedBox(height: 16),

          const Text('Select Reason for Reporting', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _selectedReason,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            items: AppConstants.reportReasons.map((reason) {
              return DropdownMenuItem(value: reason, child: Text(reason));
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedReason = val);
            },
          ),
          const SizedBox(height: 16),

          CustomTextField(
            label: 'Additional Details',
            controller: _detailsController,
            maxLines: 3,
            hint: 'Describe why this listing seems suspicious or inaccurate...',
          ),
          const SizedBox(height: 20),

          CustomButton(
            text: 'Submit Security Report',
            variant: CustomButtonVariant.danger,
            isLoading: _isSubmitting,
            onPressed: _submitReport,
          ),
        ],
      ),
    );
  }
}
