import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Configurable base URL:
  // Android Emulator: 10.0.2.2:3000
  // Windows Desktop / iOS / Web: localhost:3000
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api/v1';
    } else {
      return 'http://localhost:3000/api/v1';
    }
  }

  static String get mediaBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000';
    } else {
      return 'http://localhost:3000';
    }
  }

  // Auth endpoints
  static String get register => '$baseUrl/auth/register';
  static String get verifyEmail => '$baseUrl/auth/verify-email';
  static String get sendPhoneOtp => '$baseUrl/auth/send-phone-otp';
  static String get verifyPhoneOtp => '$baseUrl/auth/verify-phone-otp';
  static String get refreshToken => '$baseUrl/auth/refresh-token';
  static String get login => '$baseUrl/auth/login';
  static String get google => '$baseUrl/auth/google';
  static String get logout => '$baseUrl/auth/logout';
  static String get me => '$baseUrl/users/me';
  static String get verifyIdentity => '$baseUrl/auth/verify-identity';

  // Properties endpoints
  static String get properties => '$baseUrl/properties';
  static String propertyDetail(String id) => '$baseUrl/properties/$id';
  static String propertyAvailability(String id) => '$baseUrl/properties/$id/availability';

  // Provider endpoints
  static String get providerProperties => '$baseUrl/provider/properties';
  static String get providerInquiries => '$baseUrl/provider/inquiries';
  static String get providerAnalytics => '$baseUrl/properties/provider/analytics';

  // Favorites endpoints
  static String get favorites => '$baseUrl/favorites';
  static String favoriteItem(String propertyId) => '$baseUrl/favorites/$propertyId';

  // Inquiries endpoints
  static String get inquiries => '$baseUrl/inquiries';
  static String inquiryDetail(String id) => '$baseUrl/inquiries/$id';

  // Notifications & Reports & Upload
  static String get notifications => '$baseUrl/notifications';
  static String readNotification(String id) => '$baseUrl/notifications/$id/read';
  static String get reports => '$baseUrl/reports';
  static String get upload => '$baseUrl/upload';
  static String get aiChat => '$baseUrl/ai/chat';
  static String get aiRecommendations => '$baseUrl/ai/recommendations';
  static String get aiMatchScore => '$baseUrl/ai/property-match-score';
}
