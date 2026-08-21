import 'package:flutter/material.dart';
import '../../core/constants/ethiopia_locations.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/custom_button.dart';

class GoogleLocationResult {
  final String region;
  final String city;
  final String? address;
  final String? phone;

  const GoogleLocationResult({
    required this.region,
    required this.city,
    this.address,
    this.phone,
  });
}

class GoogleLocationDialog extends StatefulWidget {
  final String googleName;
  final String googleEmail;
  final String? googlePhoto;
  final Function(GoogleLocationResult result) onSubmit;

  const GoogleLocationDialog({
    super.key,
    required this.googleName,
    required this.googleEmail,
    this.googlePhoto,
    required this.onSubmit,
  });

  @override
  State<GoogleLocationDialog> createState() => _GoogleLocationDialogState();
}

class _GoogleLocationDialogState extends State<GoogleLocationDialog> {
  final _formKey = GlobalKey<FormState>();
  String _selectedRegion = 'Addis Ababa';
  String _selectedCity = 'Bole';
  bool _isCustomCity = false;
  final _customCityController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _customCityController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final finalCity = _isCustomCity && _customCityController.text.trim().isNotEmpty
          ? _customCityController.text.trim()
          : _selectedCity;

      Navigator.of(context).pop();
      widget.onSubmit(
        GoogleLocationResult(
          region: _selectedRegion,
          city: finalCity,
          address: _addressController.text.trim().isNotEmpty ? _addressController.text.trim() : null,
          phone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cities = EthiopiaLocations.getCitiesForRegion(_selectedRegion);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 440),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Google Branding
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 2),
                        ),
                        child: CircleAvatar(
                          radius: 28,
                          backgroundColor: Colors.grey.shade100,
                          backgroundImage: widget.googlePhoto != null ? NetworkImage(widget.googlePhoto!) : null,
                          child: widget.googlePhoto == null
                              ? const Icon(Icons.person, size: 30, color: AppColors.primary)
                              : null,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Welcome, ${widget.googleName}!',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.googleEmail,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.location_on_outlined, color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Please specify your location details to complete registration.',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 1. Region Dropdown
                const Text(
                  'Administrative Region *',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedRegion,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.map_outlined, color: AppColors.primary),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  items: EthiopiaLocations.regions.map((reg) {
                    return DropdownMenuItem(value: reg, child: Text(reg));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedRegion = val;
                        final newCities = EthiopiaLocations.getCitiesForRegion(val);
                        _selectedCity = newCities.first;
                        _isCustomCity = false;
                      });
                    }
                  },
                ),
                const SizedBox(height: 14),

                // 2. City / Sub-City Dropdown
                const Text(
                  'City / Sub-City Area *',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: cities.contains(_selectedCity) ? _selectedCity : cities.first,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.location_city_outlined, color: AppColors.primary),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  items: cities.map((c) {
                    return DropdownMenuItem(value: c, child: Text(c));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedCity = val;
                        _isCustomCity = val.contains('Custom') || val.contains('Other');
                      });
                    }
                  },
                ),

                if (_isCustomCity) ...[
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: _customCityController,
                    decoration: InputDecoration(
                      labelText: 'Enter Specific City Name *',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      prefixIcon: const Icon(Icons.edit_location_outlined),
                    ),
                    validator: (val) {
                      if (_isCustomCity && (val == null || val.trim().isEmpty)) {
                        return 'Please enter your city name';
                      }
                      return null;
                    },
                  ),
                ],
                const SizedBox(height: 14),

                // 3. Zone / Woreda / Kebele
                const Text(
                  'Zone, Woreda & Kebele (Optional)',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _addressController,
                  decoration: InputDecoration(
                    hintText: 'e.g. Zone 1, Woreda 04, Kebele 03',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.home_outlined),
                  ),
                ),
                const SizedBox(height: 14),

                // 4. Phone Number (Optional)
                const Text(
                  'Phone Number (Optional)',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    hintText: 'e.g. +251 91 123 4567',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 24),

                CustomButton(
                  text: 'Complete Registration',
                  trailingIcon: Icons.arrow_forward_rounded,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
