import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'inquiry_chat_screen.dart';
import 'property_detail_screen.dart';

class SeekerInquiriesScreen extends StatelessWidget {
  const SeekerInquiriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final inquiryProvider = context.watch<InquiryProvider>();
    final inquiries = inquiryProvider.seekerInquiries;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Inquiries'),
      ),
      body: inquiryProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : inquiries.isEmpty
              ? const EmptyStateWidget(
                  icon: Icons.chat_bubble_outline_rounded,
                  title: 'No inquiries sent yet',
                  description: 'When you contact house providers, your messages and their replies will appear here.',
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    final user = context.read<AuthProvider>().currentUser;
                    if (user != null) {
                      await inquiryProvider.fetchSeekerInquiries(user.id);
                    }
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: inquiries.length,
                    itemBuilder: (context, index) {
                      final inquiry = inquiries[index];
                      return _InquiryCard(inquiry: inquiry);
                    },
                  ),
                ),
    );
  }
}

class _InquiryCard extends StatelessWidget {
  final InquiryModel inquiry;

  const _InquiryCard({required this.inquiry});

  void _openChat(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InquiryChatScreen(inquiry: inquiry),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lastMessage = inquiry.messages.isNotEmpty
        ? inquiry.messages.last
        : null;

    return InkWell(
      onTap: () => _openChat(context),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: AppColors.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Property Info
            ListTile(
              contentPadding: const EdgeInsets.all(12),
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  Formatters.formatImageUrl(inquiry.propertyImage),
                  width: 54,
                  height: 54,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(width: 54, height: 54, color: AppColors.surfaceVariant),
                ),
              ),
              title: Text(
                inquiry.propertyTitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              subtitle: Text(
                '${Formatters.formatCurrency(inquiry.propertyPrice)} • ${inquiry.propertyArea}, ${inquiry.propertyCity}',
                style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
              ),
              trailing: IconButton(
                icon: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => PropertyDetailScreen(propertyId: inquiry.propertyId),
                    ),
                  );
                },
              ),
            ),
            const Divider(height: 1),

            // Message Preview Thread
            Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Latest Message preview
                  if (lastMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: lastMessage.senderRole == 'provider'
                            ? AppColors.primaryContainer
                            : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: lastMessage.senderRole == 'provider'
                              ? AppColors.primary.withValues(alpha: 0.2)
                              : AppColors.border,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                lastMessage.senderRole == 'provider' ? 'Provider Reply:' : 'Your Message:',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: lastMessage.senderRole == 'provider' ? AppColors.primary : AppColors.textSecondary,
                                ),
                              ),
                              Text(Formatters.formatTimeAgo(lastMessage.createdAt), style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(lastMessage.text, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
                        ],
                      ),
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(inquiry.message, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
                    ),
                  ],

                  const SizedBox(height: 12),
                  // Chat Action Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _openChat(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      icon: const Icon(Icons.chat_bubble_rounded, size: 16),
                      label: Text(
                        inquiry.providerReply != null ? 'Open Chat & Reply' : 'Open Chat',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
