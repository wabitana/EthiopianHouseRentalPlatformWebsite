import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../mock_data.dart';
import '../../shared/models/notification_model.dart';

abstract class NotificationRepository {
  Future<List<NotificationModel>> getNotifications(String userId);
  Future<void> markAsRead(String notificationId);
  Future<void> markAllAsRead(String userId);
}

class ApiNotificationRepository implements NotificationRepository {
  @override
  Future<List<NotificationModel>> getNotifications(String userId) async {
    try {
      final res = await ApiClient.get(ApiEndpoints.notifications);
      if (res is List) {
        return res.map((item) => NotificationModel.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return MockNotificationRepository().getNotifications(userId);
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    try {
      await ApiClient.patch(ApiEndpoints.readNotification(notificationId));
    } catch (_) {}
  }

  @override
  Future<void> markAllAsRead(String userId) async {
    try {
      final list = await getNotifications(userId);
      for (final n in list) {
        if (!n.isRead) {
          await markAsRead(n.id);
        }
      }
    } catch (_) {}
  }
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
