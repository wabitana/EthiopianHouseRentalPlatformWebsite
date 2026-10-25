import 'package:intl/intl.dart';
import '../constants/api_endpoints.dart';
import '../services/currency_service.dart';

class Formatters {
  static String formatCurrency(double amount) {
    return CurrencyProvider.formatStatic(amount);
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

    // Rewrite any hardcoded localhost, 127.0.0.1, or 10.0.2.2 URLs to the active mediaBaseUrl
    final localhostRegex = RegExp(r'^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/.*)?$');
    final match = localhostRegex.firstMatch(trimmed);
    if (match != null) {
      final pathPart = match.group(3) ?? '';
      return '${ApiEndpoints.mediaBaseUrl}$pathPart';
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
