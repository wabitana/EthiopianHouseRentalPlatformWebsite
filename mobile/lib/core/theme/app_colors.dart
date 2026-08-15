import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF1B4D3E); // Ethiopian Emerald Green
  static const Color primaryDark = Color(0xFF12342A);
  static const Color primaryLight = Color(0xFF2E6F5B);
  static const Color primaryContainer = Color(0xFFE8F3EF);

  static const Color secondary = Color(0xFFD97706); // Ethiopian Warm Gold/Amber
  static const Color secondaryLight = Color(0xFFFEF3C7);

  // Background & Neutral
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);

  // Border & Divider
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFF1F5F9);

  // Status & Badges
  static const Color success = Color(0xFF059669);
  static const Color successBackground = Color(0xFFD1FAE5);

  static const Color pending = Color(0xFFD97706);
  static const Color pendingBackground = Color(0xFFFEF3C7);

  static const Color rejected = Color(0xFFDC2626);
  static const Color rejectedBackground = Color(0xFFFEE2E2);

  static const Color rented = Color(0xFF4F46E5);
  static const Color rentedBackground = Color(0xFFE0E7FF);

  static const Color verified = Color(0xFF2563EB);
  static const Color verifiedBackground = Color(0xFFDBEAFE);

  // Card Shadow
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> hoverShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 18,
      offset: const Offset(0, 6),
    ),
  ];
}
