import '../mock_data.dart';
import '../../shared/models/notification_model.dart';

abstract class NotificationRepository {
  Future<List<NotificationModel>> getNotifications(String userId);
  Future<void> markAsRead(String notificationId);
  Future<void> markAllAsRead(String userId);
}

class MockNotificationRepository implements NotificationRepository {
  final List<NotificationModel> _notifications = List.from(MockData.mockNotifications);

  @override
  Future<List<NotificationModel>> getNotifications(String userId) async {
    await Future.delayed(const Duration(milliseconds: 250));
    return _notifications.where((n) => n.userId == userId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  @override
  Future<void> markAllAsRead(String userId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    for (int i = 0; i < _notifications.length; i++) {
      if (_notifications[i].userId == userId) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
      }
    }
  }
}
