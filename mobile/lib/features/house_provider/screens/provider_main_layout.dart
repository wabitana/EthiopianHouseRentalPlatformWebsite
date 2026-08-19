import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_bottom_nav_bar.dart';
import '../screens/provider_dashboard_screen.dart';
import '../screens/my_listings_screen.dart';
import '../screens/post_house_wizard_screen.dart';
import '../screens/provider_inquiries_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../house_seeker/providers/property_provider.dart';
import '../../house_seeker/providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ProviderMainLayout extends StatefulWidget {
  const ProviderMainLayout({super.key});

  @override
  State<ProviderMainLayout> createState() => _ProviderMainLayoutState();
}

class _ProviderMainLayoutState extends State<ProviderMainLayout> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    ProviderDashboardScreen(),
    MyListingsScreen(),
    PostHouseWizardScreen(),
    ProviderInquiriesScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = context.read<AuthProvider>();
      if (auth.currentUser != null) {
        context.read<PropertyProvider>().fetchProviderProperties(auth.currentUser!.id);
        context.read<InquiryProvider>().fetchProviderInquiries(auth.currentUser!.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final inquiryProvider = context.watch<InquiryProvider>();
    final newInquiriesCount = inquiryProvider.newProviderInquiriesCount;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: CustomModernBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          const CustomBottomNavItem(
            icon: Icons.dashboard_outlined,
            activeIcon: Icons.dashboard_rounded,
            label: 'Dashboard',
          ),
          const CustomBottomNavItem(
            icon: Icons.holiday_village_outlined,
            activeIcon: Icons.holiday_village_rounded,
            label: 'Listings',
          ),
          const CustomBottomNavItem(
            icon: Icons.add_circle_outline_rounded,
            activeIcon: Icons.add_circle_rounded,
            label: 'Post',
            isSpecial: true,
          ),
          CustomBottomNavItem(
            icon: Icons.mail_outline_rounded,
            activeIcon: Icons.mail_rounded,
            label: 'Inquiries',
            badgeCount: newInquiriesCount,
            badgeColor: AppColors.secondary,
          ),
          const CustomBottomNavItem(
            icon: Icons.person_outline_rounded,
            activeIcon: Icons.person_rounded,
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
