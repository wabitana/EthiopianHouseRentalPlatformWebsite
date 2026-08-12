import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../house_seeker/providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ProviderInquiriesScreen extends StatelessWidget {
  const ProviderInquiriesScreen({super.key});

  void _showReplyModal(BuildContext context, InquiryModel inquiry) {
    final replyController = TextEditingController(
      text: inquiry.providerReply ?? 'Selam ${inquiry.seekerName}! Yes, viewing can be arranged. Please call me at your convenience.',
    );
    InquiryStatus selectedStatus = inquiry.status == InquiryStatus.newInquiry ? InquiryStatus.viewingArranged : inquiry.status;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                      Text('Reply to ${inquiry.seekerName}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),

                  Text('Property: ${inquiry.propertyTitle}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(8)),
                    child: Text('Seeker Message: "${inquiry.message}"', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
                  ),
                  const SizedBox(height: 16),

                  CustomTextField(
                    label: 'Your Response',
                    controller: replyController,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),

                  const Text('Update Status', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      InquiryStatus.responded,
                      InquiryStatus.viewingArranged,
                      InquiryStatus.closed,
                    ].map((status) {
                      final isSelected = selectedStatus == status;
                      return ChoiceChip(
                        label: Text(status.displayName),
                        selected: isSelected,
                        onSelected: (val) {
                          if (val) setModalState(() => selectedStatus = status);
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Send Reply & Update Status',
                    onPressed: () {
                      context.read<InquiryProvider>().respondToInquiry(
                            inquiry.id,
                            replyController.text.trim(),
                            selectedStatus,
                          );
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Response sent to house seeker!'), backgroundColor: AppColors.success),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final inquiryProvider = context.watch<InquiryProvider>();
    final inquiries = inquiryProvider.providerInquiries;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Seeker Inquiries'),
      ),
      body: inquiries.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.mark_email_unread_outlined,
              title: 'No house inquiries yet',
              description: 'When seekers find your house listings and contact you, their messages will show up here.',
            )
          : RefreshIndicator(
              onRefresh: () async {
                final user = context.read<AuthProvider>().currentUser;
                if (user != null) {
                  await inquiryProvider.fetchProviderInquiries(user.id);
                }
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: inquiries.length,
                itemBuilder: (context, index) {
                  final inquiry = inquiries[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                             CircleAvatar(
                               radius: 22,
                               backgroundColor: AppColors.primaryContainer,
                               backgroundImage: (inquiry.seekerAvatar != null && inquiry.seekerAvatar!.trim().isNotEmpty && inquiry.seekerAvatar!.startsWith('http'))
                                   ? NetworkImage(inquiry.seekerAvatar!.trim())
                                   : null,
                               child: (inquiry.seekerAvatar == null || inquiry.seekerAvatar!.trim().isEmpty || !inquiry.seekerAvatar!.startsWith('http'))
                                   ? const Icon(Icons.person, color: AppColors.primary)
                                   : null,
                             ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(inquiry.seekerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                  Text(inquiry.seekerPhone, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: inquiry.status == InquiryStatus.newInquiry ? AppColors.pendingBackground : AppColors.successBackground,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                inquiry.status.displayName,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: inquiry.status == InquiryStatus.newInquiry ? AppColors.pending : AppColors.success,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 10),

                        Text('Property: ${inquiry.propertyTitle}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
                        const SizedBox(height: 6),
                        Text('"${inquiry.message}"', style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
                        const SizedBox(height: 6),
                        Text(Formatters.formatTimeAgo(inquiry.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),

                        if (inquiry.providerReply != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: AppColors.primaryContainer, borderRadius: BorderRadius.circular(10)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Your Sent Reply:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                const SizedBox(height: 2),
                                Text(inquiry.providerReply!, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary)),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.reply_rounded, size: 16),
                            label: Text(inquiry.providerReply == null ? 'Respond to Seeker' : 'Update Reply'),
                            onPressed: () => _showReplyModal(context, inquiry),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
