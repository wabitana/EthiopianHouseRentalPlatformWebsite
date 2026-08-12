import 'package:flutter/material.dart';
import '../constants/app_strings.dart';
import '../storage/local_storage.dart';

class LanguageProvider extends ChangeNotifier {
  AppLanguage _currentLanguage = AppLanguage.english;

  LanguageProvider() {
    _loadLanguage();
  }

  AppLanguage get currentLanguage => _currentLanguage;

  Future<void> _loadLanguage() async {
    final savedCode = await LocalStorageService.getLanguageCode();
    if (savedCode != null) {
      _currentLanguage = AppLanguageExtension.fromCode(savedCode);
      notifyListeners();
    }
  }

  Future<void> setLanguage(AppLanguage language) async {
    _currentLanguage = language;
    await LocalStorageService.saveLanguageCode(language.code);
    notifyListeners();
  }
}
