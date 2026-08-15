import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_button.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Header Brand Icon
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(
                  Icons.home_work_rounded,
                  size: 64,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                AppConstants.appName,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Connecting House Seekers & Providers across Ethiopia with trust and convenience.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const Spacer(),

              // Role selection preview cards
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _RoleInfoBox(
                        title: 'House Seeker',
                        description: 'Find & rent homes',
                        icon: Icons.person_search_rounded,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _RoleInfoBox(
                        title: 'House Provider',
                        description: 'Post & manage listings',
                        icon: Icons.storefront_rounded,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // CTA Buttons
              CustomButton(
                text: 'Create New Account',
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Log In to Account',
                variant: CustomButtonVariant.outline,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleInfoBox extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;

  const _RoleInfoBox({
    required this.title,
    required this.description,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 28),
          const SizedBox(height: 6),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 2),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
