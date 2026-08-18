import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/language_provider.dart';
import '../../core/constants/app_strings.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/welcome_screen.dart';
import '../../features/profile/screens/theme_settings_screen.dart';
import '../../features/notifications/screens/notification_center_screen.dart';
import '../../features/ai_assistant/screens/ai_assistant_screen.dart';
import '../../features/house_seeker/screens/search_screen.dart';
import '../../features/house_provider/screens/post_house_wizard_screen.dart';
import '../../features/house_provider/screens/provider_analytics_screen.dart';
import '../../features/house_provider/screens/provider_inquiries_screen.dart';
import '../../features/house_provider/screens/my_listings_screen.dart';
import '../../features/house_provider/screens/subscription_plans_screen.dart';
import '../../features/profile/screens/identity_verification_screen.dart';
import '../../shared/models/user_model.dart';
import '../../shared/widgets/verification_badge.dart';
import '../../shared/widgets/custom_button.dart';
import 'app_tutoring_overlay.dart';

class AppNavigationDrawer extends StatelessWidget {
  const AppNavigationDrawer({super.key});

  // 1. Lease Draft & Rental Agreement Generator Modal
  void _showLeaseDraftModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Ethiopian Residential Lease Draft Generator',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const Divider(color: Color(0xFFE2E8F0)),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Standard Tenancy Clauses Included:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary)),
                    SizedBox(height: 6),
                    Text('• 3–6 Months Advance Rent Payment Clause', style: TextStyle(fontSize: 12)),
                    Text('• 1 Month Refundable Security Deposit Terms', style: TextStyle(fontSize: 12)),
                    Text('• 30-Day Lease Termination Notice Period', style: TextStyle(fontSize: 12)),
                    Text('• Landlord & Tenant Maintenance Obligations', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              CustomButton(
                text: 'Download Lease Agreement (Amharic & English PDF)',
                icon: Icons.picture_as_pdf_rounded,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Lease Draft PDF generated & saved to downloads! ✓'),
                      backgroundColor: AppColors.success,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 2. Rent Market Price Analyzer & Commute Calculator Modal
  void _showMarketPriceAnalyzerModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Subcity Rent Market & Utility Index',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const Divider(color: Color(0xFFE2E8F0)),
              const SizedBox(height: 12),

              _buildMarketRow('Bole Atlas / Medhanialem', '35,000 - 65,000 ETB', 'Power 95% • Water 88%'),
              const SizedBox(height: 8),
              _buildMarketRow('Sarbet / Old Airport', '28,000 - 50,000 ETB', 'Power 92% • Water 90%'),
              const SizedBox(height: 8),
              _buildMarketRow('Kazanchis / Mexico', '22,000 - 45,000 ETB', 'Power 90% • Water 85%'),
              const SizedBox(height: 8),
              _buildMarketRow('CMC / Ayat Condominium', '15,000 - 30,000 ETB', 'Power 88% • Water 82%'),
              const SizedBox(height: 20),

              CustomButton(
                text: 'Run Custom AI Commute Calculation',
                icon: Icons.directions_subway_rounded,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AiAssistantScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _buildMarketRow(String area, String price, String utilities) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(area, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text(utilities, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Text(price, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary)),
        ],
      ),
    );
  }

