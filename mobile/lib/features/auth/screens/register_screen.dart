import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import '../../house_seeker/screens/seeker_main_layout.dart';
import '../../house_provider/screens/provider_main_layout.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  UserRole _selectedRole = UserRole.seeker;
  bool _obscurePassword = true;

  void _onRegister() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = context.read<AuthProvider>();
      final success = await authProvider.register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        password: _passwordController.text,
        role: _selectedRole,
      );

      if (success && mounted) {
        if (_selectedRole == UserRole.provider) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const ProviderMainLayout()),
            (route) => false,
          );
        } else {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const SeekerMainLayout()),
            (route) => false,
          );
        }
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Join Ethiopian House Rental',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Select your role and enter your contact details below.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),

                // Select Account Type Box
                const Text(
                  '1. Select Your Role',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _RoleCard(
                        title: 'HOUSE SEEKER',
                        subtitle: 'I want to find & rent a home',
                        icon: Icons.person_search_rounded,
                        isSelected: _selectedRole == UserRole.seeker,
                        onTap: () {
                          setState(() {
                            _selectedRole = UserRole.seeker;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _RoleCard(
                        title: 'HOUSE PROVIDER',
                        subtitle: 'I own/manage house for rent',
                        icon: Icons.storefront_rounded,
                        isSelected: _selectedRole == UserRole.provider,
                        onTap: () {
                          setState(() {
                            _selectedRole = UserRole.provider;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                const Text(
                  '2. Personal Details',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  label: 'Full Name',
                  hint: 'e.g. Abebe Bikila or Tigist Assefa',
                  controller: _nameController,
                  prefixIcon: Icons.person_outline,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Please enter your full name';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Phone Number (Ethiopia)',
                  hint: 'e.g. +251 91 123 4567',
                  controller: _phoneController,
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Please enter a valid phone number';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Email Address',
                  hint: 'e.g. name@example.com',
                  controller: _emailController,
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (val) {
                    if (val == null || !val.contains('@')) return 'Please enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Create Password',
                  hint: '••••••••',
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  prefixIcon: Icons.lock_outline,
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: AppColors.textMuted),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                  validator: (val) {
                    if (val == null || val.length < 6) return 'Password must be at least 6 characters';
                    return null;
                  },
                ),

                const SizedBox(height: 24),
                CustomButton(
                  text: 'Register as ${_selectedRole.displayName}',
                  isLoading: authProvider.isLoading,
                  onPressed: _onRegister,
                ),
                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ', style: TextStyle(color: AppColors.textSecondary)),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: const Text(
                        'Log In',
                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryContainer : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 28,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
