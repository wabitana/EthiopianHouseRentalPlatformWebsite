import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_colors.dart';

enum TutoringTargetArea {
  homeHeader,
  topNavbarMenu,
  searchBar,
  aiAssistantFab,
  savedTab,
  inquiriesTab,
  profileTab,
  providerDashboard,
  providerAddProperty,
  providerInquiries,
  providerRepairs,
  providerAnalytics,
}

class TutoringStep {
  final String title;
  final String description;
  final TutoringTargetArea targetArea;
  final Color primaryColor;

  const TutoringStep({
    required this.title,
    required this.description,
    required this.targetArea,
    this.primaryColor = AppColors.primary,
  });
}

class AppTutorialService {
  // Permanent SharedPreferences keys to ensure tour auto-shows ONCE on first registration
  static const String _seekerKey = 'has_completed_seeker_onboarding_tour';
  static const String _providerKey = 'has_completed_provider_onboarding_tour';

  static final List<TutoringStep> seekerSteps = [
    const TutoringStep(
      title: 'Welcome to Ethiopian House Rental! 🏠🇪🇹',
      description: 'Discover verified rental houses, luxury villas, and apartments across Addis Ababa and major Ethiopian cities.',
      targetArea: TutoringTargetArea.homeHeader,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: 'App Menu & Settings ☰',
      description: 'Access your profile, switch languages, change app theme, or switch to Provider mode from the top-left menu.',
      targetArea: TutoringTargetArea.topNavbarMenu,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: 'Search & Subcity Filters 🔍',
      description: 'Filter properties by subcity (Bole, Kazanchis, Old Airport), price range, rooms, and water tank availability.',
      targetArea: TutoringTargetArea.searchBar,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: '24/7 AI Housing Assistant ✨',
      description: 'Tap the AI Assistant button anytime to get instant house recommendations, interactive maps, or legal advice.',
      targetArea: TutoringTargetArea.aiAssistantFab,
      primaryColor: AppColors.secondary,
    ),
    const TutoringStep(
      title: 'Saved Houses & Favorites ❤️',
      description: 'Tap the heart icon on any house listing to save it here for quick access and instant price alert notifications.',
      targetArea: TutoringTargetArea.savedTab,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: 'Landlord Messages & Inquiries 💬',
      description: 'Send direct messages to verified house providers, schedule property viewings, and track your active inquiries.',
      targetArea: TutoringTargetArea.inquiriesTab,
      primaryColor: Color(0xFF0077B6),
    ),
    const TutoringStep(
      title: 'Seeker Profile & Verification 👤',
      description: 'Manage your verified tenant credentials, account settings, or switch directly to House Provider mode.',
      targetArea: TutoringTargetArea.profileTab,
      primaryColor: AppColors.primary,
    ),
  ];

  static final List<TutoringStep> providerSteps = [
    const TutoringStep(
      title: 'Welcome to Provider Dashboard! 🔑',
      description: 'Manage your rental properties, track tenant inquiries, and monitor your monthly rental earnings.',
      targetArea: TutoringTargetArea.providerDashboard,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: 'List New Property Listing ➕',
      description: 'List your house or apartment with photos, price per month, subcity location, and verified ownership documents.',
      targetArea: TutoringTargetArea.providerAddProperty,
      primaryColor: AppColors.primary,
    ),
    const TutoringStep(
      title: 'Tenant Inquiries & Bookings 💬',
      description: 'Review incoming tenant inquiry messages, chat directly with seekers, and confirm physical house viewings.',
      targetArea: TutoringTargetArea.providerInquiries,
      primaryColor: Color(0xFF0077B6),
    ),
    const TutoringStep(
      title: 'Maintenance & Repair Requests 🛠️',
      description: 'Receive tenant maintenance requests (plumbing, water tank, generator) and update repair progress.',
      targetArea: TutoringTargetArea.providerRepairs,
      primaryColor: Color(0xFFD97706),
    ),
    const TutoringStep(
      title: 'Earnings & Analytics 📊',
      description: 'View listing views, inquiry conversion rates, and total rental revenue collected.',
      targetArea: TutoringTargetArea.providerAnalytics,
      primaryColor: Color(0xFF10B981),
    ),
  ];

  /// Auto-triggers ONCE when a new user registers / opens the app for the first time.
  static Future<void> checkAndShowTutorial(BuildContext context, String role) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = role == 'provider' ? _providerKey : _seekerKey;

