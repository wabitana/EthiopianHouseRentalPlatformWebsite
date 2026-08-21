import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _isSent = false;
  bool _isLoading = false;
  String? _errorMsg;

  void _onSendReset() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.sendForgotPassword(email);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (success) {
          _isSent = true;
        } else {
          _errorMsg = authProvider.errorMessage ?? 'Failed to send reset code';
        }
      });
    }
  }

  void _onConfirmReset() async {
    final email = _emailController.text.trim();
    final code = _codeController.text.trim();
    final newPassword = _newPasswordController.text.trim();

    if (code.isEmpty || newPassword.length < 6) {
      setState(() => _errorMsg = 'Please enter valid code and new password (min 6 chars)');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.resetPassword(email, code, newPassword);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successfully! Please log in.'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      } else {
        setState(() {
          _errorMsg = authProvider.errorMessage ?? 'Invalid code or password reset failed';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Reset Password'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: _isSent
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.lock_reset_rounded,
                      size: 64,
                      color: AppColors.primary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Enter Verification Code & New Password',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We have sent a 6-digit OTP code to ${_emailController.text}.',
                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 24),
                    if (_errorMsg != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.rejected.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _errorMsg!,
                          style: const TextStyle(color: AppColors.rejected, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    CustomTextField(
                      label: '6-Digit OTP Verification Code',
                      hint: 'e.g. 123456',
                      controller: _codeController,
                      keyboardType: TextInputType.number,
                      prefixIcon: Icons.verified_user_outlined,
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      label: 'New Password',
                      hint: 'Minimum 6 characters',
                      controller: _newPasswordController,
                      obscureText: true,
                      prefixIcon: Icons.lock_outline,
                    ),
                    const SizedBox(height: 24),
                    CustomButton(
                      text: 'Reset Password & Save',
                      isLoading: _isLoading,
                      onPressed: _onConfirmReset,
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Forgot Password?',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Enter your registered email address to receive password reset instructions.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (_errorMsg != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.rejected.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _errorMsg!,
                          style: const TextStyle(color: AppColors.rejected, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    CustomTextField(
                      label: 'Registered Email Address',
                      hint: 'e.g. abebe@gmail.com',
                      controller: _emailController,
                      prefixIcon: Icons.email_outlined,
                    ),
                    const SizedBox(height: 24),
                    CustomButton(
                      text: 'Send Reset OTP Code',
                      isLoading: _isLoading,
                      onPressed: _onSendReset,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
