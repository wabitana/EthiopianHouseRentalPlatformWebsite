import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/theme/app_colors.dart';

class ThemeSettingsScreen extends StatelessWidget {
  const ThemeSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final primary = themeProvider.primaryColor;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('App Theme'),
        centerTitle: true,
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(24),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: Colors.white),
            tooltip: 'Reset to Defaults',
            onPressed: () {
              themeProvider.resetToDefaults();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Theme reset to default Ethiopian Emerald Green!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Live Theme Preview Card
            _buildThemePreviewCard(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 2. Appearance Mode
            _buildSectionHeader('APPEARANCE MODE'),
            const SizedBox(height: 10),
            _buildAppearanceModeSelector(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 3. Accent Color Palette
            _buildSectionHeader('ACCENT COLOR'),
            const SizedBox(height: 10),
            _buildAccentColorPicker(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 4. Font Size
            _buildSectionHeader('FONT SIZE'),
            const SizedBox(height: 10),
            _buildFontSizeSelector(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 5. Font Family
            _buildSectionHeader('FONT FAMILY'),
            const SizedBox(height: 10),
            _buildFontFamilySelector(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 6. Corner Radius
            _buildSectionHeader('CORNER RADIUS'),
            const SizedBox(height: 10),
            _buildCornerRadiusSelector(context, themeProvider, primary),
            const SizedBox(height: 24),

            // 7. More Options
            _buildSectionHeader('MORE OPTIONS'),
            const SizedBox(height: 10),
            _buildMoreOptions(context, themeProvider, primary),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.8,
        color: AppColors.textMuted,
      ),
    );
  }

  // 1. Live Theme Preview Card
  Widget _buildThemePreviewCard(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: primary,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.palette_outlined, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Theme Preview',
                      style: GoogleFonts.getFont(
                        themeProvider.fontFamily,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Live preview of your settings',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Sample Preview Buttons
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(themeProvider.borderRadius),
                  ),
                  child: Center(
                    child: Text(
                      'Button',
                      style: GoogleFonts.getFont(
                        themeProvider.fontFamily,
                        color: primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white, width: 1.5),
                    borderRadius: BorderRadius.circular(themeProvider.borderRadius),
                  ),
                  child: Center(
                    child: Text(
                      themeProvider.fontFamily,
                      style: GoogleFonts.getFont(
                        themeProvider.fontFamily,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Appearance Mode Selector (Light, Dark, System)
  Widget _buildAppearanceModeSelector(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _buildModeOption(
            context,
            label: 'Light',
            icon: Icons.wb_sunny_outlined,
            isSelected: themeProvider.themeMode == ThemeMode.light,
            onTap: () => themeProvider.setThemeMode(ThemeMode.light),
            primary: primary,
          ),
          _buildModeOption(
            context,
            label: 'Dark',
            icon: Icons.nightlight_round_outlined,
            isSelected: themeProvider.themeMode == ThemeMode.dark,
            onTap: () => themeProvider.setThemeMode(ThemeMode.dark),
            primary: primary,
          ),
          _buildModeOption(
            context,
            label: 'System',
            icon: Icons.space_dashboard_outlined,
            isSelected: themeProvider.themeMode == ThemeMode.system,
            onTap: () => themeProvider.setThemeMode(ThemeMode.system),
            primary: primary,
          ),
        ],
      ),
    );
  }

  Widget _buildModeOption(
    BuildContext context, {
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
    required Color primary,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? primary : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: isSelected ? Colors.white : AppColors.textMuted, size: 22),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 3. Accent Color Picker (12 Curated Palette Items)
  Widget _buildAccentColorPicker(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Wrap(
        spacing: 16,
        runSpacing: 16,
        alignment: WrapAlignment.start,
        children: ThemeProvider.availableColors.map((color) {
          final isSelected = themeProvider.primaryColor.toARGB32() == color.toARGB32();
          return GestureDetector(
            onTap: () => themeProvider.setPrimaryColor(color),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
                border: isSelected ? Border.all(color: Colors.black, width: 2.5) : null,
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: color.withValues(alpha: 0.4),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
              child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 22) : null,
            ),
          );
        }).toList(),
      ),
    );
  }

  // 4. Font Size Selector
  Widget _buildFontSizeSelector(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: AppFontSize.values.map((size) {
              final isSelected = themeProvider.fontSize == size;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: GestureDetector(
                    onTap: () => themeProvider.setFontSize(size),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? primary : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          size.displayName,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Text(
            'The quick brown fox jumps over the lazy dog.',
            style: GoogleFonts.getFont(
              themeProvider.fontFamily,
              fontSize: 14 * themeProvider.fontSize.scaleFactor,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // 5. Font Family Selector
  Widget _buildFontFamilySelector(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: ThemeProvider.availableFonts.map((font) {
          final isSelected = themeProvider.fontFamily == font;
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 4),
            decoration: BoxDecoration(
              color: isSelected ? primary.withValues(alpha: 0.08) : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
            ),
            child: ListTile(
              onTap: () => themeProvider.setFontFamily(font),
              leading: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected ? primary.withValues(alpha: 0.15) : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Aa',
                  style: GoogleFonts.getFont(
                    font,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? primary : AppColors.textSecondary,
                    fontSize: 15,
                  ),
                ),
              ),
              title: Text(
                font,
                style: GoogleFonts.getFont(
                  font,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 16,
                  color: isSelected ? primary : AppColors.textPrimary,
                ),
              ),
              trailing: isSelected
                  ? Icon(Icons.check_circle_rounded, color: primary, size: 22)
                  : const Icon(Icons.radio_button_off_rounded, color: AppColors.textMuted, size: 22),
            ),
          );
        }).toList(),
      ),
    );
  }

  // 6. Corner Radius Selector
  Widget _buildCornerRadiusSelector(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: ThemeProvider.availableRadii.map((radius) {
          final isSelected = themeProvider.borderRadius == radius;
          return GestureDetector(
            onTap: () => themeProvider.setBorderRadius(radius),
            child: Column(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected ? primary : AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(radius),
                    border: Border.all(
                      color: isSelected ? primary : AppColors.border,
                      width: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '${radius.toInt()}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected ? primary : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // 7. More Options (Compact Layout & Animations Toggles)
  Widget _buildMoreOptions(BuildContext context, ThemeProvider themeProvider, Color primary) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          SwitchListTile(
            activeThumbColor: primary,
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.grid_view_rounded, color: primary, size: 20),
            ),
            title: const Text('Compact Layout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            subtitle: const Text('Reduce spacing and padding', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            value: themeProvider.compactLayout,
            onChanged: (val) => themeProvider.setCompactLayout(val),
          ),
          const Divider(height: 1),
          SwitchListTile(
            activeThumbColor: primary,
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.animation_rounded, color: primary, size: 20),
            ),
            title: const Text('Animations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            subtitle: const Text('Enable smooth transitions', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            value: themeProvider.enableAnimations,
            onChanged: (val) => themeProvider.setEnableAnimations(val),
          ),
        ],
      ),
    );
  }
}
