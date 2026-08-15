import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class UserSettingsService {
  static const _key2FAEnabled = 'settings_2fa_enabled';
  static const _key2FAInquiry = 'settings_2fa_inquiry';

  static const _keyPushAlerts = 'settings_push_alerts';
  static const _keyEmailDigest = 'settings_email_digest';
  static const _keySmsAlerts = 'settings_sms_alerts';
  static const _keyPriceDropAlerts = 'settings_price_drop_alerts';

  static const _keyPreferredSubcity = 'settings_preferred_subcity';
  static const _keySearchRadiusKm = 'settings_search_radius_km';

  static const _keyPreferredCurrency = 'settings_preferred_currency';
  static const _keyBudgetMin = 'settings_budget_min';
  static const _keyBudgetMax = 'settings_budget_max';

  static const _keySavedSearches = 'settings_saved_searches';

  // 2FA Settings
  static Future<bool> get2FAEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_key2FAEnabled) ?? true;
  }

  static Future<void> set2FAEnabled(bool val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key2FAEnabled, val);
  }

  static Future<bool> get2FAInquiry() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_key2FAInquiry) ?? true;
  }

  static Future<void> set2FAInquiry(bool val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key2FAInquiry, val);
  }

  // Notification Settings
  static Future<Map<String, bool>> getNotificationSettings() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'pushAlerts': prefs.getBool(_keyPushAlerts) ?? true,
      'emailDigest': prefs.getBool(_keyEmailDigest) ?? true,
      'smsAlerts': prefs.getBool(_keySmsAlerts) ?? true,
      'priceDropAlerts': prefs.getBool(_keyPriceDropAlerts) ?? true,
    };
  }

  static Future<void> saveNotificationSettings({
    required bool pushAlerts,
    required bool emailDigest,
    required bool smsAlerts,
    required bool priceDropAlerts,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyPushAlerts, pushAlerts);
    await prefs.setBool(_keyEmailDigest, emailDigest);
    await prefs.setBool(_keySmsAlerts, smsAlerts);
    await prefs.setBool(_keyPriceDropAlerts, priceDropAlerts);
  }

  // Location Preferences
  static Future<String> getPreferredSubcity() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyPreferredSubcity) ?? 'Bole';
  }

  static Future<double> getSearchRadiusKm() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_keySearchRadiusKm) ?? 10.0;
  }

  static Future<void> saveLocationPreferences(String subcity, double radiusKm) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyPreferredSubcity, subcity);
    await prefs.setDouble(_keySearchRadiusKm, radiusKm);
  }

  // Currency & Budget
  static Future<String> getPreferredCurrency() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyPreferredCurrency) ?? 'ETB';
  }

  static Future<Map<String, double>> getBudgetRange() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'min': prefs.getDouble(_keyBudgetMin) ?? 10000.0,
      'max': prefs.getDouble(_keyBudgetMax) ?? 45000.0,
    };
  }

  static Future<void> saveCurrencyAndBudget(String currency, double min, double max) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyPreferredCurrency, currency);
    await prefs.setDouble(_keyBudgetMin, min);
    await prefs.setDouble(_keyBudgetMax, max);
  }

  // Saved Searches
  static Future<List<String>> getSavedSearches() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_keySavedSearches);
    if (str != null) {
      try {
        final List<dynamic> list = jsonDecode(str);
        return list.cast<String>();
      } catch (_) {}
    }
    return ['2 Bed in Bole under 25,000 ETB', 'Studio near Sarbet'];
  }

  static Future<void> addSavedSearch(String query) async {
    final list = await getSavedSearches();
    if (!list.contains(query)) {
      list.add(query);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keySavedSearches, jsonEncode(list));
    }
  }

  // Storage Cleaner
  static Future<void> clearTempStorage() async {
    final prefs = await SharedPreferences.getInstance();
    // Keep user token and credentials, remove cached temporary settings & map tiles data
    await prefs.remove('temp_photo_cache');
    await prefs.remove('temp_map_tiles');
  }
}
