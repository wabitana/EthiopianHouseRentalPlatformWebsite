import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/constants/app_constants.dart';
import 'core/localization/language_provider.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/house_seeker/providers/property_provider.dart';
import 'features/house_seeker/providers/favorites_provider.dart';
import 'features/house_seeker/providers/inquiry_provider.dart';
import 'features/notifications/providers/notification_provider.dart';
import 'features/ai_assistant/providers/ai_assistant_provider.dart';
import 'features/auth/screens/splash_screen.dart';

import 'core/services/currency_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EthiopianHouseRentalApp());
}

class EthiopianHouseRentalApp extends StatelessWidget {
  const EthiopianHouseRentalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => CurrencyProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => FavoritesProvider()),
        ChangeNotifierProvider(create: (_) => InquiryProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => AiAssistantProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            themeMode: themeProvider.themeMode,
            theme: AppTheme.buildLightTheme(
              primaryColor: themeProvider.primaryColor,
              fontFamily: themeProvider.fontFamily,
              borderRadius: themeProvider.borderRadius,
            ),
            darkTheme: AppTheme.buildDarkTheme(
              primaryColor: themeProvider.primaryColor,
              fontFamily: themeProvider.fontFamily,
              borderRadius: themeProvider.borderRadius,
            ),
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}
