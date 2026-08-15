import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/property_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/ethiopia_map_preview.dart';
import '../../house_seeker/providers/property_provider.dart';
import '../../auth/providers/auth_provider.dart';

class PostHouseWizardScreen extends StatefulWidget {
  const PostHouseWizardScreen({super.key});

  @override
  State<PostHouseWizardScreen> createState() => _PostHouseWizardScreenState();
}

class _PostHouseWizardScreenState extends State<PostHouseWizardScreen> {
  int _currentStep = 0;

  // Form Fields State
  final List<String> _selectedImages = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  ];

  final _titleController = TextEditingController(text: 'Modern 2-Bedroom Condo in Bole Bulbula');
  final _descriptionController = TextEditingController(
    text: 'Clean 2-bedroom condominium with high quality finishes, reserve water tank, continuous electricity, and security entrance.',
  );
  String _propertyType = 'Condominium';
  int _rooms = 2;
  int _bathrooms = 1;

  final _priceController = TextEditingController(text: '18500');
  String _rentalPeriod = 'Monthly';

  String _city = 'Addis Ababa';
  String _area = 'Bole';
  final _neighborhoodController = TextEditingController(text: 'Bulbula Site 3');
  final _addressController = TextEditingController(text: 'Near Mariam Church, Block 14');
  double? _latitude;
  double? _longitude;

  final List<String> _selectedAmenities = ['Water', 'Electricity', 'Parking', 'Kitchen', 'Security', 'Water Tank'];

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _neighborhoodController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 5) {
      setState(() {
        _currentStep++;
      });
    } else if (_currentStep == 5) {
      _submitListing();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  void _submitListing() async {
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;

    setState(() {
      _isSubmitting = true;
    });

    final newProperty = PropertyModel(
      id: 'prop_${DateTime.now().millisecondsSinceEpoch}',
      providerId: user.id,
      providerName: user.name,
      providerPhone: user.phone,
      providerAvatar: user.avatarUrl,
      providerIsVerified: user.isVerified,
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      propertyType: _propertyType,
      price: double.tryParse(_priceController.text) ?? 15000,
      rentalPeriod: _rentalPeriod,
      rooms: _rooms,
      bathrooms: _bathrooms,
      city: _city,
      area: _area,
      neighborhood: _neighborhoodController.text.trim(),
      addressDetails: _addressController.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      images: _selectedImages,
      amenities: _selectedAmenities,
      availability: true,
      isVerified: true,
      listingStatus: PropertyListingStatus.active,
    );

    await context.read<PropertyProvider>().createProperty(newProperty);

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });
      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Column(
          children: [
            Icon(Icons.check_circle_rounded, color: AppColors.success, size: 60),
            SizedBox(height: 12),
            Text(
              'Listing Published!',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
          ],
        ),
        content: const Text(
          'Your property has been submitted and verified. It is now live for house seekers across Ethiopia!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          CustomButton(
            text: 'View Dashboard',
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final stepTitles = ['Photos', 'Basic Info', 'Pricing', 'Location', 'Amenities', 'Review'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Post New House'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Bar Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.surface,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Step ${_currentStep + 1} of 6: ${stepTitles[_currentStep]}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary),
                      ),
                      Text(
                        '${((_currentStep + 1) / 6 * 100).toInt()}%',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: (_currentStep + 1) / 6,
                    backgroundColor: AppColors.border,
                    color: AppColors.primary,
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ],
              ),
            ),

            // Step Content Pages
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildStepContent(),
              ),
            ),

            // Navigation Buttons Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))],
              ),
              child: Row(
                children: [
                  if (_currentStep > 0)
                    Expanded(
                      child: CustomButton(
                        text: 'Back',
                        variant: CustomButtonVariant.outline,
                        onPressed: _previousStep,
                      ),
                    ),
                  if (_currentStep > 0) const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      text: _currentStep == 5 ? 'Publish Listing' : 'Next Step',
                      isLoading: _isSubmitting,
                      onPressed: _nextStep,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1Photos();
      case 1:
        return _buildStep2BasicInfo();
      case 2:
        return _buildStep3Price();
      case 3:
        return _buildStep4Location();
      case 4:
        return _buildStep5Amenities();
      case 5:
        return _buildStep6Review();
      default:
        return Container();
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final XFile? file = await picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 80,
      );

      if (file == null) return;

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Processing photo...'), duration: Duration(seconds: 2)),
        );
      }

      try {
        final bytes = await file.readAsBytes();
        final res = await ApiClient.uploadImageBytes(
          ApiEndpoints.upload,
          bytes,
          file.name.isNotEmpty ? file.name : 'house_photo.jpg',
        );
        if (res is Map<String, dynamic> && res['url'] != null) {
          final rawUrl = res['url'].toString();
          final uploadedUrl = rawUrl.startsWith('http')
              ? rawUrl
              : '${ApiEndpoints.mediaBaseUrl}$rawUrl';
          setState(() {
            _selectedImages.add(uploadedUrl);
          });
        } else {
          setState(() {
            _selectedImages.add(file.path);
          });
        }
      } catch (err) {
        setState(() {
          _selectedImages.add(file.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting image: ${e.toString()}')),
        );
      }
    }
  }

  void _showUrlInputDialog() {
    final urlController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Image URL'),
        content: TextField(
          controller: urlController,
          decoration: const InputDecoration(
            hintText: 'https://images.unsplash.com/...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (urlController.text.trim().isNotEmpty) {
                setState(() {
                  _selectedImages.add(urlController.text.trim());
                });
              }
              Navigator.pop(ctx);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showImageSourceModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Photo Source',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.primaryContainer,
                child: Icon(Icons.camera_alt_rounded, color: AppColors.primary),
              ),
              title: const Text('Take Photo with Camera', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Capture house photo directly using device camera'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            const Divider(),
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.primaryContainer,
                child: Icon(Icons.photo_library_rounded, color: AppColors.primary),
              ),
              title: const Text('Choose from Gallery / Files', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Pick photos saved on your device'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
            const Divider(),
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.surfaceVariant,
                child: Icon(Icons.link_rounded, color: AppColors.textSecondary),
              ),
              title: const Text('Enter Image URL', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Paste a web image link directly'),
              onTap: () {
                Navigator.pop(ctx);
                _showUrlInputDialog();
              },
            ),
          ],
        ),
      ),
    );
  }

  // Step 1 — Photos
  Widget _buildStep1Photos() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Upload Property Photos', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Add clear photos of the rooms, kitchen, bathroom, and exterior.', style: TextStyle(color: AppColors.textSecondary)),
        const SizedBox(height: 20),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.2,
          ),
          itemCount: _selectedImages.length + 1,
          itemBuilder: (context, index) {
            if (index == _selectedImages.length) {
              return InkWell(
                onTap: _showImageSourceModal,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary, style: BorderStyle.solid),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_a_photo_rounded, size: 32, color: AppColors.primary),
                      SizedBox(height: 6),
                      Text('Add Photo', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                ),
              );
            }
            return Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    Formatters.formatImageUrl(_selectedImages[index]),
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: AppColors.surfaceVariant,
                      child: const Icon(Icons.home_work_outlined, color: AppColors.textMuted),
                    ),
                  ),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedImages.removeAt(index);
                      });
                    },
                    child: CircleAvatar(radius: 12, backgroundColor: Colors.black.withValues(alpha: 0.6), child: const Icon(Icons.close, size: 14, color: Colors.white)),
                  ),
                ),
                if (index == 0)
                  Positioned(
                    bottom: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                      child: const Text('Main Cover', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }

  // Step 2 — Basic Information
  Widget _buildStep2BasicInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Basic Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        CustomTextField(label: 'Property Title', controller: _titleController, hint: 'e.g. Modern 2-Bedroom Apartment in Bole'),
        const SizedBox(height: 16),

        const Text('Property Type', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _propertyType,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          items: AppConstants.propertyTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
          onChanged: (val) => setState(() => _propertyType = val!),
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bedrooms', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(icon: const Icon(Icons.remove_circle_outline), onPressed: () => setState(() => _rooms = _rooms > 1 ? _rooms - 1 : 1)),
                      Text('$_rooms', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.add_circle_outline), onPressed: () => setState(() => _rooms++)),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bathrooms', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(icon: const Icon(Icons.remove_circle_outline), onPressed: () => setState(() => _bathrooms = _bathrooms > 1 ? _bathrooms - 1 : 1)),
                      Text('$_bathrooms', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.add_circle_outline), onPressed: () => setState(() => _bathrooms++)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        CustomTextField(label: 'Property Description', controller: _descriptionController, maxLines: 4, hint: 'Describe the property features, proximity, water supply, security...'),
      ],
    );
  }

  // Step 3 — Price in ETB
  Widget _buildStep3Price() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Set Rent Price', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        CustomTextField(
          label: 'Monthly Price in ETB (Ethiopian Birr)',
          hint: 'e.g. 18500',
          controller: _priceController,
          keyboardType: TextInputType.number,
          prefixIcon: Icons.payments_outlined,
        ),
        const SizedBox(height: 16),

        const Text('Rental Period', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: AppConstants.rentalPeriods.map((period) {
            final isSelected = _rentalPeriod == period;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Center(child: Text(period)),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) setState(() => _rentalPeriod = period);
                  },
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // Step 4 — Location
  Widget _buildStep4Location() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Property Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        const Text('City', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: AppConstants.ethiopianCities.where((c) => c != 'All').contains(_city)
              ? _city
              : AppConstants.ethiopianCities.where((c) => c != 'All').first,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          items: AppConstants.ethiopianCities
              .where((c) => c != 'All')
              .toSet()
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (val) => setState(() => _city = val!),
        ),
        const SizedBox(height: 16),

        if (_city == 'Addis Ababa') ...[
          const Text('Area / Subcity', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: AppConstants.addisSubcities.contains(_area)
                ? _area
                : AppConstants.addisSubcities.first,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            items: AppConstants.addisSubcities.toSet().map((a) => DropdownMenuItem(value: a, child: Text(a))).toList(),
            onChanged: (val) => setState(() => _area = val!),
          ),
          const SizedBox(height: 16),
        ],

        CustomTextField(label: 'Neighborhood / Specific Area', controller: _neighborhoodController, hint: 'e.g. Atlas, Bulbula, Zefmesh Area'),
        const SizedBox(height: 16),

        CustomTextField(label: 'Address Details / Directions', controller: _addressController, maxLines: 2, hint: 'Landmarks, street name, building number...'),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Pin Location on Map', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            if (_latitude != null && _longitude != null)
              Text(
                '${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}',
                style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        const SizedBox(height: 8),
        EthiopiaMapPreview(
          city: _city,
          area: _area,
          neighborhood: _neighborhoodController.text.isNotEmpty ? _neighborhoodController.text : _area,
          latitude: _latitude,
          longitude: _longitude,
          isInteractive: true,
          onLocationSelected: (latLng) {
            setState(() {
              _latitude = latLng.latitude;
              _longitude = latLng.longitude;
            });
          },
        ),
      ],
    );
  }

  // Step 5 — Amenities
  Widget _buildStep5Amenities() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Amenities Included', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        Wrap(
          spacing: 10,
          children: AppConstants.amenities.map((amenity) {
            final isSelected = _selectedAmenities.contains(amenity);
            return FilterChip(
              label: Text(amenity),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedAmenities.add(amenity);
                  } else {
                    _selectedAmenities.remove(amenity);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  // Step 6 — Review
  Widget _buildStep6Review() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Review Listing Before Submitting', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_selectedImages.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    Formatters.formatImageUrl(_selectedImages.first),
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 160,
                      color: AppColors.surfaceVariant,
                      child: const Icon(Icons.home_work_outlined, size: 50, color: AppColors.textMuted),
                    ),
                  ),
                ),
              const SizedBox(height: 14),
              Text(
                Formatters.formatCurrency(double.tryParse(_priceController.text) ?? 0),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              const SizedBox(height: 4),
              Text(_titleController.text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('📍 ${_neighborhoodController.text}, $_area, $_city', style: const TextStyle(color: AppColors.textSecondary)),
              const Divider(height: 24),
              Text('$_rooms Bedrooms • $_bathrooms Bathrooms • $_propertyType'),
            ],
          ),
        ),
      ],
    );
  }
}
