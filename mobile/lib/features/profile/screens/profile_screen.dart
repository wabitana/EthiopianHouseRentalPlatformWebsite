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
import 'theme_settings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // 1. Edit Personal Info Modal Sheet
  void _showEditProfileModal(BuildContext context, UserModel user) {
    final nameController = TextEditingController(text: user.name);
    final phoneController = TextEditingController(text: user.phone);
    final emailController = TextEditingController(text: user.email);
    String selectedAvatar = user.avatarUrl ?? '';

    final presetAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 24,
              right: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
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
                        'Edit Personal Info',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textMuted),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 12),

                  // Avatar Picker
                  const Text('Select Avatar Image', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: presetAvatars.map((url) {
                      final isSelected = selectedAvatar == url;
                      return GestureDetector(
                        onTap: () {
                          setModalState(() {
                            selectedAvatar = url;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? AppColors.primary : Colors.transparent,
                              width: 2.5,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 26,
                            backgroundImage: NetworkImage(url),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  CustomTextField(
                    label: 'Full Name',
                    controller: nameController,
                    prefixIcon: Icons.person_outline_rounded,
                  ),
                  const SizedBox(height: 14),
                  CustomTextField(
                    label: 'Phone Number (Ethiopia)',
                    controller: phoneController,
                    prefixIcon: Icons.phone_iphone_rounded,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 14),
                  CustomTextField(
                    label: 'Email Address',
                    controller: emailController,
                    prefixIcon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: 'Save Profile Changes',
                    trailingIcon: Icons.check_circle_rounded,
                    onPressed: () {
                      context.read<AuthProvider>().updateProfile(
                            nameController.text.trim(),
                            phoneController.text.trim(),
                            emailController.text.trim(),
                            selectedAvatar.isNotEmpty ? selectedAvatar : null,
                          );
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Profile details updated successfully!'),
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // 2. Change Password Modal Sheet
  void _showChangePasswordModal(BuildContext context) {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            padding: EdgeInsets.only(
              top: 20,
              left: 24,
              right: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Change Password',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.textMuted),
                          onPressed: () => Navigator.of(ctx).pop(),
                        ),
                      ],
                    ),
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 12),

                    CustomTextField(
                      label: 'Current Password',
                      hint: '••••••••',
                      controller: currentPasswordController,
                      obscureText: obscureCurrent,
                      prefixIcon: Icons.lock_outline_rounded,
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscureCurrent ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: AppColors.textMuted,
                          size: 20,
                        ),
                        onPressed: () {
                          setModalState(() {
                            obscureCurrent = !obscureCurrent;
                          });
                        },
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) return 'Please enter your current password';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    CustomTextField(
                      label: 'New Password',
                      hint: '••••••••',
                      controller: newPasswordController,
                      obscureText: obscureNew,
                      prefixIcon: Icons.lock_clock_outlined,
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscureNew ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: AppColors.textMuted,
                          size: 20,
                        ),
                        onPressed: () {
                          setModalState(() {
                            obscureNew = !obscureNew;
                          });
                        },
                      ),
                      validator: (val) {
                        if (val == null || val.length < 6) return 'New password must be at least 6 characters';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    CustomTextField(
                      label: 'Confirm New Password',
                      hint: '••••••••',
                      controller: confirmPasswordController,
                      obscureText: obscureConfirm,
                      prefixIcon: Icons.lock_reset_rounded,
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscureConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: AppColors.textMuted,
                          size: 20,
                        ),
                        onPressed: () {
                          setModalState(() {
                            obscureConfirm = !obscureConfirm;
                          });
                        },
                      ),
                      validator: (val) {
                        if (val != newPasswordController.text) return 'Passwords do not match';
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    CustomButton(
                      text: 'Update Password',
                      isLoading: isLoading,
                      trailingIcon: Icons.arrow_forward_rounded,
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          setModalState(() {
                            isLoading = true;
                          });
                          await context.read<AuthProvider>().changePassword(
                                currentPasswordController.text,
                                newPasswordController.text,
                              );
                          if (ctx.mounted) {
                            Navigator.of(ctx).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Password updated successfully!'),
                                backgroundColor: AppColors.success,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          }
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // 3. Notification Settings Modal Sheet
  void _showNotificationSettingsModal(BuildContext context) {
    bool pushAlerts = true;
    bool emailDigest = true;
    bool smsUpdates = true;
    bool savedPropertyPriceDrops = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
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
                        'Notification Settings',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textMuted),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 8),

                  SwitchListTile(
                    activeThumbColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Push Notifications', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Instant alerts for house inquiries & replies', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: pushAlerts,
                    onChanged: (val) {
                      setModalState(() {
                        pushAlerts = val;
                      });
                    },
                  ),
                  const Divider(height: 1),

                  SwitchListTile(
                    activeThumbColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Email Digest', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Weekly featured homes & newly listed rentals', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: emailDigest,
                    onChanged: (val) {
                      setModalState(() {
                        emailDigest = val;
                      });
                    },
                  ),
                  const Divider(height: 1),

                  SwitchListTile(
                    activeThumbColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('SMS Alerts', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Urgent text alerts from house providers', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: smsUpdates,
                    onChanged: (val) {
                      setModalState(() {
                        smsUpdates = val;
                      });
                    },
                  ),
                  const Divider(height: 1),

                  SwitchListTile(
                    activeThumbColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Saved Property Price Drops', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Notify me when saved homes drop rent price', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: savedPropertyPriceDrops,
                    onChanged: (val) {
                      setModalState(() {
                        savedPropertyPriceDrops = val;
                      });
                    },
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: 'Save Notification Preferences',
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Notification settings updated!'),
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // 4. Account Verification Status Modal Sheet
  void _showAccountVerificationModal(BuildContext context, UserModel user) {
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
                  'Account Verification',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const Divider(color: Color(0xFFE2E8F0)),
            const SizedBox(height: 12),

            // Verified Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.verified_rounded, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.isVerified ? 'Fully Verified Account' : 'Verification Pending',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF065F46),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user.isVerified
                              ? 'Your identity and phone details have been verified.'
                              : 'Upload your Fayda ID or Kebele ID to complete verification.',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF047857)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Checklist
            _buildVerificationTile(
              icon: Icons.phone_iphone_rounded,
              title: 'Phone Number',
              subtitle: user.phone,
              isVerified: true,
            ),
            const SizedBox(height: 10),
            _buildVerificationTile(
              icon: Icons.email_rounded,
              title: 'Email Address',
              subtitle: user.email,
              isVerified: true,
            ),
            const SizedBox(height: 10),
            _buildVerificationTile(
              icon: Icons.badge_rounded,
              title: 'Ethiopian National / Kebele ID',
              subtitle: user.isVerified ? 'Verified ✓ Document on record' : 'Pending Document Upload',
              isVerified: user.isVerified,
            ),
            const SizedBox(height: 24),

            CustomButton(
              text: user.isVerified ? 'Re-upload ID Document' : 'Verify National ID Now',
              variant: user.isVerified ? CustomButtonVariant.outline : CustomButtonVariant.primary,
              icon: Icons.upload_file_rounded,
              onPressed: () {
                context.read<AuthProvider>().updateVerificationStatus(true);
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Verification document submitted! Your account is now fully verified ✓'),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildVerificationTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isVerified,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Icon(
            isVerified ? Icons.check_circle_rounded : Icons.pending_rounded,
            color: isVerified ? AppColors.success : Colors.orange,
            size: 20,
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out?'),
        content: const Text('Are you sure you want to log out of Ethiopian House Rental?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              context.read<AuthProvider>().logout();
              Navigator.of(ctx).pop();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (route) => false,
              );
            },
            child: const Text('Log Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('User Profile'),
        centerTitle: true,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
        ),
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
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
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
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                              decoration: BoxDecoration(
                                color: AppColors.primaryContainer,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Registered: ${authProvider.registeredRole.displayName}',
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
                  const SizedBox(height: 16),

                  // Account Mode Switcher Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: authProvider.isProvider
                            ? [const Color(0xFF0F172A), const Color(0xFF1E293B)]
                            : [const Color(0xFF0C2B22), const Color(0xFF1B4D3E)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(
                                    authProvider.isProvider ? Icons.storefront_rounded : Icons.search_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Active Workspace Mode',
                                      style: TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      authProvider.activeRole.displayName,
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.secondary.withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.secondary.withValues(alpha: 0.5)),
                              ),
                              child: const Text(
                                'ACTIVE',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.8),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          authProvider.isProvider
                              ? 'Manage property listings, respond to inquiry messages & track views.'
                              : 'Explore rental houses, save favorites & inquire house providers.',
                          style: const TextStyle(fontSize: 12, color: Colors.white70, height: 1.3),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 0,
                            ),
                            icon: const Icon(Icons.swap_horiz_rounded, size: 20),
                            label: Text(
                              authProvider.isProvider
                                  ? 'Switch to House Seeker Mode'
                                  : 'Switch to House Provider Mode',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            onPressed: () {
                              final newRole = authProvider.isProvider ? UserRole.seeker : UserRole.provider;
                              authProvider.switchRole(newRole);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Switched to ${newRole.displayName} Mode ✓'),
                                  backgroundColor: AppColors.primary,
                                  behavior: SnackBarBehavior.floating,
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            },
                          ),
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
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
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
                            const SizedBox(height: 12),
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
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                        ),
                                      ),
                                      selected: isSelected,
                                      selectedColor: AppColors.primaryContainer,
                                      backgroundColor: const Color(0xFFF1F5F9),
                                      onSelected: (selected) {
                                        if (selected) {
                                          langProvider.setLanguage(lang);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Language set to ${lang.displayName}'),
                                              backgroundColor: AppColors.primary,
                                              duration: const Duration(seconds: 1),
                                              behavior: SnackBarBehavior.floating,
                                            ),
                                          );
                                        }
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

                  // Menu Settings Options Container
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.person_outline_rounded, color: AppColors.primary),
                          title: const Text('Edit Personal Info', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showEditProfileModal(context, user),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.palette_outlined, color: AppColors.primary),
                          title: const Text('App Theme & Appearance', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Color palette, fonts, corners & dark mode', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
                            );
                          },
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.lock_outline_rounded, color: AppColors.primary),
                          title: const Text('Change Password', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showChangePasswordModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.notifications_none_rounded, color: AppColors.primary),
                          title: const Text('Notification Settings', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showNotificationSettingsModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.verified_outlined, color: AppColors.primary),
                          title: const Text('Account Verification', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Text(user.isVerified ? 'Verified by ID & Phone ✓' : 'Verification Pending', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showAccountVerificationModal(context, user),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: 'Log Out',
                    variant: CustomButtonVariant.outline,
                    icon: Icons.logout_rounded,
                    onPressed: () => _showLogoutDialog(context),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
    );
  }
}
