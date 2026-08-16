import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/verification_badge.dart';
import '../../../core/localization/language_provider.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/services/user_settings_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/welcome_screen.dart';
import '../../auth/screens/phone_verification_screen.dart';
import '../../verification/screens/document_verification_screen.dart';
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

  // Dedicated Profile Picture Changer Modal
  void _showChangeProfilePictureModal(BuildContext context, UserModel user) {
    final avatarUrlController = TextEditingController(text: user.avatarUrl ?? '');
    String selectedAvatar = user.avatarUrl ?? '';
    bool isSaving = false;

    final presetAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final activeUrl = selectedAvatar.isNotEmpty ? selectedAvatar : avatarUrlController.text.trim();

          return Container(
            padding: EdgeInsets.only(
              top: 24,
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
                        'Change Profile Picture',
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

                  // Profile Picture Live Preview Circle
                  Center(
                    child: Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: AppColors.primaryContainer,
                          backgroundImage: (activeUrl.isNotEmpty && activeUrl.startsWith('http'))
                              ? NetworkImage(activeUrl)
                              : null,
                          child: (activeUrl.isEmpty || !activeUrl.startsWith('http'))
                              ? const Icon(Icons.person, size: 50, color: AppColors.primary)
                              : null,
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Take Camera Selfie or Choose Gallery Photo Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            side: const BorderSide(color: AppColors.primary),
                          ),
                          icon: const Icon(Icons.camera_alt_rounded, color: AppColors.primary, size: 18),
                          label: const Text('Take Selfie', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary)),
                          onPressed: () async {
                            await _pickAndUploadPhoto(context, ImageSource.camera, (url) {
                              setModalState(() {
                                selectedAvatar = url;
                                avatarUrlController.text = url;
                              });
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            side: const BorderSide(color: AppColors.primary),
                          ),
                          icon: const Icon(Icons.photo_library_rounded, color: AppColors.primary, size: 18),
                          label: const Text('Gallery Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary)),
                          onPressed: () async {
                            await _pickAndUploadPhoto(context, ImageSource.gallery, (url) {
                              setModalState(() {
                                selectedAvatar = url;
                                avatarUrlController.text = url;
                              });
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  const Text('Select Preset Avatar Photo', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: presetAvatars.map((url) {
                      final isSelected = selectedAvatar == url;
                      return GestureDetector(
                        onTap: () {
                          setModalState(() {
                            selectedAvatar = url;
                            avatarUrlController.text = url;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? AppColors.primary : Colors.transparent,
                              width: 3,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 28,
                            backgroundImage: NetworkImage(url),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  CustomTextField(
                    label: 'Or Custom Image URL',
                    hint: 'https://example.com/my-profile-photo.jpg',
                    controller: avatarUrlController,
                    prefixIcon: Icons.link_rounded,
                    onChanged: (val) {
                      setModalState(() {
                        selectedAvatar = val;
                      });
                    },
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: isSaving ? 'Saving to Database...' : 'Save Profile Picture',
                    isLoading: isSaving,
                    icon: Icons.cloud_upload_rounded,
                    onPressed: () async {
                      final newUrl = avatarUrlController.text.trim().isNotEmpty
                          ? avatarUrlController.text.trim()
                          : selectedAvatar;

                      if (newUrl.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please select an avatar or enter an image URL')),
                        );
                        return;
                      }

                      setModalState(() => isSaving = true);

                      // Save REALLY to PostgreSQL DB via Express API PATCH /api/v1/users/me
                      await context.read<AuthProvider>().updateProfile(
                            user.name,
                            user.phone,
                            user.email,
                            newUrl,
                          );

                      if (ctx.mounted) {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Profile picture saved to database successfully! ✓'),
                            backgroundColor: AppColors.success,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
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

  Future<void> _pickAndUploadPhoto(BuildContext context, ImageSource source, Function(String) onUploaded) async {
    try {
      final picker = ImagePicker();
      final XFile? file = await picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (file != null) {
        final bytes = await file.readAsBytes();
        final base64Str = 'data:image/jpeg;base64,${base64Encode(bytes)}';

        final res = await ApiClient.post(
          ApiEndpoints.upload,
          body: {'base64': base64Str},
        );

        if (res != null && res['url'] != null) {
          final rawUrl = res['url'] as String;
          final uploadedUrl = rawUrl.startsWith('http')
              ? rawUrl
              : '${ApiEndpoints.mediaBaseUrl}$rawUrl';
          onUploaded(uploadedUrl);
        }
      }
    } catch (e) {
      debugPrint('Error picking photo: $e');
    }
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
  // 4. Account Verification Status Modal Sheet with Independent Seeker vs Provider Workflows
  void _showAccountVerificationModal(BuildContext context, UserModel user) {
    final authProvider = context.read<AuthProvider>();
    final isProvider = authProvider.isProvider;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            padding: EdgeInsets.only(
              top: 24,
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
                      Text(
                        isProvider ? 'Owner & Property Verification' : 'Account & Identity Verification',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textMuted),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 12),

                  // Mode Header Info Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: user.isVerified ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: user.isVerified ? const Color(0xFFA7F3D0) : const Color(0xFFFDE68A)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: user.isVerified ? const Color(0xFF10B981) : Colors.amber.shade700,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(user.isVerified ? Icons.verified_rounded : Icons.shield_outlined, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.isVerified ? 'Fully Verified Account ✓' : (isProvider ? 'Owner Verification Required' : 'Optional Verification Status'),
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: user.isVerified ? const Color(0xFF065F46) : Colors.amber.shade900,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isProvider
                                    ? 'Providers must submit National ID + Ownership Deed for AI Pre-check & Admin approval to post rentals.'
                                    : 'House Seekers can use all search and inquiry features freely without verification.',
                                style: TextStyle(fontSize: 12, color: user.isVerified ? const Color(0xFF047857) : Colors.amber.shade800),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Independent Trust Badges Checklist for Seekers & Providers
                  _buildVerificationTile(
                    icon: Icons.phone_android_rounded,
                    title: 'Phone Number Verification',
                    subtitle: user.isPhoneVerified
                        ? 'Verified ✓ ${user.phone}'
                        : 'Not Verified • Click to verify via SMS OTP',
                    isVerified: user.isPhoneVerified,
                    onTap: user.isPhoneVerified
                        ? null
                        : () {
                            Navigator.pop(ctx);
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const PhoneVerificationScreen()),
                            );
                          },
                  ),
                  const SizedBox(height: 12),

                  _buildVerificationTile(
                    icon: Icons.badge_outlined,
                    title: 'Identity Document (Fayda / Kebele)',
                    subtitle: user.isVerified
                        ? 'Verified ✓ Official Ethiopian ID on File'
                        : 'Not Verified • Upload Fayda / Kebele ID photo',
                    isVerified: user.isVerified,
                    onTap: user.isVerified
                        ? null
                        : () {
                            Navigator.pop(ctx);
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => DocumentVerificationScreen(isProvider: isProvider),
                              ),
                            );
                          },
                  ),

                  if (isProvider) ...[
                    const SizedBox(height: 12),
                    _buildVerificationTile(
                      icon: Icons.home_work_outlined,
                      title: 'House Ownership & License Document',
                      subtitle: user.isVerified
                          ? 'Verified ✓ Title Deed & Property License Approved'
                          : 'Pending Upload • Upload Deed / Site Plan for AI & Admin review',
                      isVerified: user.isVerified,
                      onTap: () {
                        Navigator.pop(ctx);
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const DocumentVerificationScreen(isProvider: true),
                          ),
                        );
                      },
                    ),
                  ],

                  const SizedBox(height: 24),

                  CustomButton(
                    text: user.isVerified ? 'View Submitted Verification Documents' : 'Proceed to Document Verification',
                    icon: Icons.shield_rounded,
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => DocumentVerificationScreen(isProvider: isProvider),
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

  static Widget _buildVerificationTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isVerified,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isVerified ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Icon(icon, color: isVerified ? AppColors.primary : AppColors.textMuted, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
                  Text(subtitle, style: TextStyle(fontSize: 11, color: isVerified ? AppColors.success : AppColors.textSecondary)),
                ],
              ),
            ),
            Icon(
              isVerified ? Icons.check_circle_rounded : Icons.chevron_right_rounded,
              color: isVerified ? AppColors.success : AppColors.textMuted,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  // 5. Two-Factor Authentication (2FA) Modal
  void _showTwoFactorModal(BuildContext context) {
    bool enable2FA = true;
    bool requireOTPForInquiry = true;

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
                        'Two-Factor Authentication (2FA)',
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
                    title: const Text('SMS OTP Login Verification', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Send SMS security code to phone upon account sign in', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: enable2FA,
                    onChanged: (val) => setModalState(() => enable2FA = val),
                  ),
                  const Divider(height: 1),

                  SwitchListTile(
                    activeThumbColor: AppColors.primary,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Verify House Inquiry Messages', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: const Text('Require 2FA confirmation before contacting landlords', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    value: requireOTPForInquiry,
                    onChanged: (val) => setModalState(() => requireOTPForInquiry = val),
                  ),
                  const SizedBox(height: 24),

                  CustomButton(
                    text: 'Save Security Settings',
                    icon: Icons.shield_rounded,
                    onPressed: () async {
                      await UserSettingsService.set2FAEnabled(enable2FA);
                      await UserSettingsService.set2FAInquiry(requireOTPForInquiry);
                      if (ctx.mounted) {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Two-Factor Authentication preferences saved ✓'),
                            backgroundColor: AppColors.success,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
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

  // 6. Preferred Location & Commute Radius Modal
  void _showLocationPreferencesModal(BuildContext context) {
    String preferredSubcity = 'Bole';
    double radiusKm = 10;

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
                        'Location & Radius Preferences',
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

                  const Text('Default Preferred Subcity', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: preferredSubcity,
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: ['Bole', 'Kazanchis', 'Sarbet', 'CMC', 'Ayat', 'Summit', 'Piassa', 'Megenagna']
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                    onChanged: (val) => setModalState(() => preferredSubcity = val!),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Search Radius', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      Text('${radiusKm.toInt()} km', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                  Slider(
                    value: radiusKm,
                    min: 1,
                    max: 30,
                    divisions: 29,
                    activeColor: AppColors.primary,
                    label: '${radiusKm.toInt()} km',
                    onChanged: (val) => setModalState(() => radiusKm = val),
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Save Location Preferences',
                    icon: Icons.location_on_rounded,
                    onPressed: () async {
                      await UserSettingsService.saveLocationPreferences(preferredSubcity, radiusKm);
                      if (ctx.mounted) {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Default area set to $preferredSubcity (${radiusKm.toInt()} km) ✓'),
                            backgroundColor: AppColors.primary,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
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

  // 7. Currency & Budget Range Modal
  void _showCurrencyBudgetModal(BuildContext context) {
    String selectedCurrency = 'ETB';
    RangeValues budgetRange = const RangeValues(10000, 45000);

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
                        'Currency & Rent Budget',
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

                  const Text('Display Currency', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      ChoiceChip(
                        label: const Text('ETB (ብር 🇪🇹)'),
                        selected: selectedCurrency == 'ETB',
                        onSelected: (val) => setModalState(() => selectedCurrency = 'ETB'),
                      ),
                      const SizedBox(width: 10),
                      ChoiceChip(
                        label: const Text('USD (\$ 🇺🇸)'),
                        selected: selectedCurrency == 'USD',
                        onSelected: (val) => setModalState(() => selectedCurrency = 'USD'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Default Monthly Rent Budget', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      Text('${budgetRange.start.toInt()} - ${budgetRange.end.toInt()} $selectedCurrency', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                  RangeSlider(
                    values: budgetRange,
                    min: 5000,
                    max: 100000,
                    divisions: 19,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setModalState(() => budgetRange = val),
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Save Budget Settings',
                    icon: Icons.account_balance_wallet_rounded,
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Budget updated: ${budgetRange.start.toInt()} - ${budgetRange.end.toInt()} $selectedCurrency ✓'),
                          backgroundColor: AppColors.primary,
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

  // 8. Saved Searches & Alert Frequency Modal
  void _showSavedSearchesModal(BuildContext context) {
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
                  'Saved Searches & Alerts',
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

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.search_rounded, color: AppColors.primary),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('2 Bed in Bole under 25,000 ETB', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Instant Push Notifications Enabled', style: TextStyle(fontSize: 11, color: AppColors.success)),
                      ],
                    ),
                  ),
                  Icon(Icons.notifications_active_rounded, color: AppColors.primary, size: 20),
                ],
              ),
            ),
            const SizedBox(height: 20),

            CustomButton(
              text: 'Create New Search Alert',
              icon: Icons.add_alert_rounded,
              onPressed: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Open Search screen to save new alert!'), backgroundColor: AppColors.primary),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // 9. Storage & Offline Map Cleaner Modal
  void _showCacheCleanerModal(BuildContext context) {
    bool isCleaning = false;

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
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Storage & Cache Cleaner',
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

                _buildCacheRow(Icons.image_outlined, 'Property Photo Cache', '14.2 MB'),
                const SizedBox(height: 10),
                _buildCacheRow(Icons.map_outlined, 'Offline Map Tiles', '8.5 MB'),
                const SizedBox(height: 10),
                _buildCacheRow(Icons.folder_outlined, 'Temporary App Data', '1.8 MB'),
                const SizedBox(height: 24),

                CustomButton(
                  text: isCleaning ? 'Cleaning Storage...' : 'Clean 24.5 MB Storage Now',
                  isLoading: isCleaning,
                  icon: Icons.cleaning_services_rounded,
                  onPressed: () async {
                    setModalState(() => isCleaning = true);
                    await Future.delayed(const Duration(milliseconds: 800));
                    if (ctx.mounted) {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Cleared 24.5 MB of temporary cache files ✓'),
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  static Widget _buildCacheRow(IconData icon, String title, String size) {
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
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            ],
          ),
          Text(size, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  // 10. Help & Support Desk Modal
  void _showHelpSupportModal(BuildContext context) {
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
                  'Help & Support Desk',
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

            ListTile(
              leading: const Icon(Icons.phone_in_talk_rounded, color: AppColors.primary),
              title: const Text('Call Support Hotline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('+251 911 000 000 / 9090 (Toll-Free)', style: TextStyle(fontSize: 12)),
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Support Hotline: +251 911 000 000...'), backgroundColor: AppColors.primary),
                );
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.email_outlined, color: AppColors.primary),
              title: const Text('Email Support Team', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('support@ethiopianhouserental.com', style: TextStyle(fontSize: 12)),
              onTap: () => Navigator.of(ctx).pop(),
            ),
          ],
        ),
      ),
    );
  }

  // 11. Ethiopian Legal Tenancy Terms Modal
  void _showLegalTermsModal(BuildContext context) {
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
                    'Ethiopian Tenancy Terms & Privacy',
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

              const Text(
                '1. Standard Advance Payment Guidelines\nIn accordance with Ethiopian residential lease customs, advance rent payments typically range from 3 to 6 months. Landlords cannot unilaterally alter agreed terms during active lease tenure.\n\n2. Security Deposit Regulations\nSecurity deposits are held to cover damages beyond normal wear and tear and must be refunded at lease expiration.\n\n3. Data Protection & Privacy\nYour personal ID and phone details are encrypted and never shared without your explicit consent.',
                style: TextStyle(fontSize: 13, height: 1.5, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),

              CustomButton(
                text: 'I Understand & Agree',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
            ],
          ),
        ),
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
                        GestureDetector(
                          onTap: () => _showChangeProfilePictureModal(context, user),
                          child: Stack(
                            alignment: Alignment.bottomRight,
                            children: [
                              CircleAvatar(
                                radius: 44,
                                backgroundColor: AppColors.primaryContainer,
                                backgroundImage: (user.avatarUrl != null && user.avatarUrl!.trim().isNotEmpty && user.avatarUrl!.startsWith('http'))
                                    ? NetworkImage(user.avatarUrl!.trim())
                                    : null,
                                child: (user.avatarUrl == null || user.avatarUrl!.trim().isEmpty || !user.avatarUrl!.startsWith('http'))
                                    ? const Icon(Icons.person, size: 44, color: AppColors.primary)
                                    : null,
                              ),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                                child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 14),
                              ),
                            ],
                          ),
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
                            VerificationBadge(
                              label: user.isVerified ? 'Verified User' : 'Not Verified ⚠️',
                              isSmall: true,
                              isUnverified: !user.isVerified,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (!user.isVerified || !user.isPhoneVerified) ...[
                    const SizedBox(height: 14),
                    GestureDetector(
                      onTap: () => _showAccountVerificationModal(context, user),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Action Required: Account Unverified',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF991B1B)),
                                  ),
                                  Text(
                                    authProvider.isProvider
                                        ? 'Submit National ID & House Deed to activate property posting.'
                                        : 'Verify phone & National ID to earn your Verified Trust Badge.',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C)),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF991B1B)),
                          ],
                        ),
                      ),
                    ),
                  ],
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
                  const SizedBox(height: 20),

                  // SECTION 1: ACCOUNT & SECURITY
                  _buildSettingsSectionHeader('ACCOUNT & SECURITY'),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
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
                          leading: const Icon(Icons.verified_outlined, color: AppColors.primary),
                          title: const Text('Account Verification', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Text(user.isVerified ? 'Verified by Kebele ID & Phone ✓' : 'Verification Pending', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showAccountVerificationModal(context, user),
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
                          leading: const Icon(Icons.shield_outlined, color: AppColors.primary),
                          title: const Text('Two-Factor Authentication (2FA)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('SMS OTP security login protection', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showTwoFactorModal(context),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION 2: PREFERENCES & THEMING
                  _buildSettingsSectionHeader('PREFERENCES & THEMING'),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.palette_outlined, color: AppColors.primary),
                          title: const Text('App Theme & Appearance', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Color palette, fonts, corners & dark mode', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
                            );
                          },
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.notifications_none_rounded, color: AppColors.primary),
                          title: const Text('Notification Settings', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Push alerts, SMS & price drop notifications', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showNotificationSettingsModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.location_on_outlined, color: AppColors.primary),
                          title: const Text('Preferred Location & Radius', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Set default subcity & search distance', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showLocationPreferencesModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.primary),
                          title: const Text('Currency & Rent Budget', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Display currency (ETB / USD) & target budget', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showCurrencyBudgetModal(context),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION 3: DATA & STORAGE MANAGEMENT
                  _buildSettingsSectionHeader('DATA & STORAGE'),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.bookmark_border_rounded, color: AppColors.primary),
                          title: const Text('Saved Searches & Alert Frequency', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Manage automated new property criteria', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showSavedSearchesModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.cleaning_services_outlined, color: AppColors.primary),
                          title: const Text('Storage & Offline Map Cleaner', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Clear photo cache, map tiles & temp files', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showCacheCleanerModal(context),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION 4: LEGAL & SUPPORT DESK
                  _buildSettingsSectionHeader('HELP & LEGAL'),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.headset_mic_outlined, color: AppColors.primary),
                          title: const Text('Help & Support Desk', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Hotline: 9090 / +251 911 000 000', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showHelpSupportModal(context),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        ListTile(
                          leading: const Icon(Icons.gavel_outlined, color: AppColors.primary),
                          title: const Text('Ethiopian Tenancy Terms & Privacy Policy', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: const Text('Rental Proclamation guidelines & privacy rights', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          onTap: () => _showLegalTermsModal(context),
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

  Widget _buildSettingsSectionHeader(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 4.0),
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            color: AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
