import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class CustomBottomNavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int badgeCount;
  final Color? badgeColor;
  final bool isSpecial; // For center prominent action like "Post House"

  const CustomBottomNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.badgeCount = 0,
    this.badgeColor,
    this.isSpecial = false,
  });
}

class CustomModernBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<CustomBottomNavItem> items;

  const CustomModernBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.primaryColor;
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = theme.cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: primary.withValues(alpha: 0.18),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.18),
            blurRadius: 24,
            spreadRadius: 0,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.06),
            blurRadius: 12,
            spreadRadius: 0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (index) {
              final item = items[index];
              final isSelected = index == currentIndex;

              if (item.isSpecial) {
                return _buildSpecialCenterButton(context, item, isSelected, () => onTap(index), primary);
              }

              return _buildTabItem(context, item, isSelected, () => onTap(index), primary);
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildTabItem(
    BuildContext context,
    CustomBottomNavItem item,
    bool isSelected,
    VoidCallback onTapHandler,
    Color primary,
  ) {
    return InkWell(
      onTap: onTapHandler,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 12 : 8,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? primary.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isSelected ? item.activeIcon : item.icon,
                  size: isSelected ? 24 : 22,
                  color: isSelected ? primary : AppColors.textMuted,
                ),
                if (item.badgeCount > 0)
                  Positioned(
                    top: -6,
                    right: -8,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: item.badgeColor ?? AppColors.secondary,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: (item.badgeColor ?? AppColors.secondary).withValues(alpha: 0.4),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        '${item.badgeCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
                child: Text(item.label),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialCenterButton(
    BuildContext context,
    CustomBottomNavItem item,
    bool isSelected,
    VoidCallback onTapHandler,
    Color primary,
  ) {
    return GestureDetector(
      onTap: onTapHandler,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [primary, primary.withValues(alpha: 0.85)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: primary.withValues(alpha: 0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? item.activeIcon : item.icon,
              size: 22,
              color: Colors.white,
            ),
            const SizedBox(width: 6),
            Text(
              item.label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
