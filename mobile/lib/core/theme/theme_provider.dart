import 'package:flutter/material.dart';
import '../storage/local_storage.dart';
import 'app_colors.dart';

enum AppFontSize { small, normal, large, extraLarge }

extension AppFontSizeExtension on AppFontSize {
  String get displayName {
    switch (this) {
      case AppFontSize.small:
        return 'Small';
      case AppFontSize.normal:
        return 'Normal';
      case AppFontSize.large:
        return 'Large';
      case AppFontSize.extraLarge:
        return 'Extra Large';
    }
  }

  double get scaleFactor {
    switch (this) {
      case AppFontSize.small:
        return 0.9;
      case AppFontSize.normal:
        return 1.0;
      case AppFontSize.large:
        return 1.1;
      case AppFontSize.extraLarge:
        return 1.25;
    }
  }
}

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  Color _primaryColor = AppColors.primary; // Ethiopian Emerald Green (0xFF1B4D3E)
  AppFontSize _fontSize = AppFontSize.normal;
  String _fontFamily = 'Inter';
  double _borderRadius = 12.0;
  bool _compactLayout = false;
  bool _enableAnimations = true;

  // Available Accent Palette
  static const List<Color> availableColors = [
    Color(0xFF1B4D3E), // Ethiopian Emerald Green (Default)
    Color(0xFFF97316), // Vivid Orange
    Color(0xFFEF4444), // Crimson Red
    Color(0xFFEC4899), // Pink
    Color(0xFF8B5CF6), // Purple
    Color(0xFF6366F1), // Indigo
    Color(0xFF3B82F6), // Blue
    Color(0xFF06B6D4), // Cyan
    Color(0xFF14B8A6), // Teal
    Color(0xFF10B981), // Emerald Green
    Color(0xFFF59E0B), // Amber Gold
    Color(0xFF64748B), // Slate Grey
  ];

  static const List<String> availableFonts = ['Inter', 'Roboto', 'Poppins', 'Outfit'];
  static const List<double> availableRadii = [4.0, 8.0, 12.0, 16.0, 24.0];

  ThemeMode get themeMode => _themeMode;
  Color get primaryColor => _primaryColor;
  AppFontSize get fontSize => _fontSize;
  String get fontFamily => _fontFamily;
  double get borderRadius => _borderRadius;
  bool get compactLayout => _compactLayout;
  bool get enableAnimations => _enableAnimations;

  ThemeProvider() {
    _loadFromStorage();
  }

  void _loadFromStorage() {
    final modeStr = LocalStorageService.getString('theme_mode');
    if (modeStr != null) {
      if (modeStr == 'dark') _themeMode = ThemeMode.dark;
      if (modeStr == 'system') _themeMode = ThemeMode.system;
      if (modeStr == 'light') _themeMode = ThemeMode.light;
    }

    final colorVal = LocalStorageService.getInt('primary_color');
    if (colorVal != null) {
      _primaryColor = Color(colorVal);
    }

    final fontStr = LocalStorageService.getString('font_family');
    if (fontStr != null && availableFonts.contains(fontStr)) {
      _fontFamily = fontStr;
    }

    final sizeStr = LocalStorageService.getString('font_size');
    if (sizeStr != null) {
      for (final s in AppFontSize.values) {
        if (s.name == sizeStr) {
          _fontSize = s;
          break;
        }
      }
    }

    final radiusVal = LocalStorageService.getDouble('border_radius');
    if (radiusVal != null) {
      _borderRadius = radiusVal;
    }

    _compactLayout = LocalStorageService.getBool('compact_layout') ?? false;
    _enableAnimations = LocalStorageService.getBool('enable_animations') ?? true;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    await LocalStorageService.setString('theme_mode', mode.name);
  }

  Future<void> setPrimaryColor(Color color) async {
    _primaryColor = color;
    notifyListeners();
    await LocalStorageService.setInt('primary_color', color.toARGB32());
  }

  Future<void> setFontSize(AppFontSize size) async {
    _fontSize = size;
    notifyListeners();
    await LocalStorageService.setString('font_size', size.name);
  }

  Future<void> setFontFamily(String font) async {
    _fontFamily = font;
    notifyListeners();
    await LocalStorageService.setString('font_family', font);
  }

  Future<void> setBorderRadius(double radius) async {
    _borderRadius = radius;
    notifyListeners();
    await LocalStorageService.setDouble('border_radius', radius);
  }

  Future<void> setCompactLayout(bool val) async {
    _compactLayout = val;
    notifyListeners();
    await LocalStorageService.setBool('compact_layout', val);
  }

  Future<void> setEnableAnimations(bool val) async {
    _enableAnimations = val;
    notifyListeners();
    await LocalStorageService.setBool('enable_animations', val);
  }

  Future<void> resetToDefaults() async {
    _themeMode = ThemeMode.light;
    _primaryColor = AppColors.primary;
    _fontSize = AppFontSize.normal;
    _fontFamily = 'Inter';
    _borderRadius = 12.0;
    _compactLayout = false;
    _enableAnimations = true;
    notifyListeners();

    await LocalStorageService.remove('theme_mode');
    await LocalStorageService.remove('primary_color');
    await LocalStorageService.remove('font_size');
    await LocalStorageService.remove('font_family');
    await LocalStorageService.remove('border_radius');
    await LocalStorageService.remove('compact_layout');
    await LocalStorageService.remove('enable_animations');
  }
}
