import 'package:flutter/material.dart';

class GoogleAccountOption {
  final String name;
  final String email;
  final String avatarUrl;

  const GoogleAccountOption({
    required this.name,
    required this.email,
    required this.avatarUrl,
  });
}

class GoogleAccountPickerDialog extends StatefulWidget {
  final Function(GoogleAccountOption selectedAccount) onAccountSelected;

  const GoogleAccountPickerDialog({
    super.key,
    required this.onAccountSelected,
  });

  @override
  State<GoogleAccountPickerDialog> createState() => _GoogleAccountPickerDialogState();
}

class _GoogleAccountPickerDialogState extends State<GoogleAccountPickerDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text.trim();
      final name = _nameController.text.trim();
      Navigator.of(context).pop();
      widget.onAccountSelected(
        GoogleAccountOption(
          name: name.isNotEmpty ? name : email.split('@').first,
          email: email,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Google Branding Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.network(
                      'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                      width: 28,
                      height: 28,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.g_mobiledata_rounded, size: 32, color: Colors.red),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Google Authentication',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Enter your Google account email to sign in or register on Ethiopian House Rental',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFF6B7280),
                  ),
                ),
                const SizedBox(height: 20),
                const Divider(height: 1, color: Color(0xFFE5E7EB)),
                const SizedBox(height: 20),

                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autofocus: true,
                  decoration: InputDecoration(
                    labelText: 'Google Email Address *',
                    hintText: 'user@gmail.com',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.email_outlined),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Please enter your Google email';
                    }
                    if (!val.contains('@')) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Your Name (Optional)',
                    hintText: 'e.g. Abebe Bikila',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 20),

                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancel', style: TextStyle(color: Color(0xFF6B7280))),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _submit,
                        child: const Text(
                          'Continue with Google',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
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
