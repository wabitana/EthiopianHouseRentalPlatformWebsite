import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../house_seeker/providers/inquiry_provider.dart';
import '../../house_seeker/screens/inquiry_chat_screen.dart';
import '../../auth/providers/auth_provider.dart';

class ProviderInquiriesScreen extends StatelessWidget {
  const ProviderInquiriesScreen({super.key});

  void _openChat(BuildContext context, InquiryModel inquiry) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryChatScreen(inquiry: inquiry),
      ),
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
                  final lastMessage = inquiry.messages.isNotEmpty ? inquiry.messages.last : null;

                  return InkWell(
                    onTap: () => _openChat(context, inquiry),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
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
                                backgroundImage: (inquiry.seekerAvatar != null &&
                                        inquiry.seekerAvatar!.trim().isNotEmpty &&
                                        inquiry.seekerAvatar!.startsWith('http'))
                                    ? NetworkImage(inquiry.seekerAvatar!.trim())
                                    : null,
                                child: (inquiry.seekerAvatar == null ||
                                        inquiry.seekerAvatar!.trim().isEmpty ||
                                        !inquiry.seekerAvatar!.startsWith('http'))
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
                          if (lastMessage != null) ...[
                            Text(
                              '${lastMessage.senderRole == 'provider' ? 'You' : inquiry.seekerName}: "${lastMessage.text}"',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                            ),
                          ] else ...[
                            Text('"${inquiry.message}"', style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
                          ],
                          const SizedBox(height: 6),
                          Text(Formatters.formatTimeAgo(inquiry.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),

                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _openChat(context, inquiry),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              icon: const Icon(Icons.chat_rounded, size: 16),
                              label: Text(
                                inquiry.providerReply == null ? 'Chat & Reply to Seeker' : 'Open WhatsApp-Style Chat',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
