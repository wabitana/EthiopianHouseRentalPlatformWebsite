import 'package:flutter/material.dart';
import '../../../data/repositories/notification_repository.dart';
import '../../../shared/models/notification_model.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationRepository _notificationRepository;

  List<NotificationModel> _notifications = [];
  bool _isLoading = false;

  NotificationProvider({NotificationRepository? notificationRepository})
      : _notificationRepository = notificationRepository ?? ApiNotificationRepository();

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;
  bool get isLoading => _isLoading;

  Future<void> fetchNotifications(String userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _notifications = await _notificationRepository.getNotifications(userId);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String notificationId) async {
    await _notificationRepository.markAsRead(notificationId);
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      notifyListeners();
    }
  }

  Future<void> markAllAsRead(String userId) async {
    await _notificationRepository.markAllAsRead(userId);
    for (int i = 0; i < _notifications.length; i++) {
      _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
    notifyListeners();
  }
}
