import '../../shared/models/user_model.dart';

class LocalStorageService {
  static final Map<String, dynamic> _inMemoryStorage = {};

  static Future<void> saveUserRole(UserRole role) async {
    _inMemoryStorage['user_role'] = role.code;
  }

  static Future<UserRole?> getUserRole() async {
    final code = _inMemoryStorage['user_role'] as String?;
    if (code == null) return null;
    return UserRoleExtension.fromCode(code);
  }

  static Future<void> saveFavorites(Set<String> propertyIds) async {
    _inMemoryStorage['favorite_ids'] = propertyIds.toList();
  }

  static Future<Set<String>> getFavorites() async {
    final list = _inMemoryStorage['favorite_ids'] as List<dynamic>?;
    if (list == null) return {'prop_1', 'prop_3'};
    return list.cast<String>().toSet();
  }

  static Future<void> saveLanguageCode(String code) async {
    _inMemoryStorage['language_code'] = code;
  }

  static Future<String?> getLanguageCode() async {
    return _inMemoryStorage['language_code'] as String?;
  }

  static String? getString(String key) => _inMemoryStorage[key] as String?;
  static Future<void> setString(String key, String val) async => _inMemoryStorage[key] = val;

  static int? getInt(String key) => _inMemoryStorage[key] as int?;
  static Future<void> setInt(String key, int val) async => _inMemoryStorage[key] = val;

  static double? getDouble(String key) => _inMemoryStorage[key] as double?;
  static Future<void> setDouble(String key, double val) async => _inMemoryStorage[key] = val;

  static bool? getBool(String key) => _inMemoryStorage[key] as bool?;
  static Future<void> setBool(String key, bool val) async => _inMemoryStorage[key] = val;

  static Future<void> remove(String key) async => _inMemoryStorage.remove(key);

  static Future<void> clearSession() async {
    _inMemoryStorage.clear();
  }
}
