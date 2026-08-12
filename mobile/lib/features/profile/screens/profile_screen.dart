import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/verification_badge.dart';
import '../../../core/localization/language_provider.dart';
import '../../../core/constants/app_strings.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/welcome_screen.dart';
import '../../house_seeker/screens/seeker_main_layout.dart';
import '../../house_provider/screens/provider_main_layout.dart';
import 'theme_settings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showEditProfileModal(BuildContext context, UserModel user) {
    final nameController = TextEditingController(text: user.name);
    final phoneController = TextEditingController(text: user.phone);
    final emailController = TextEditingController(text: user.email);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Edit Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(ctx).pop()),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),

            CustomTextField(label: 'Full Name', controller: nameController),
            const SizedBox(height: 14),
            CustomTextField(label: 'Phone Number', controller: phoneController),
            const SizedBox(height: 14),
            CustomTextField(label: 'Email Address', controller: emailController),
            const SizedBox(height: 20),

            CustomButton(
              text: 'Save Changes',
              onPressed: () {
                context.read<AuthProvider>().updateProfile(
                      nameController.text.trim(),
                      phoneController.text.trim(),
                      emailController.text.trim(),
                    );
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile updated successfully!'), backgroundColor: AppColors.success),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Out?'),
        content: const Text('Are you sure you want to log out of Ethiopian House Rental?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              context.read<AuthProvider>().logout();
              Navigator.of(ctx).pop();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (route) => false,
              );
            },
            child: const Text('Log Out', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('User Profile'),
      ),
      body: user == null
          ? const Center(child: Text('Not Logged In'))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  // User Avatar & Name Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: AppColors.primaryContainer,
                          backgroundImage: (user.avatarUrl != null && user.avatarUrl!.trim().isNotEmpty && user.avatarUrl!.startsWith('http'))
                              ? NetworkImage(user.avatarUrl!.trim())
                              : null,
                          child: (user.avatarUrl == null || user.avatarUrl!.trim().isEmpty || !user.avatarUrl!.startsWith('http'))
                              ? const Icon(Icons.person, size: 40, color: AppColors.primary)
                              : null,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          user.name,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        Text(user.email, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        Text(user.phone, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primaryContainer,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                user.role.displayName,
                                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (user.isVerified) const VerificationBadge(label: 'Verified User', isSmall: true),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Tri-Lingual Language Selector Card
                  Consumer<LanguageProvider>(
                    builder: (context, langProvider, child) {
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                          boxShadow: AppColors.cardShadow,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.language_rounded, color: AppColors.primary),
                                SizedBox(width: 8),
                                Text(
                                  'App Language / ቋንቋ / Afaan',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: AppLanguage.values.map((lang) {
                                final isSelected = langProvider.currentLanguage == lang;
                                return Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.only(right: 6.0),
                                    child: ChoiceChip(
                                      label: Text(
                                        lang.displayName,
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                        ),
                                      ),
                                      selected: isSelected,
                                      selectedColor: AppColors.primaryContainer,
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
                      );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Account Role Switcher Card (For easy testing during demo!)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.secondary.withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.swap_horiz_rounded, color: AppColors.secondary),
                            SizedBox(width: 8),
                            Text(
                              'Switch App Role Mode (Demo Test)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Seamlessly switch between Seeker and Provider views for quick testing.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: user.role == UserRole.seeker ? AppColors.primary : Colors.white,
                                  foregroundColor: user.role == UserRole.seeker ? Colors.white : AppColors.primary,
                                ),
                                onPressed: () {
                                  authProvider.switchRole(UserRole.seeker);
                                  Navigator.of(context).pushAndRemoveUntil(
                                    MaterialPageRoute(builder: (_) => const SeekerMainLayout()),
                                    (route) => false,
                                  );
                                },
                                child: const Text('Seeker Mode'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: user.role == UserRole.provider ? AppColors.primary : Colors.white,
                                  foregroundColor: user.role == UserRole.provider ? Colors.white : AppColors.primary,
                                ),
                                onPressed: () {
                                  authProvider.switchRole(UserRole.provider);
                                  Navigator.of(context).pushAndRemoveUntil(
                                    MaterialPageRoute(builder: (_) => const ProviderMainLayout()),
                                    (route) => false,
                                  );
                                },
                                child: const Text('Provider Mode'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Menu Options
                  Material(
                    color: Colors.transparent,
                    child: Ink(
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.person_outline, color: AppColors.primary),
                          title: const Text('Edit Personal Info'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _showEditProfileModal(context, user),
                        ),
                        const Divider(height: 1),
                        ListTile(
                          leading: const Icon(Icons.palette_outlined, color: AppColors.primary),
                          title: const Text('App Theme & Appearance'),
                          subtitle: const Text('Color palette, fonts, corners & dark mode'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
                            );
                          },
                        ),
                        const Divider(height: 1),
                        ListTile(
                          leading: const Icon(Icons.lock_outline, color: AppColors.primary),
                          title: const Text('Change Password'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Password reset link sent to your phone/email.')),
                            );
                          },
                        ),
                        const Divider(height: 1),
                        ListTile(
                          leading: const Icon(Icons.notifications_none, color: AppColors.primary),
                          title: const Text('Notification Settings'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        ListTile(
                          leading: const Icon(Icons.verified_outlined, color: AppColors.primary),
                          title: const Text('Account Verification'),
                          subtitle: const Text('Verified by ID & Phone', style: TextStyle(fontSize: 11)),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                  CustomButton(
                    text: 'Log Out',
                    variant: CustomButtonVariant.outline,
                    icon: Icons.logout_rounded,
                    onPressed: () => _showLogoutDialog(context),
                  ),
                ],
              ),
            ),
    );
  }
}
