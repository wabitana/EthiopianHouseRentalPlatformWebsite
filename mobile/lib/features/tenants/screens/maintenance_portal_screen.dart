import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class MaintenancePortalScreen extends StatefulWidget {
  const MaintenancePortalScreen({super.key});

  @override
  State<MaintenancePortalScreen> createState() => _MaintenancePortalScreenState();
}

class _MaintenancePortalScreenState extends State<MaintenancePortalScreen> {
  final List<Map<String, dynamic>> _tickets = [
    {
      'id': 'TKT-101',
      'title': 'Water Tank Supply Pipe Leakage',
      'category': 'Plumbing & Water',
      'date': 'Yesterday',
      'status': 'In Progress',
      'statusColor': Colors.orange,
    },
    {
      'id': 'TKT-102',
      'title': 'Main Compound Gate Lock Repair',
      'category': 'Security & Doors',
      'date': '3 days ago',
      'status': 'Resolved',
      'statusColor': AppColors.success,
    },
  ];

  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _category = 'Plumbing & Water';

  void _showNewTicketModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 16,
            right: 16,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Report Repair / Maintenance Issue', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),

              DropdownButtonFormField<String>(
                initialValue: _category,
                decoration: const InputDecoration(labelText: 'Issue Category', border: OutlineInputBorder()),
                items: ['Plumbing & Water', 'Electricity & Power', 'Locks & Doors', 'Roof & Painting'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (val) => setState(() => _category = val!),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Issue Summary / Title', hintText: 'e.g. Water leak under kitchen sink', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: _descController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Detailed Explanation', hintText: 'Describe when it started and location in house...', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),

              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.send_rounded),
                label: const Text('Submit Repair Request to Landlord'),
                onPressed: () {
                  if (_titleController.text.trim().isNotEmpty) {
                    setState(() {
                      _tickets.insert(0, {
                        'id': 'TKT-${_tickets.length + 101}',
                        'title': _titleController.text.trim(),
                        'category': _category,
                        'date': 'Just now',
                        'status': 'Pending Review',
                        'statusColor': Colors.blue,
                      });
                      _titleController.clear();
                      _descController.clear();
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Maintenance ticket submitted to landlord!'), backgroundColor: AppColors.success),
                    );
                  }
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tenant Repair & Maintenance Portal'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.build_rounded, color: Colors.white),
        label: const Text('Report Repair Issue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _showNewTicketModal,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: AppColors.primary),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Report water, electricity, lock, or structural repair issues directly to your landlord for fast resolution.',
                      style: TextStyle(fontSize: 12, color: AppColors.textPrimary, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Your Maintenance Tickets', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            ..._tickets.map((ticket) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(ticket['id'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: (ticket['statusColor'] as Color).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            ticket['status'] as String,
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: ticket['statusColor'] as Color),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    Text(ticket['title'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    const SizedBox(height: 4),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(ticket['category'] as String, style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                        Text(ticket['date'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
