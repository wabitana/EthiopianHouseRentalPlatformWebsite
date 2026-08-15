import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';
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

  @override
  Widget build(BuildContext context) {
    return Container(
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
                inquiry.propertyImage,
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

          // Message Thread
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Sent Message
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Your Message:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                          Text(Formatters.formatTimeAgo(inquiry.createdAt), style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(inquiry.message, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
                    ],
                  ),
                ),

                // Provider Reply
                if (inquiry.providerReply != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.verified_user, size: 14, color: AppColors.primary),
                            const SizedBox(width: 4),
                            const Text('Provider Reply:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.successBackground,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                inquiry.status.displayName,
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(inquiry.providerReply!, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ] else ...[
                  const SizedBox(height: 10),
                  Row(
                    children: const [
                      Icon(Icons.hourglass_empty, size: 14, color: AppColors.pending),
                      SizedBox(width: 4),
                      Text('Awaiting provider response...', style: TextStyle(fontSize: 12, color: AppColors.pending, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
