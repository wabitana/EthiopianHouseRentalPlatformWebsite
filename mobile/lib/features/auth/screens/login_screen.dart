import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';
import '../../../shared/widgets/main_layout_wrapper.dart';
import '../../../shared/widgets/google_account_picker_dialog.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

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
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const MainLayoutWrapper()),
          (route) => false,
        );
      }
    }
  }

  void _onGoogleLogin() {
    showDialog(
      context: context,
      builder: (ctx) => GoogleAccountPickerDialog(
        onAccountSelected: (account) async {
          final authProvider = context.read<AuthProvider>();
          final success = await authProvider.loginWithGoogle(
            _selectedRole,
            email: account.email,
            name: account.name,
            avatarUrl: account.avatarUrl,
          );
          if (success && mounted) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const MainLayoutWrapper()),
              (route) => false,
            );
          }
        },
      ),
    );
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
    final isSeeker = _selectedRole == UserRole.seeker;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Hero Header Banner
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0C2B22), Color(0xFF1B4D3E), Color(0xFF256A55)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(36),
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Stack(
                  children: [
                    // Ambient Background Decorative Glow Rings
                    Positioned(
                      top: -30,
                      right: -30,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.secondary.withValues(alpha: 0.15),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: -20,
                      left: -20,
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.05),
                        ),
                      ),
                    ),

                    // Header Main Content
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 44),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top Navigation & Brand Badge
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (Navigator.canPop(context))
                                InkWell(
                                  onTap: () => Navigator.pop(context),
                                  borderRadius: BorderRadius.circular(50),
                                  child: Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.18),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.arrow_back_rounded,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                )
                              else
                                const SizedBox.shrink(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary.withValues(alpha: 0.22),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.secondary.withValues(alpha: 0.4)),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(Icons.stars_rounded, size: 15, color: Color(0xFFF59E0B)),
                                    SizedBox(width: 6),
                                    Text(
                                      'Ethiopian Rental',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Brand Logo & Welcome Greeting
                          Row(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: AppColors.secondary.withValues(alpha: 0.5), width: 1.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.2),
                                      blurRadius: 18,
                                      offset: const Offset(0, 6),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.home_work_rounded,
                                  size: 32,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Welcome Back! 👋',
                                      style: TextStyle(
                                        fontSize: 25,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.white,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    SizedBox(height: 4),
                                    Text(
                                      'Sign in to access your properties & saved listings',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFFD1FAE5),
                                        fontWeight: FontWeight.w400,
                                        height: 1.25,
                                      ),
                                    ),
                                  ],
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

            // Main Floating Form Sheet Card
            Transform.translate(
              offset: const Offset(0, -24),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Role Title Label
                        const Text(
                          'ACCOUNT ROLE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textSecondary,
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Segmented Role Switcher Tab
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: _RoleSegmentTab(
                                  title: 'House Seeker',
                                  icon: Icons.person_search_rounded,
                                  isSelected: isSeeker,
                                  onTap: () {
                                    setState(() {
                                      _selectedRole = UserRole.seeker;
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: _RoleSegmentTab(
                                  title: 'House Provider',
                                  icon: Icons.storefront_rounded,
                                  isSelected: !isSeeker,
                                  onTap: () {
                                    setState(() {
                                      _selectedRole = UserRole.provider;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Email or Phone Input
                        CustomTextField(
                          label: 'Email or Phone Number',
                          hint: 'e.g. tigist@example.com or +251 911 234 567',
                          controller: _emailController,
                          prefixIcon: isSeeker ? Icons.mail_outline_rounded : Icons.business_outlined,
                          keyboardType: TextInputType.emailAddress,
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) return 'Please enter your email or phone number';
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Password Input
                        CustomTextField(
                          label: 'Password',
                          hint: '••••••••',
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          prefixIcon: Icons.lock_outline_rounded,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: AppColors.textMuted,
                              size: 20,
                            ),
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
                        const SizedBox(height: 10),

                        // Forgot Password Action Link
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                              );
                            },
                            child: const Text(
                              'Forgot Password?',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),

                        // Error Banner Container
                        if (authProvider.errorMessage != null) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: AppColors.rejectedBackground,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.rejected.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline_rounded, color: AppColors.rejected, size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    authProvider.errorMessage!,
                                    style: const TextStyle(
                                      color: AppColors.rejected,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 24),

                        // Primary Action Button
                        CustomButton(
                          text: 'Log In as ${_selectedRole.displayName}',
                          trailingIcon: Icons.arrow_forward_rounded,
                          isLoading: authProvider.isLoading,
                          onPressed: _onLogin,
                        ),
                        const SizedBox(height: 12),

                        // Google Authentication Button
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                            side: const BorderSide(color: Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            backgroundColor: Colors.white,
                          ),
                          onPressed: authProvider.isLoading ? null : _onGoogleLogin,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.network(
                                'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                                width: 22,
                                height: 22,
                                errorBuilder: (context, error, stackTrace) => const Icon(Icons.g_mobiledata_rounded, size: 28, color: Colors.red),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'Continue with Google',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Footer Navigation Switch
                        Row(
                          children: [
                            const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                'OR',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textMuted,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                          ],
                        ),
                        const SizedBox(height: 20),

                        Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                "Don't have an account? ",
                                style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                  );
                                },
                                child: const Text(
                                  'Register Now',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleSegmentTab extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleSegmentTab({
    required this.title,
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
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: isSelected ? Border.all(color: AppColors.primary, width: 1.5) : null,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              const Icon(
                Icons.check_circle_rounded,
                size: 14,
                color: AppColors.primary,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
