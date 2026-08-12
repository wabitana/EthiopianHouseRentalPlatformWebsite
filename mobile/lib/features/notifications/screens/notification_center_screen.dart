import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/notification_model.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/notification_provider.dart';
import '../../auth/providers/auth_provider.dart';

class NotificationCenterScreen extends StatelessWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notificationProvider = context.watch<NotificationProvider>();
    final user = context.watch<AuthProvider>().currentUser;
    final notifications = notificationProvider.notifications;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notification Center'),
        actions: [
          if (notificationProvider.unreadCount > 0)
            TextButton(
              onPressed: () {
                if (user != null) {
                  notificationProvider.markAllAsRead(user.id);
                }
              },
              child: const Text('Mark all read', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.notifications_none_rounded,
              title: 'No notifications yet',
              description: 'Updates about your inquiries, house listings, and system alerts will appear here.',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notif = notifications[index];
                return _NotificationTile(
                  notification: notif,
                  onTap: () {
                    notificationProvider.markAsRead(notif.id);
                  },
                );
              },
            ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const _NotificationTile({
    required this.notification,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    IconData icon;
    Color iconColor;

    switch (notification.type) {
      case NotificationType.inquiryReply:
        icon = Icons.chat_bubble_outline;
        iconColor = AppColors.primary;
        break;
      case NotificationType.propertyApproved:
        icon = Icons.verified_rounded;
        iconColor = AppColors.success;
        break;
      case NotificationType.propertyRejected:
        icon = Icons.error_outline;
        iconColor = AppColors.rejected;
        break;
      case NotificationType.propertyRented:
        icon = Icons.key_rounded;
        iconColor = AppColors.rented;
        break;
      case NotificationType.newInquiry:
        icon = Icons.mail_outline_rounded;
        iconColor = AppColors.secondary;
        break;
      case NotificationType.systemAlert:
        icon = Icons.info_outline_rounded;
        iconColor = AppColors.primary;
        break;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notification.isRead ? AppColors.surface : AppColors.primaryContainer.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notification.isRead ? AppColors.border : AppColors.primary.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        notification.title,
                        style: TextStyle(
                          fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.bold,
                          fontSize: 14,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        Formatters.formatTimeAgo(notification.createdAt),
                        style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.message,
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
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
