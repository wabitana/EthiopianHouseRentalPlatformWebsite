import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_bottom_nav_bar.dart';
import '../providers/favorites_provider.dart';
import '../providers/inquiry_provider.dart';
import '../../notifications/providers/notification_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/localization/language_provider.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/app_tutoring_overlay.dart';
import 'seeker_home_screen.dart';
import 'search_screen.dart';
import 'saved_screen.dart';
import 'seeker_inquiries_screen.dart';
import '../../profile/screens/profile_screen.dart';

class SeekerMainLayout extends StatefulWidget {
  const SeekerMainLayout({super.key});

  @override
  State<SeekerMainLayout> createState() => _SeekerMainLayoutState();
}

class _SeekerMainLayoutState extends State<SeekerMainLayout> {
  int _currentIndex = 0;

  late final List<Widget> _pages = [
    const SeekerHomeScreen(),
    const SearchScreen(),
    SavedScreen(
      onExploreTap: () {
        setState(() {
          _currentIndex = 0;
        });
      },
    ),
    const SeekerInquiriesScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = context.read<AuthProvider>();
      if (auth.currentUser != null) {
        context.read<InquiryProvider>().fetchSeekerInquiries(auth.currentUser!.id);
        context.read<NotificationProvider>().fetchNotifications(auth.currentUser!.id);
      }
      // Trigger seeker tutorial
      AppTutorialService.checkAndShowTutorial(context, 'seeker');
    });
  }



  @override
  Widget build(BuildContext context) {
    final favoritesCount = context.watch<FavoritesProvider>().favoritePropertyIds.length;
    final inquiries = context.watch<InquiryProvider>().seekerInquiries;
    final respondedCount = inquiries.where((inq) => inq.providerReply != null).length;
    final lang = context.watch<LanguageProvider>().currentLanguage;

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
          CustomBottomNavItem(
            icon: Icons.home_outlined,
            activeIcon: Icons.home_rounded,
            label: AppStrings.navHome(lang),
          ),
          CustomBottomNavItem(
            icon: Icons.search_outlined,
            activeIcon: Icons.search_rounded,
            label: AppStrings.navSearch(lang),
          ),
          CustomBottomNavItem(
            icon: Icons.favorite_border_rounded,
            activeIcon: Icons.favorite_rounded,
            label: AppStrings.navSaved(lang),
            badgeCount: favoritesCount,
            badgeColor: AppColors.secondary,
          ),
          CustomBottomNavItem(
            icon: Icons.chat_bubble_outline_rounded,
            activeIcon: Icons.chat_bubble_rounded,
            label: AppStrings.navInquiries(lang),
            badgeCount: respondedCount,
            badgeColor: AppColors.success,
          ),
          CustomBottomNavItem(
            icon: Icons.person_outline_rounded,
            activeIcon: Icons.person_rounded,
            label: AppStrings.navProfile(lang),
          ),
        ],
      ),
    );
  }
}
