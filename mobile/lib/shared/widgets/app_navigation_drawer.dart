import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/language_provider.dart';
import '../../core/constants/app_strings.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/welcome_screen.dart';
import '../../features/profile/screens/theme_settings_screen.dart';
import '../../features/notifications/screens/notification_center_screen.dart';
import '../../shared/models/user_model.dart';
import '../../shared/widgets/verification_badge.dart';

class AppNavigationDrawer extends StatelessWidget {
  const AppNavigationDrawer({super.key});

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
          // 1. Drawer Header Card
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 20,
              bottom: 20,
              left: 20,
              right: 20,
            ),
            decoration: BoxDecoration(
              color: primary,
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: primary.withValues(alpha: 0.3),
                  blurRadius: 12,
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
                          Row(
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
                              if (user?.isVerified == true) ...[
                                const SizedBox(width: 6),
                                const VerificationBadge(label: 'Verified', isSmall: true),
                              ],
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

          // 2. Scrollable Navigation List
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
