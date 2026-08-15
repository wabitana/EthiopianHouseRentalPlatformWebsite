import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/core/theme/theme_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ThemeProvider Unit Tests', () {
    test('Default values are initialized properly', () {
      final provider = ThemeProvider();
      expect(provider.themeMode, equals(ThemeMode.light));
      expect(provider.fontFamily, equals('Inter'));
      expect(provider.borderRadius, equals(12.0));
      expect(provider.compactLayout, equals(false));
      expect(provider.enableAnimations, equals(true));
    });

    test('setThemeMode updates themeMode reactively', () async {
      final provider = ThemeProvider();
      await provider.setThemeMode(ThemeMode.dark);
      expect(provider.themeMode, equals(ThemeMode.dark));
    });

    test('setPrimaryColor updates accent color', () async {
      final provider = ThemeProvider();
      const newColor = Color(0xFFEC4899);
      await provider.setPrimaryColor(newColor);
      expect(provider.primaryColor, equals(newColor));
    });

    test('setFontFamily updates typography family', () async {
      final provider = ThemeProvider();
      await provider.setFontFamily('Poppins');
      expect(provider.fontFamily, equals('Poppins'));
    });

    test('setBorderRadius updates radius value', () async {
      final provider = ThemeProvider();
      await provider.setBorderRadius(24.0);
      expect(provider.borderRadius, equals(24.0));
    });

    test('resetToDefaults restores default values', () async {
      final provider = ThemeProvider();
      await provider.setThemeMode(ThemeMode.dark);
      await provider.setFontFamily('Outfit');
      await provider.resetToDefaults();

      expect(provider.themeMode, equals(ThemeMode.light));
      expect(provider.fontFamily, equals('Inter'));
    });
  });
}
