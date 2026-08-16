import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';

class IdentityVerificationScreen extends StatefulWidget {
  const IdentityVerificationScreen({super.key});

  @override
  State<IdentityVerificationScreen> createState() => _IdentityVerificationScreenState();
}

class _IdentityVerificationScreenState extends State<IdentityVerificationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _idNumberController = TextEditingController();
  String _selectedIdType = 'NATIONAL_ID';
  bool _isSubmitting = false;
  File? _idDocumentFile;
  File? _selfieFile;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(bool isSelfie) async {
    final XFile? image = await _picker.pickImage(
      source: isSelfie ? ImageSource.camera : ImageSource.gallery,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        if (isSelfie) {
          _selfieFile = File(image.path);
        } else {
          _idDocumentFile = File(image.path);
        }
      });
    }
  }

  Future<void> _submitVerification() async {
    if (!_formKey.currentState!.validate()) return;
    if (_idDocumentFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or capture your National ID photo')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      // 1. Upload ID Document Photo
      final bytes = await _idDocumentFile!.readAsBytes();
      final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      final uploadRes = await ApiClient.post(ApiEndpoints.upload, body: {'base64': base64Image});
      final docUrl = uploadRes?['url'] ?? '';

      // 2. Upload Selfie (if captured)
      String selfieUrl = '';
      if (_selfieFile != null) {
        final selfieBytes = await _selfieFile!.readAsBytes();
        final selfieBase64 = 'data:image/jpeg;base64,${base64Encode(selfieBytes)}';
        final selfieUpload = await ApiClient.post(ApiEndpoints.upload, body: {'base64': selfieBase64});
        selfieUrl = selfieUpload?['url'] ?? '';
      }

      // 3. Submit Identity Verification to backend
      final res = await ApiClient.post(
        '${ApiEndpoints.baseUrl}/verification/identity',
        body: {
          'idType': _selectedIdType,
          'idNumber': _idNumberController.text.trim(),
          'documentUrl': docUrl,
          'selfieUrl': selfieUrl,
        },
      );

      if (res != null && res['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Identity Verification Submitted! Verified User Badge Awarded ✓'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context, true);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res?['error'] ?? 'Verification submission failed')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error submitting verification: $e'), backgroundColor: Colors.redAccent),
      );
    }
    setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Identity Verification'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: AppColors.primary, size: 32),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Official Identity Verification', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          SizedBox(height: 4),
                          Text('Upload your Ethiopian National ID or Passport to unlock the Verified User Badge.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text('Document Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedIdType,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
                items: const [
                  DropdownMenuItem(value: 'NATIONAL_ID', child: Text('Ethiopian National ID (Fayda / Kebele)')),
                  DropdownMenuItem(value: 'PASSPORT', child: Text('Ethiopian Passport')),
                  DropdownMenuItem(value: 'DRIVERS_LICENSE', child: Text('Driver\'s License')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedIdType = val);
                },
              ),
              const SizedBox(height: 16),

              const Text('ID Document Number', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _idNumberController,
                decoration: InputDecoration(
                  hintText: 'e.g. ETH-908123-99',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.badge_outlined),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your ID document number' : null,
              ),
              const SizedBox(height: 20),

              // Upload ID Document Photo
              const Text('National ID / Document Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              InkWell(
                onTap: () => _pickImage(false),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: _idDocumentFile != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.file(_idDocumentFile!, fit: BoxFit.cover),
                        )
                      : const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo_outlined, size: 36, color: AppColors.primary),
                            SizedBox(height: 8),
                            Text('Tap to select ID Document photo', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 20),

              // Camera Selfie Capture
              const Text('Selfie Verification Photo (Camera)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              InkWell(
                onTap: () => _pickImage(true),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: _selfieFile != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.file(_selfieFile!, fit: BoxFit.cover),
                        )
                      : const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.camera_front_rounded, size: 32, color: AppColors.secondary),
                            SizedBox(height: 6),
                            Text('Take a live selfie photo with camera', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitVerification,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Document for Verification', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
