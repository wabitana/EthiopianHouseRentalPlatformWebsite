import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/house_seeker/screens/seeker_main_layout.dart';
import '../../features/house_provider/screens/provider_main_layout.dart';
import '../../features/house_seeker/providers/property_provider.dart';
import '../../features/house_seeker/providers/inquiry_provider.dart';
import '../../features/notifications/providers/notification_provider.dart';

class MainLayoutWrapper extends StatefulWidget {
  const MainLayoutWrapper({super.key});

  @override
  State<MainLayoutWrapper> createState() => _MainLayoutWrapperState();
}

class _MainLayoutWrapperState extends State<MainLayoutWrapper> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isProvider = auth.isProvider;

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      switchInCurve: Curves.easeIn,
      switchOutCurve: Curves.easeOut,
      child: isProvider
          ? const ProviderMainLayout(key: ValueKey('ProviderMainLayout'))
          : const SeekerMainLayout(key: ValueKey('SeekerMainLayout')),
    );
  }
}
