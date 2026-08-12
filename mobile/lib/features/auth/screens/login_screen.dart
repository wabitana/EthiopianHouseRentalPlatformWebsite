import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';
import '../../house_seeker/screens/seeker_main_layout.dart';
import '../../house_provider/screens/provider_main_layout.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'tigist@example.com');
  final _passwordController = TextEditingController(text: 'password123');

  UserRole _selectedRole = UserRole.seeker;
  bool _obscurePassword = true;

  void _onLogin() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = context.read<AuthProvider>();
      final success = await authProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
        _selectedRole,
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
        title: const Text('Log In'),
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
                  'Welcome Back!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sign in to access your properties, saved listings, and inquiries.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),

                // Role Toggle Selector
                const Text(
                  'Account Role',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.person_search_rounded, size: 18),
                            SizedBox(width: 6),
                            Text('House Seeker'),
                          ],
                        ),
                        selected: _selectedRole == UserRole.seeker,
                        selectedColor: AppColors.primaryContainer,
                        side: BorderSide(
                          color: _selectedRole == UserRole.seeker ? AppColors.primary : AppColors.border,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedRole = UserRole.seeker;
                              _emailController.text = 'tigist@example.com';
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        label: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.storefront_rounded, size: 18),
                            SizedBox(width: 6),
                            Text('House Provider'),
                          ],
                        ),
                        selected: _selectedRole == UserRole.provider,
                        selectedColor: AppColors.primaryContainer,
                        side: BorderSide(
                          color: _selectedRole == UserRole.provider ? AppColors.primary : AppColors.border,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedRole = UserRole.provider;
                              _emailController.text = 'abebe@example.com';
                            });
                          }
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Inputs
                CustomTextField(
                  label: 'Email or Phone Number',
                  hint: 'e.g. +251 91 123 4567 or email@domain.com',
                  controller: _emailController,
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Please enter your email or phone';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Password',
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
                    if (val == null || val.length < 4) return 'Password must be at least 4 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 8),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                      );
                    },
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),

                if (authProvider.errorMessage != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.rejectedBackground,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.rejected, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            authProvider.errorMessage!,
                            style: const TextStyle(color: AppColors.rejected, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 24),
                CustomButton(
                  text: 'Log In as ${_selectedRole.displayName}',
                  isLoading: authProvider.isLoading,
                  onPressed: _onLogin,
                ),
                const SizedBox(height: 24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? ", style: TextStyle(color: AppColors.textSecondary)),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                        );
                      },
                      child: const Text(
                        'Register Now',
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
