import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_colors.dart';

enum AppFontSize { small, medium, large }

extension AppFontSizeExtension on AppFontSize {
  String get displayName {
    switch (this) {
      case AppFontSize.small:
        return 'Small';
      case AppFontSize.medium:
        return 'Medium';
      case AppFontSize.large:
        return 'Large';
    }
  }

  double get scaleFactor {
    switch (this) {
      case AppFontSize.small:
        return 0.9;
      case AppFontSize.medium:
        return 1.0;
      case AppFontSize.large:
        return 1.15;
    }
  }
}

class ThemeProvider extends ChangeNotifier {
  static const String _themePrefKey = 'app_theme_mode';
  ThemeMode _themeMode = ThemeMode.light;

  Color _primaryColor = AppColors.primary;
  String _fontFamily = 'Roboto';
  double _borderRadius = 12.0;
  AppFontSize _fontSize = AppFontSize.medium;
  bool _compactLayout = false;
  bool _enableAnimations = true;

  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;
  Color get primaryColor => _primaryColor;
  String get fontFamily => _fontFamily;
  double get borderRadius => _borderRadius;
  AppFontSize get fontSize => _fontSize;
  bool get compactLayout => _compactLayout;
  bool get enableAnimations => _enableAnimations;

  static List<Color> get availableColors => [
        AppColors.primary,
        const Color(0xFF1E88E5),
        const Color(0xFF00897B),
        const Color(0xFF8E24AA),
        const Color(0xFFF57C00),
      ];

  static List<String> get availableFonts => ['Roboto', 'Inter', 'Poppins', 'Outfit'];
  static List<double> get availableRadii => [8.0, 12.0, 16.0, 20.0];

  ThemeProvider() {
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isDark = prefs.getBool(_themePrefKey);
      if (isDark != null) {
        _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> toggleTheme(bool isDark) async {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themePrefKey, isDark);
    } catch (_) {}
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
  }

  Future<void> setPrimaryColor(Color color) async {
    _primaryColor = color;
    notifyListeners();
  }

  Future<void> setFontFamily(String family) async {
    _fontFamily = family;
    notifyListeners();
  }

  Future<void> setBorderRadius(double radius) async {
    _borderRadius = radius;
    notifyListeners();
  }

  Future<void> setFontSize(AppFontSize size) async {
    _fontSize = size;
    notifyListeners();
  }

  Future<void> setCompactLayout(bool compact) async {
    _compactLayout = compact;
    notifyListeners();
  }

  Future<void> setEnableAnimations(bool enable) async {
    _enableAnimations = enable;
    notifyListeners();
  }

  Future<void> resetToDefaults() async {
    _themeMode = ThemeMode.light;
    _primaryColor = AppColors.primary;
    _fontFamily = 'Roboto';
    _borderRadius = 12.0;
    _fontSize = AppFontSize.medium;
    _compactLayout = false;
    _enableAnimations = true;
    notifyListeners();
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: const Color(0xFF12181B),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E262B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: const Color(0xFF1E262B),
      ),
    );
  }
}
