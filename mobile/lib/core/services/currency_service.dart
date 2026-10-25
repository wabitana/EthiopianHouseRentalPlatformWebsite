import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppCurrency { etb, usd, eur }

extension AppCurrencyExtension on AppCurrency {
  String get code {
    switch (this) {
      case AppCurrency.etb:
        return 'ETB';
      case AppCurrency.usd:
        return 'USD';
      case AppCurrency.eur:
        return 'EUR';
    }
  }

  String get symbol {
    switch (this) {
      case AppCurrency.etb:
        return 'ETB';
      case AppCurrency.usd:
        return '\$';
      case AppCurrency.eur:
        return '€';
    }
  }

  String get flag {
    switch (this) {
      case AppCurrency.etb:
        return '🇪🇹';
      case AppCurrency.usd:
        return '🇺🇸';
      case AppCurrency.eur:
        return '🇪🇺';
    }
  }
}

class CurrencyProvider extends ChangeNotifier {
  static const String _prefKey = 'selected_currency_code';
  
  static AppCurrency activeCurrency = AppCurrency.etb;
  static const double activeUsdToEtb = 125.0;
  static const double activeEurToEtb = 135.0;

  AppCurrency _selectedCurrency = AppCurrency.etb;
  // Official & market reference rates: 1 USD ≈ 125 ETB, 1 EUR ≈ 135 ETB
  final double _usdToEtb = activeUsdToEtb;
  final double _eurToEtb = activeEurToEtb;

  AppCurrency get selectedCurrency => _selectedCurrency;
  double get usdToEtb => _usdToEtb;
  double get eurToEtb => _eurToEtb;

  CurrencyProvider() {
    _loadSavedCurrency();
  }

  Future<void> _loadSavedCurrency() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final code = prefs.getString(_prefKey);
      if (code != null) {
        if (code == 'USD') _selectedCurrency = AppCurrency.usd;
        if (code == 'EUR') _selectedCurrency = AppCurrency.eur;
        if (code == 'ETB') _selectedCurrency = AppCurrency.etb;
        activeCurrency = _selectedCurrency;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> setCurrency(AppCurrency currency) async {
    _selectedCurrency = currency;
    activeCurrency = currency;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, currency.code);
    } catch (_) {}
  }

  String formatPrice(double priceInEtb) {
    return formatWithCurrency(priceInEtb, _selectedCurrency);
  }

  static String formatStatic(double priceInEtb) {
    return formatWithCurrency(priceInEtb, activeCurrency);
  }

  static String formatWithCurrency(double priceInEtb, AppCurrency currency) {
    double converted = priceInEtb;
    String symbol = AppCurrency.etb.symbol;

    switch (currency) {
      case AppCurrency.etb:
        converted = priceInEtb;
        symbol = 'ETB';
        break;
      case AppCurrency.usd:
        converted = priceInEtb / activeUsdToEtb;
        symbol = '\$';
        break;
      case AppCurrency.eur:
        converted = priceInEtb / activeEurToEtb;
        symbol = '€';
        break;
    }

    if (currency == AppCurrency.etb) {
      return '${_formatNumberStatic(converted)} ETB';
    } else {
      return '$symbol${_formatNumberStatic(converted)}';
    }
  }

  static String _formatNumberStatic(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    }
    final integerPart = amount.round().toString();
    final RegExp reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    return integerPart.replaceAllMapped(reg, (Match m) => '${m[1]},');
  }
}
