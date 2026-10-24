import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/currency_service.dart';
import '../../core/theme/app_colors.dart';

class CurrencySelectorWidget extends StatelessWidget {
  final bool isCompact;
  final bool isDark;

  const CurrencySelectorWidget({
    super.key,
    this.isCompact = false,
    this.isDark = false,
  });

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();

    if (isCompact) {
      return _buildCompactSelector(context, currencyProvider);
    }

    return _buildExpandedSelector(context, currencyProvider);
  }

  Widget _buildCompactSelector(BuildContext context, CurrencyProvider currencyProvider) {
    final activeCurrency = currencyProvider.selectedCurrency;

    return Theme(
      data: Theme.of(context).copyWith(
        popupMenuTheme: PopupMenuThemeData(
          color: isDark ? const Color(0xFF134E39) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: isDark ? Colors.white.withValues(alpha: 0.18) : AppColors.border,
              width: 1,
            ),
          ),
        ),
      ),
      child: PopupMenuButton<AppCurrency>(
        tooltip: 'Change Currency',
        elevation: 8,
        offset: const Offset(0, 36),
        onSelected: (currency) {
          if (currencyProvider.selectedCurrency != currency) {
            currencyProvider.setCurrency(currency);
          }
        },
        itemBuilder: (context) => AppCurrency.values.map((curr) {
          final isSel = curr == activeCurrency;
          return PopupMenuItem<AppCurrency>(
            value: curr,
            height: 42,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(curr.flag, style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Text(
                  curr.code,
                  style: TextStyle(
                    fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                    fontSize: 13,
                    color: isDark
                        ? (isSel ? const Color(0xFF34D399) : Colors.white)
                        : (isSel ? AppColors.primary : AppColors.textPrimary),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  curr == AppCurrency.etb
                      ? 'Birr'
                      : curr == AppCurrency.usd
                          ? 'USD'
                          : 'EUR',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: isDark ? Colors.white70 : AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 12),
                if (isSel)
                  Icon(
                    Icons.check_circle_rounded,
                    size: 16,
                    color: isDark ? const Color(0xFF34D399) : AppColors.primary,
                  ),
              ],
            ),
          );
        }).toList(),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
          decoration: BoxDecoration(
            color: isDark ? Colors.black.withValues(alpha: 0.28) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.24) : AppColors.border,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black12,
                blurRadius: 4,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(activeCurrency.flag, style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 4),
              Text(
                activeCurrency.code,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 2),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 16,
                color: isDark ? Colors.white70 : AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExpandedSelector(BuildContext context, CurrencyProvider currencyProvider) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? Colors.black.withValues(alpha: 0.22) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.22) : AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.15) : Colors.black12,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: AppCurrency.values.map((currency) {
          final isSelected = currencyProvider.selectedCurrency == currency;
          return MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                if (currencyProvider.selectedCurrency != currency) {
                  currencyProvider.setCurrency(currency);
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeInOut,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                margin: const EdgeInsets.symmetric(horizontal: 1.5),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isDark ? Colors.white : AppColors.primary)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: (isDark ? Colors.white : AppColors.primary).withValues(alpha: 0.25),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(currency.flag, style: const TextStyle(fontSize: 14)),
                    const SizedBox(width: 4),
                    Text(
                      currency.code,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isSelected
                            ? (isDark ? const Color(0xFF0F3D2C) : Colors.white)
                            : (isDark ? Colors.white.withValues(alpha: 0.9) : AppColors.textPrimary),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