      // If user has already completed or skipped the onboarding tour, do not show again automatically
      if (prefs.getBool(key) == true) return;

      final steps = role == 'provider' ? providerSteps : seekerSteps;
      if (!context.mounted) return;

      await showInteractiveTour(context, steps);

      // Save preference so it won't trigger on subsequent app launches
      final p2 = await SharedPreferences.getInstance();
      await p2.setBool(key, true);
    } catch (e) {
      debugPrint('Tutorial launch error: $e');
    }
  }

  /// Replays the interactive tour on demand from the Drawer Menu ("Replay Interactive App Tour").
  static Future<void> replayTutorial(BuildContext context, String role) async {
    try {
      final steps = role == 'provider' ? providerSteps : seekerSteps;
      if (!context.mounted) return;

      await showInteractiveTour(context, steps);

      final prefs = await SharedPreferences.getInstance();
      final key = role == 'provider' ? _providerKey : _seekerKey;
      await prefs.setBool(key, true);
    } catch (e) {
      debugPrint('Tutorial replay error: $e');
    }
  }

  static Future<void> showInteractiveTour(BuildContext context, List<TutoringStep> steps) async {
    if (steps.isEmpty) return;

    int currentIndex = 0;

    await showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.75),
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          child: StatefulBuilder(
            builder: (ctx, setModalState) {
              final step = steps[currentIndex];
              final totalSteps = steps.length;
              final currentStepNum = currentIndex + 1;
              final isLast = currentIndex == totalSteps - 1;
              final activeColor = Theme.of(context).primaryColor;

              return SizedBox(
                width: MediaQuery.of(dialogContext).size.width,
                height: MediaQuery.of(dialogContext).size.height,
                child: Stack(
                  children: [
                    // 1. Spotlight Focus Highlight Box around target element
                    _buildSpotlightHighlightBox(dialogContext, step.targetArea, activeColor),

                    // 2. Hand Pointer Badge attached to Spotlight Box, pointing DOWN at bottom elements or UP at top elements
                    _buildTargetHandBadge(dialogContext, step.targetArea, activeColor),

                    // 3. Centered Onboarding Dialog Card + Skip Tour Pill Button Header
                    Center(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Skip Tour Pill Header
                            GestureDetector(
                              onTap: () => Navigator.of(dialogContext).pop(),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 9),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: Colors.white60, width: 1.2),
                                  boxShadow: const [
                                    BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 4)),
                                  ],
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.close_rounded, color: Colors.white, size: 16),
                                    SizedBox(width: 6),
                                    Text(
                                      'Skip Tour',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Main White Tutorial Card
                            Container(
                              width: 340,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black54,
                                    blurRadius: 24,
                                    offset: Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Feature Icon Badge Header inside Card (Uses App Primary Theme Color)
                                  Row(
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          color: activeColor.withValues(alpha: 0.12),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: activeColor, width: 2),
                                        ),
                                        child: Center(
                                          child: Icon(
                                            _getStepIcon(step.targetArea),
                                            color: activeColor,
                                            size: 24,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF1F5F9),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _getAreaLabel(step.targetArea),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF475569),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 18),

                                  // Title
                                  Text(
                                    step.title,
                                    style: const TextStyle(
                                      fontSize: 19,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF0F172A),
                                      height: 1.3,
                                    ),
                                  ),

                                  const SizedBox(height: 12),

                                  // Description
                                  Text(
                                    step.description,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Color(0xFF475569),
                                      height: 1.5,
                                    ),
                                  ),

                                  const SizedBox(height: 28),

                                  // Bottom Row: Step Counter (1 / 7) + Next Button (App Theme Primary Color)
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '$currentStepNum / $totalSteps',
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF94A3B8),
                                        ),
                                      ),

                                      GestureDetector(
                                        onTap: () {
                                          if (isLast) {
                                            Navigator.of(dialogContext).pop();
                                          } else {
                                            setModalState(() {
                                              currentIndex++;
                                            });
                                          }
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                          decoration: BoxDecoration(
                                            color: activeColor, // App Primary Theme Color
                                            borderRadius: BorderRadius.circular(24),
                                            boxShadow: const [
                                              BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 3)),
                                            ],
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text(
                                                isLast ? 'Finish 🎉' : 'Next',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 16),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  /// Spotlight Focus Area Container around target component using App Theme Color
  static Widget _buildSpotlightHighlightBox(BuildContext context, TutoringTargetArea area, Color activeColor) {
    final media = MediaQuery.of(context);
    final topPadding = media.padding.top;
    final screenWidth = media.size.width;

    double? top;
    double? bottom;
    double? left;
    double? right;
    double width = 64;
    double height = 56;
    Color fillColor = activeColor;
    BorderRadius borderRadius = BorderRadius.circular(16);
    Widget? innerIcon;

    switch (area) {
      case TutoringTargetArea.homeHeader:
        bottom = 4;
        left = 12;
        width = 68;
        height = 56;
        innerIcon = const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_rounded, color: Colors.white, size: 24),
            SizedBox(height: 2),
            Text('Home', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        );

      case TutoringTargetArea.topNavbarMenu:
        top = topPadding + 6;
        left = 8;
        width = 48;
        height = 48;
        borderRadius = BorderRadius.circular(14);
        innerIcon = const Icon(Icons.menu, color: Colors.white, size: 26);

      case TutoringTargetArea.searchBar:
        top = topPadding + 195;
        left = 16;
        width = screenWidth - 32;
        height = 48;
        fillColor = Colors.white;
        borderRadius = BorderRadius.circular(16);
        innerIcon = Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(Icons.search, color: activeColor, size: 20),
              const SizedBox(width: 8),
              const Text('Search subcities, Bole...', style: TextStyle(color: Color(0xFF475569), fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
        );

      case TutoringTargetArea.aiAssistantFab:
        bottom = 75;
        right = 16;
        width = 145;
        height = 48;
        fillColor = activeColor;
        borderRadius = BorderRadius.circular(24);
        innerIcon = const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome, color: Colors.amber, size: 18),
            SizedBox(width: 6),
            Text('AI Assistant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        );

      case TutoringTargetArea.savedTab:
        bottom = 4;
        left = screenWidth * 0.48 - 34;
        width = 68;
        height = 56;
        innerIcon = const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_rounded, color: Colors.white, size: 24),
            SizedBox(height: 2),
            Text('Saved', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        );

      case TutoringTargetArea.inquiriesTab:
        bottom = 4;
        left = screenWidth * 0.68 - 34;
        width = 68;
        height = 56;
        innerIcon = const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_rounded, color: Colors.white, size: 24),
            SizedBox(height: 2),
            Text('Inquiries', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        );

      case TutoringTargetArea.profileTab:
        bottom = 4;
        right = 12;
        width = 68;
        height = 56;
        innerIcon = const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_rounded, color: Colors.white, size: 24),
            SizedBox(height: 2),
            Text('Profile', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        );

      case TutoringTargetArea.providerDashboard:
        top = topPadding + 6;
        left = 8;
        width = 48;
        height = 48;

      case TutoringTargetArea.providerAddProperty:
        bottom = 75;
        right = 16;
        width = 145;
        height = 48;
        fillColor = activeColor;

      case TutoringTargetArea.providerInquiries:
        bottom = 4;
        left = screenWidth * 0.33 - 34;
        width = 68;
        height = 56;

      case TutoringTargetArea.providerRepairs:
        bottom = 4;
        left = screenWidth * 0.66 - 34;
        width = 68;
        height = 56;

      case TutoringTargetArea.providerAnalytics:
        bottom = 4;
        right = 12;
        width = 68;
        height = 56;
    }

    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: IgnorePointer(
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: fillColor,
            borderRadius: borderRadius,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: const [
              BoxShadow(color: Colors.black45, blurRadius: 16, offset: Offset(0, 4)),
            ],
          ),
          child: innerIcon,
        ),
      ),
    );
  }

  /// Target Hand Pointer Badge attached to Spotlight Box
  static Widget _buildTargetHandBadge(BuildContext context, TutoringTargetArea area, Color activeColor) {
    final media = MediaQuery.of(context);
    final topPadding = media.padding.top;
    final screenWidth = media.size.width;

    double? top;
    double? bottom;
    double? left;
    double? right;

    bool isPointingDown = false;

    switch (area) {
      case TutoringTargetArea.homeHeader:
        bottom = 54;
        left = 24;
        isPointingDown = true;

      case TutoringTargetArea.topNavbarMenu:
        top = topPadding + 42;
        left = 36;
        isPointingDown = false;

      case TutoringTargetArea.searchBar:
        top = topPadding + 170;
        left = screenWidth / 2 - 22;
        isPointingDown = true;

      case TutoringTargetArea.aiAssistantFab:
        bottom = 110;
        right = 110;
        isPointingDown = true;

      case TutoringTargetArea.savedTab:
        bottom = 54;
        left = screenWidth * 0.48 - 22;
        isPointingDown = true;

      case TutoringTargetArea.inquiriesTab:
        bottom = 54;
        left = screenWidth * 0.68 - 22;
        isPointingDown = true;

      case TutoringTargetArea.profileTab:
        bottom = 54;
        right = 24;
        isPointingDown = true;

      case TutoringTargetArea.providerDashboard:
        top = topPadding + 42;
        left = 36;
        isPointingDown = false;

      case TutoringTargetArea.providerAddProperty:
        bottom = 110;
        right = 110;
        isPointingDown = true;

      case TutoringTargetArea.providerInquiries:
        bottom = 54;
        left = screenWidth * 0.33 - 22;
        isPointingDown = true;

      case TutoringTargetArea.providerRepairs:
        bottom = 54;
        left = screenWidth * 0.66 - 22;
        isPointingDown = true;

      case TutoringTargetArea.providerAnalytics:
        bottom = 54;
        right = 24;
        isPointingDown = true;
    }

    Widget handIcon = Icon(
      Icons.touch_app_rounded,
      color: activeColor,
      size: 24,
    );

    if (isPointingDown) {
      handIcon = Transform.rotate(
        angle: 3.14159,
        child: handIcon,
      );
    }

    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: IgnorePointer(
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: const [
              BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 4)),
            ],
            border: Border.all(color: activeColor, width: 3),
          ),
          child: Center(
            child: handIcon,
          ),
        ),
      ),
    );
  }

  static IconData _getStepIcon(TutoringTargetArea area) {
    switch (area) {
      case TutoringTargetArea.homeHeader:
        return Icons.home_rounded;
      case TutoringTargetArea.topNavbarMenu:
        return Icons.menu_rounded;
      case TutoringTargetArea.searchBar:
        return Icons.search_rounded;
      case TutoringTargetArea.aiAssistantFab:
        return Icons.auto_awesome;
      case TutoringTargetArea.savedTab:
        return Icons.favorite_rounded;
      case TutoringTargetArea.inquiriesTab:
        return Icons.chat_bubble_rounded;
      case TutoringTargetArea.profileTab:
        return Icons.person_rounded;
      case TutoringTargetArea.providerDashboard:
        return Icons.dashboard_rounded;
      case TutoringTargetArea.providerAddProperty:
        return Icons.add_home_work_rounded;
      case TutoringTargetArea.providerInquiries:
        return Icons.inbox_rounded;
      case TutoringTargetArea.providerRepairs:
        return Icons.build_rounded;
      case TutoringTargetArea.providerAnalytics:
        return Icons.analytics_rounded;
    }
  }

  static String _getAreaLabel(TutoringTargetArea area) {
    switch (area) {
      case TutoringTargetArea.homeHeader:
        return 'Feature: Home Overview';
      case TutoringTargetArea.topNavbarMenu:
        return 'Feature: Top Menu Bar (☰)';
      case TutoringTargetArea.searchBar:
        return 'Feature: Search & Filters';
      case TutoringTargetArea.aiAssistantFab:
        return 'Feature: AI Assistant ✨';
      case TutoringTargetArea.savedTab:
        return 'Feature: Saved Houses ❤️';
      case TutoringTargetArea.inquiriesTab:
        return 'Feature: Landlord Messages 💬';
      case TutoringTargetArea.profileTab:
        return 'Feature: Profile & Settings 👤';
      case TutoringTargetArea.providerDashboard:
        return 'Feature: Provider Dashboard';
      case TutoringTargetArea.providerAddProperty:
        return 'Feature: Add Property Listing ➕';
      case TutoringTargetArea.providerInquiries:
        return 'Feature: Tenant Inquiries';
      case TutoringTargetArea.providerRepairs:
        return 'Feature: Maintenance Repairs';
      case TutoringTargetArea.providerAnalytics:
        return 'Feature: Revenue Analytics';
    }
  }
}
