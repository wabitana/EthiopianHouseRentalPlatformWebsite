import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static bool _dotenvInitialized = false;

  static Future<void> init() async {
    try {
      await dotenv.load(fileName: ".env");
      _dotenvInitialized = true;
    } catch (e) {
      debugPrint('Note: .env initialization skipped: $e');
    }
  }

  static String get googleWebClientId {
    const compileTimeEnv = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID');
    if (compileTimeEnv.isNotEmpty) return compileTimeEnv;
    if (_dotenvInitialized) {
      return dotenv.env['GOOGLE_WEB_CLIENT_ID'] ?? dotenv.env['GOOGLE_CLIENT_ID'] ?? '';
    }
    return '';
  }

  static String get googleAndroidClientId {
    const compileTimeEnv = String.fromEnvironment('GOOGLE_ANDROID_CLIENT_ID');
    if (compileTimeEnv.isNotEmpty) return compileTimeEnv;
    if (_dotenvInitialized) {
      return dotenv.env['GOOGLE_ANDROID_CLIENT_ID'] ?? '';
    }
    return '';
  }

  static String get googleServerClientId {
    const compileTimeEnv = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');
    if (compileTimeEnv.isNotEmpty) return compileTimeEnv;
    if (_dotenvInitialized) {
      return dotenv.env['GOOGLE_SERVER_CLIENT_ID'] ?? '';
    }
    return '';
  }
}
