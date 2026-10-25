import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/maintenance_model.dart';
import '../../tenants/providers/maintenance_provider.dart';

class ProviderMaintenanceScreen extends StatefulWidget {
  const ProviderMaintenanceScreen({super.key});

  @override
  State<ProviderMaintenanceScreen> createState() => _ProviderMaintenanceScreenState();
}

class _ProviderMaintenanceScreenState extends State<ProviderMaintenanceScreen> {
  String _selectedFilter = 'ALL'; // ALL, PENDING, IN_PROGRESS, RESOLVED

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MaintenanceProvider>().fetchProviderTickets();
    });
  }

  void _showUpdateStatusModal(MaintenanceRequestModel ticket) {
    MaintenanceStatus targetStatus = ticket.status;
    final notesController = TextEditingController(text: ticket.providerNotes ?? '');
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
                left: 20,
                right: 20,
                top: 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Update Repair Ticket',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.textMuted),
                          onPressed: () => Navigator.pop(modalCtx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Ticket: ${ticket.title}',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 20),

                    const Text('Update Status', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    const SizedBox(height: 8),

                    Wrap(
                      spacing: 8,
                      children: [
                        _buildStatusChoiceChip(
                          label: 'Pending Review',
                          status: MaintenanceStatus.pending,
                          current: targetStatus,
                          color: Colors.orange,
                          onSelected: () => setModalState(() => targetStatus = MaintenanceStatus.pending),
                        ),
                        _buildStatusChoiceChip(
                          label: 'In Progress',
                          status: MaintenanceStatus.inProgress,
                          current: targetStatus,
                          color: Colors.blue,
                          onSelected: () => setModalState(() => targetStatus = MaintenanceStatus.inProgress),
                        ),
                        _buildStatusChoiceChip(
                          label: 'Resolved ✓',
                          status: MaintenanceStatus.resolved,
                          current: targetStatus,
                          color: AppColors.success,
                          onSelected: () => setModalState(() => targetStatus = MaintenanceStatus.resolved),
                        ),
                        _buildStatusChoiceChip(
                          label: 'Rejected',
                          status: MaintenanceStatus.rejected,
                          current: targetStatus,
                          color: Colors.red,
                          onSelected: () => setModalState(() => targetStatus = MaintenanceStatus.rejected),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Landlord Notes / Dispatch Message to Tenant',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: notesController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'e.g. Electrician scheduled for tomorrow at 10:00 AM. Please make sure someone is home.',
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.background,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: isSaving
                          ? null
                          : () async {
                              setModalState(() => isSaving = true);
                              final provider = context.read<MaintenanceProvider>();
                              final success = await provider.updateTicketStatus(
                                ticketId: ticket.id,
                                status: targetStatus,
                                providerNotes: notesController.text.trim(),
                              );
                              setModalState(() => isSaving = false);

                              if (mounted && success) {
                                if (modalCtx.mounted) {
                                  Navigator.pop(modalCtx);
                                }
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Repair ticket updated & tenant notified! ✓'),
                                    backgroundColor: AppColors.success,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              } else if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(provider.errorMessage ?? 'Failed to update ticket'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                      child: isSaving
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Save & Notify Tenant', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStatusChoiceChip({
    required String label,
    required MaintenanceStatus status,
    required MaintenanceStatus current,
    required Color color,
    required VoidCallback onSelected,
  }) {
    final isSelected = current == status;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onSelected(),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected ? Colors.white : color,
      ),
      selectedColor: color,
      backgroundColor: color.withValues(alpha: 0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: isSelected ? color : color.withValues(alpha: 0.3)),
      ),
    );
  }

  void _callTenant(String? phone) async {
    if (phone == null || phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No phone number available for this tenant.')),
      );
      return;
    }
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not dial $phone')),
      );
    }
  }

  Color _getStatusColor(MaintenanceStatus status) {
    switch (status) {
      case MaintenanceStatus.pending:
        return Colors.orange.shade700;
      case MaintenanceStatus.inProgress:
        return Colors.blue.shade700;
      case MaintenanceStatus.resolved:
        return AppColors.success;
      case MaintenanceStatus.rejected:
        return Colors.red.shade700;
    }
  }

  IconData _getStatusIcon(MaintenanceStatus status) {
    switch (status) {
      case MaintenanceStatus.pending:
        return Icons.hourglass_top_rounded;
      case MaintenanceStatus.inProgress:
        return Icons.handyman_rounded;
      case MaintenanceStatus.resolved:
        return Icons.check_circle_rounded;
      case MaintenanceStatus.rejected:
        return Icons.cancel_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final maintenanceProvider = context.watch<MaintenanceProvider>();
    final allTickets = maintenanceProvider.providerTickets;
    final isLoading = maintenanceProvider.isLoading;

    final filteredTickets = allTickets.where((t) {
      if (_selectedFilter == 'ALL') return true;
      if (_selectedFilter == 'PENDING') return t.status == MaintenanceStatus.pending;
      if (_selectedFilter == 'IN_PROGRESS') return t.status == MaintenanceStatus.inProgress;
      if (_selectedFilter == 'RESOLVED') return t.status == MaintenanceStatus.resolved;
      return true;
    }).toList();

    final pendingCount = allTickets.where((t) => t.status == MaintenanceStatus.pending).length;
    final inProgressCount = allTickets.where((t) => t.status == MaintenanceStatus.inProgress).length;
    final resolvedCount = allTickets.where((t) => t.status == MaintenanceStatus.resolved).length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tenant Repair Requests'),
        centerTitle: true,
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await maintenanceProvider.fetchProviderTickets();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary Stats Row
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryCard(
                      label: 'Pending',
                      count: pendingCount,
                      color: Colors.orange.shade700,
                      icon: Icons.hourglass_top_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildSummaryCard(
                      label: 'In Progress',
                      count: inProgressCount,
                      color: Colors.blue.shade700,
                      icon: Icons.handyman_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildSummaryCard(
                      label: 'Resolved',
                      count: resolvedCount,
                      color: AppColors.success,
                      icon: Icons.check_circle_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Filter Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('ALL', 'All Requests (${allTickets.length})'),
                    const SizedBox(width: 8),
                    _buildFilterChip('PENDING', 'Pending ($pendingCount)'),
                    const SizedBox(width: 8),
                    _buildFilterChip('IN_PROGRESS', 'In Progress ($inProgressCount)'),
                    const SizedBox(width: 8),
                    _buildFilterChip('RESOLVED', 'Resolved ($resolvedCount)'),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (isLoading && allTickets.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (filteredTickets.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.verified_outlined, size: 48, color: AppColors.success),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _selectedFilter == 'ALL' ? 'No Repair Requests' : 'No $_selectedFilter Requests',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'When your tenants submit maintenance tickets for your properties, they will appear right here.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                      ),
                    ],
                  ),
                )
              else
                ...filteredTickets.map((ticket) {
                  final statusColor = _getStatusColor(ticket.status);
                  final statusIcon = _getStatusIcon(ticket.status);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top Row: Category & Status Badge
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                ticket.category,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(statusIcon, size: 12, color: statusColor),
                                  const SizedBox(width: 4),
                                  Text(
                                    ticket.status.displayName,
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Title
                        Text(
                          ticket.title,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 4),

                        // Property Name
                        if (ticket.propertyTitle != null) ...[
                          Row(
                            children: [
                              const Icon(Icons.home_outlined, size: 14, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  ticket.propertyTitle!,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                        ],

                        // Description Box
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            ticket.description,
                            style: const TextStyle(fontSize: 12, color: AppColors.textPrimary, height: 1.4),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Tenant Info Bar
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: AppColors.primaryContainer,
                              child: const Icon(Icons.person, size: 16, color: AppColors.primary),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ticket.tenantName ?? 'Tenant',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                  ),
                                  Text(
                                    ticket.tenantPhone ?? Formatters.formatTimeAgo(ticket.createdAt),
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            if (ticket.tenantPhone != null && ticket.tenantPhone!.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.phone_rounded, color: AppColors.primary, size: 20),
                                onPressed: () => _callTenant(ticket.tenantPhone),
                              ),
                          ],
                        ),

                        // Provider Notes If Present
                        if (ticket.providerNotes != null && ticket.providerNotes!.trim().isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.note_alt_outlined, size: 14, color: AppColors.primary),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Your Note: ${ticket.providerNotes}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w500),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const Divider(height: 20),

                        // Action Buttons: Update Status & Manage
                        Row(
                          children: [
                            if (ticket.status == MaintenanceStatus.pending) ...[
                              Expanded(
                                child: OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.blue.shade700,
                                    side: BorderSide(color: Colors.blue.shade300),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                  icon: const Icon(Icons.handyman_rounded, size: 16),
                                  label: const Text('In Progress', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  onPressed: () {
                                    context.read<MaintenanceProvider>().updateTicketStatus(
                                      ticketId: ticket.id,
                                      status: MaintenanceStatus.inProgress,
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                            ],
                            if (ticket.status != MaintenanceStatus.resolved) ...[
                              Expanded(
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.success,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                  icon: const Icon(Icons.check_circle_rounded, size: 16),
                                  label: const Text('Resolve', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  onPressed: () {
                                    context.read<MaintenanceProvider>().updateTicketStatus(
                                      ticketId: ticket.id,
                                      status: MaintenanceStatus.resolved,
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                            ],
                            IconButton.outlined(
                              style: IconButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                side: const BorderSide(color: AppColors.border),
                              ),
                              tooltip: 'Edit Status / Notes',
                              icon: const Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 20),
                              onPressed: () => _showUpdateStatusModal(ticket),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard({
    required String label,
    required int count,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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
              Icon(icon, size: 18, color: color),
              Text(
                '$count',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String filterKey, String label) {
    final isSelected = _selectedFilter == filterKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        setState(() {
          _selectedFilter = filterKey;
        });
      },
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
        color: isSelected ? Colors.white : AppColors.textSecondary,
      ),
      selectedColor: AppColors.primary,
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
      ),
    );
  }
}