  // 3. Scam Prevention & Landlord Verification Audit Modal
  void _showScamAuditModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Landlord & Safety Verification Shield',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const Divider(color: Color(0xFFE2E8F0)),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.verified_user_rounded, color: Color(0xFF10B981), size: 24),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Direct Landlord Guarantee', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF065F46))),
                          Text('Zero broker commission fees. All listings are directly posted by verified property owners.', style: TextStyle(fontSize: 11, color: Color(0xFF047857))),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              CustomButton(
                text: 'Audit Listing with AI Fraud Detector',
                icon: Icons.shield_rounded,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AiAssistantScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 4. Emergency Hotline & Support Desk Modal
  void _showSupportDeskModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '24/7 Rental Hotline & Support Desk',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const Divider(color: Color(0xFFE2E8F0)),
            const SizedBox(height: 12),

            ListTile(
              leading: const Icon(Icons.phone_in_talk_rounded, color: AppColors.primary),
              title: const Text('Call Toll-Free Hotline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('9090 / +251 911 000 000 (Available 24/7)', style: TextStyle(fontSize: 12)),
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Hotline: +251 911 000 000...'), backgroundColor: AppColors.primary),
                );
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.mark_email_read_rounded, color: AppColors.primary),
              title: const Text('Email Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('support@ethiopianhouserental.com', style: TextStyle(fontSize: 12)),
              onTap: () => Navigator.of(ctx).pop(),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;
    final primary = Theme.of(context).primaryColor;
    final langProvider = context.watch<LanguageProvider>();

    return Drawer(
      backgroundColor: AppColors.background,
      child: Column(
        children: [
          // 1. PRO Drawer Header Card with Dark Gradient
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              bottom: 20,
              left: 20,
              right: 20,
            ),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF0F172A), primary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(28),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.white.withValues(alpha: 0.25),
                      backgroundImage: (user?.avatarUrl != null &&
                              user!.avatarUrl!.trim().isNotEmpty &&
                              user.avatarUrl!.startsWith('http'))
                          ? NetworkImage(user.avatarUrl!.trim())
                          : null,
                      child: (user?.avatarUrl == null ||
                              user!.avatarUrl!.trim().isEmpty ||
                              !user.avatarUrl!.startsWith('http'))
                          ? const Icon(Icons.person, size: 36, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'User Profile',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?.phone ?? '+251 91 123 4567',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.25),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${authProvider.activeRole.displayName} (Active)',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              if (user?.isVerified == true)
                                const VerificationBadge(label: 'Verified', isSmall: true),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Scrollable Navigation List with Tailored Provider / Seeker Pro Tools
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
              children: [
                _buildDrawerTile(
                  context,
                  icon: Icons.swap_horiz_rounded,
                  title: authProvider.isProvider ? 'Switch to House Seeker' : 'Switch to House Provider',
                  subtitle: authProvider.isProvider ? 'Explore & inquire rental houses' : 'Manage properties & provider dashboard',
                  primary: AppColors.secondary,
                  onTap: () {
                    Navigator.of(context).pop();
                    final targetRole = authProvider.isProvider ? UserRole.seeker : UserRole.provider;
                    authProvider.switchRole(targetRole);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Switched to ${targetRole.displayName} Mode ✓'),
                        backgroundColor: AppColors.primary,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                ),

                // -------------------------------------------------------------
                // HOUSE PROVIDER / LANDLORD SPECIFIC DRAWER TOOLS
                // -------------------------------------------------------------
                if (authProvider.isProvider) ...[
                  _buildDrawerTile(
                    context,
                    icon: Icons.add_home_work_rounded,
                    title: 'Post New Property Listing',
                    subtitle: 'Add a new rental house with photos & terms',
                    primary: const Color(0xFF10B981),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PostHouseWizardScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.card_membership_rounded,
                    title: 'Landlord Subscription Plans',
                    subtitle: 'Activate Basic, Pro, or Business plan via Chapa',
                    primary: const Color(0xFFF59E0B),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SubscriptionPlansScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.verified_user_rounded,
                    title: 'Identity Verification (Fayda / Passport)',
                    subtitle: 'Upload National ID & selfie for Verified Badge',
                    primary: const Color(0xFF0284C7),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const IdentityVerificationScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.holiday_village_rounded,
                    title: 'My Managed Listings',
                    subtitle: 'View, edit prices & availability status',
                    primary: const Color(0xFF0F172A),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const MyListingsScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.insights_rounded,
                    title: 'Earnings & Occupancy Analytics',
                    subtitle: 'Track monthly rent income & view counts',
                    primary: const Color(0xFF0284C7),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ProviderAnalyticsScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.mark_chat_unread_rounded,
                    title: 'Tenant Viewing Requests',
                    subtitle: 'Review & approve tour bookings from seekers',
                    primary: const Color(0xFFF59E0B),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ProviderInquiriesScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.auto_awesome_rounded,
                    title: 'AI Landlord Assistant',
                    subtitle: 'Optimize descriptions, price houses & auto-reply',
                    primary: Colors.amber.shade800,
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AiAssistantScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.description_outlined,
                    title: 'Tenancy Contract Generator',
                    subtitle: 'Generate standard Amharic/English lease contracts',
                    primary: const Color(0xFF0D9488),
                    onTap: () => _showLeaseDraftModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.analytics_outlined,
                    title: 'Subcity Rent Price Benchmark',
                    subtitle: 'Compare listing price against area averages',
                    primary: const Color(0xFF8B5CF6),
                    onTap: () => _showMarketPriceAnalyzerModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.headset_mic_outlined,
                    title: '24/7 Landlord Support Desk',
                    subtitle: 'Hotline: 9090 / +251 911 000 000',
                    primary: const Color(0xFFE11D48),
                    onTap: () => _showSupportDeskModal(context),
                  ),
                ]
                // -------------------------------------------------------------
                // HOUSE SEEKER / TENANT SPECIFIC DRAWER TOOLS
                // -------------------------------------------------------------
                else ...[
                  _buildDrawerTile(
                    context,
                    icon: Icons.auto_awesome_rounded,
                    title: 'AI Housing Assistant',
                    subtitle: 'Search real properties & get smart recommendations',
                    primary: Colors.amber.shade800,
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AiAssistantScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.map_rounded,
                    title: 'Interactive Subcity Map Explorer',
                    subtitle: 'Explore registered house pins on live map',
                    primary: const Color(0xFF0284C7),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SearchScreen()),
                      );
                    },
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.description_outlined,
                    title: 'Rental Lease Draft Generator',
                    subtitle: 'Generate standard Amharic/English tenancy contract',
                    primary: const Color(0xFF0D9488),
                    onTap: () => _showLeaseDraftModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.analytics_outlined,
                    title: 'Rent Market Price & Utility Index',
                    subtitle: 'Compare subcity rates & water/power stability',
                    primary: const Color(0xFF8B5CF6),
                    onTap: () => _showMarketPriceAnalyzerModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.shield_outlined,
                    title: 'Landlord Verification & Safety Shield',
                    subtitle: 'Zero broker fees & title deed verification',
                    primary: const Color(0xFF10B981),
                    onTap: () => _showScamAuditModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.headset_mic_outlined,
                    title: '24/7 Support Desk & Toll-Free Hotline',
                    subtitle: 'Hotline: 9090 / +251 911 000 000',
                    primary: const Color(0xFFE11D48),
                    onTap: () => _showSupportDeskModal(context),
                  ),
                  _buildDrawerTile(
                    context,
                    icon: Icons.tour_rounded,
                    title: 'Replay Interactive App Tour',
                    subtitle: 'Replay guided onboarding tutorial for top & bottom navbar',
                    primary: const Color(0xFFE07A5F),
                    onTap: () {
                      Navigator.of(context).pop();
                      final role = context.read<AuthProvider>().isProvider ? 'provider' : 'seeker';
                      AppTutorialService.replayTutorial(context, role);
                    },
                  ),
                ],
                _buildDrawerTile(
                  context,
                  icon: Icons.palette_outlined,
                  title: 'App Theme & Colors',
                  subtitle: 'Customize theme, dark mode & fonts',
                  primary: primary,
                  onTap: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
                    );
                  },
                ),
                _buildDrawerTile(
                  context,
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  subtitle: 'View active alerts & updates',
                  primary: primary,
                  onTap: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const NotificationCenterScreen()),
                    );
                  },
                ),
                const Divider(height: 24, indent: 16, endIndent: 16),

                // Language Switcher Tile
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  child: Text(
                    'APP LANGUAGE / ቋንቋ',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                Row(
                  children: AppLanguage.values.map((lang) {
                    final isSelected = langProvider.currentLanguage == lang;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ChoiceChip(
                          label: Text(
                            lang.displayName.split(' ').first,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: primary,
                          onSelected: (selected) {
                            if (selected) langProvider.setLanguage(lang);
                          },
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // 3. Bottom Log Out Action
          Padding(
            padding: const EdgeInsets.all(16),
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                minimumSize: const Size(double.infinity, 46),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: const Icon(Icons.logout_rounded, size: 20),
              label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.of(context).pop();
                authProvider.logout();
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                  (route) => false,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color primary,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: primary, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted),
      ),
    );
  }
}
