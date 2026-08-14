import 'package:intl/intl.dart';
import '../constants/api_endpoints.dart';

class Formatters {
  static String formatCurrency(double amount) {
    final formatter = NumberFormat('#,##0', 'en_US');
    return '${formatter.format(amount)} ETB';
  }

  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  static String formatTimeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return formatDate(date);
    } else if (difference.inDays >= 1) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours >= 1) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes >= 1) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }

  static String formatImageUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    var trimmed = url.trim();
    
    // Clean up any legacy URLs containing /api/v1/uploads
    if (trimmed.contains('/api/v1/uploads/')) {
      trimmed = trimmed.replaceAll('/api/v1/uploads/', '/uploads/');
    }

    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return '${ApiEndpoints.mediaBaseUrl}$trimmed';
    }
    return '${ApiEndpoints.mediaBaseUrl}/$trimmed';
  }
}
