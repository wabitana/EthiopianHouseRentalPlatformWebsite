import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isSent = false;
  bool _isLoading = false;

  void _onSendReset() async {
    if (_emailController.text.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _isLoading = false;
        _isSent = true;
      });
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
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _isSent
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.mark_email_read_rounded,
                      size: 72,
                      color: AppColors.success,
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Reset Code Sent!',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'We have sent password reset instructions to ${_emailController.text}. Please check your email or phone SMS.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 32),
                    CustomButton(
                      text: 'Back to Login',
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
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
                      'Enter your registered email address or phone number to receive reset instructions.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    CustomTextField(
                      label: 'Email or Phone Number',
                      hint: 'e.g. +251 91 123 4567',
                      controller: _emailController,
                      prefixIcon: Icons.email_outlined,
                    ),
                    const SizedBox(height: 24),
                    CustomButton(
                      text: 'Send Reset Link',
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
