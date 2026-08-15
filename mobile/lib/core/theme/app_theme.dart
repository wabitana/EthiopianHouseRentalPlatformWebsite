import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static TextTheme _getGoogleTextTheme(String fontName, TextTheme base) {
    switch (fontName.toLowerCase()) {
      case 'roboto':
        return GoogleFonts.robotoTextTheme(base);
      case 'poppins':
        return GoogleFonts.poppinsTextTheme(base);
      case 'outfit':
        return GoogleFonts.outfitTextTheme(base);
      case 'inter':
      default:
        return GoogleFonts.interTextTheme(base);
    }
  }

  static ThemeData buildLightTheme({
    Color primaryColor = AppColors.primary,
    String fontFamily = 'Inter',
    double borderRadius = 12.0,
  }) {
    final baseTextTheme = _getGoogleTextTheme(fontFamily, ThemeData.light().textTheme);

    return ThemeData(
      useMaterial3: true,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        error: AppColors.rejected,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: baseTextTheme.displayLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 32,
        ),
        headlineMedium: baseTextTheme.headlineMedium?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 22,
        ),
        titleLarge: baseTextTheme.titleLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 18,
        ),
        titleMedium: baseTextTheme.titleMedium?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
        bodyLarge: baseTextTheme.bodyLarge?.copyWith(
          color: AppColors.textPrimary,
          fontSize: 15,
        ),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
        labelLarge: baseTextTheme.labelLarge?.copyWith(
          color: AppColors.surface,
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        scrolledUnderElevation: 1,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(24),
          ),
        ),
        titleTextStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: primaryColor,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          side: BorderSide(color: primaryColor, width: 1.5),
          minimumSize: const Size(88, 44),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
      ),
    );
  }

  static ThemeData buildDarkTheme({
    Color primaryColor = AppColors.primary,
    String fontFamily = 'Inter',
    double borderRadius = 12.0,
  }) {
    const darkBg = Color(0xFF0F172A);
    const darkSurface = Color(0xFF1E293B);
    final baseTextTheme = _getGoogleTextTheme(fontFamily, ThemeData.dark().textTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: darkBg,
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: AppColors.secondary,
        surface: darkSurface,
        error: AppColors.rejected,
      ),
      textTheme: baseTextTheme,
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(24),
          ),
        ),
        titleTextStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: darkSurface,
        selectedItemColor: primaryColor,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.getFont(
          fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          side: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
      ),
    );
  }

  static ThemeData get lightTheme => buildLightTheme();
}
