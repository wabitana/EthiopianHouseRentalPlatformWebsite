import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/currency_service.dart';
import '../../core/theme/app_colors.dart';

class CurrencySelectorWidget extends StatelessWidget {
  final bool isCompact;

  const CurrencySelectorWidget({
    super.key,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final currencyProvider = context.watch<CurrencyProvider>();

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isCompact ? 6 : 8, vertical: isCompact ? 2 : 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: AppCurrency.values.map((currency) {
          final isSelected = currencyProvider.selectedCurrency == currency;
          return GestureDetector(
            onTap: () => currencyProvider.setCurrency(currency),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.symmetric(horizontal: isCompact ? 6 : 10, vertical: isCompact ? 4 : 6),
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Text(currency.flag, style: TextStyle(fontSize: isCompact ? 11 : 13)),
                  const SizedBox(width: 3),
                  Text(
                    currency.code,
                    style: TextStyle(
                      fontSize: isCompact ? 10 : 12,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
