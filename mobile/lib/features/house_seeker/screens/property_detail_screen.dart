import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/property_model.dart';
import '../../../shared/widgets/verification_badge.dart';
import '../../../shared/widgets/ethiopia_map_preview.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../core/services/user_behavior_tracker.dart';
import '../providers/ai_recommendations_provider.dart';
import '../providers/property_provider.dart';
import '../providers/favorites_provider.dart';
import '../providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../report/screens/report_property_modal.dart';
import '../../../core/services/currency_service.dart';
import '../../../shared/widgets/currency_selector_widget.dart';
import '../../../shared/widgets/neighborhood_radar_widget.dart';
import '../../rentals/screens/digital_lease_generator_screen.dart';
import '../../rentals/screens/schedule_tour_modal.dart';
import '../../rentals/screens/roommate_rent_splitter_screen.dart';


class PropertyDetailScreen extends StatefulWidget {
  final String propertyId;

  const PropertyDetailScreen({
    super.key,
    required this.propertyId,
  });

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  int _currentImageIndex = 0;

  Widget _buildSafeImage(String url, {double? width, double? height, BoxFit fit = BoxFit.cover, double iconSize = 60, String? title}) {
    final formatted = Formatters.formatImageUrl(url);
    return Container(
      width: width,
      height: height,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1B4D3E), Color(0xFF2C6B56)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          if (formatted.isNotEmpty)
            Positioned.fill(
              child: Image.network(
                formatted,
                width: width,
                height: height,
                fit: fit,
                errorBuilder: (context, error, stackTrace) => _buildPlaceholder(iconSize, title),
              ),
            )
          else
            _buildPlaceholder(iconSize, title),
        ],
      ),
    );
  }

  Widget _buildPlaceholder(double iconSize, String? title) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1B4D3E), Color(0xFF2C6B56)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_work_rounded, size: iconSize, color: Colors.white70),
            if (title != null) ...[
              const SizedBox(height: 6),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showInquiryModal(BuildContext context, PropertyModel property) {
    final auth = context.read<AuthProvider>();
    if (auth.currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to contact the provider.')),
      );
      return;
    }

    final messageController = TextEditingController(
      text: 'Selam ${property.providerName}! I am interested in renting this property. Is it available for a viewing?',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        bool isSubmitting = false;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Contact Provider',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),

                  // Property Summary snippet
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: SizedBox(
                          width: 50,
                          height: 50,
                          child: _buildSafeImage(
                            property.images.isNotEmpty ? property.images.first : '',
                            width: 50,
                            height: 50,
                            iconSize: 20,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              property.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            Text(
                              '${Formatters.formatCurrency(property.price)} / ${property.rentalPeriod}',
                              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  CustomTextField(
                    label: 'Your Inquiry Message',
                    controller: messageController,
                    maxLines: 4,
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Send Message to Provider',
                    isLoading: isSubmitting,
                    onPressed: () async {
                      setModalState(() {
                        isSubmitting = true;
                      });

                      final success = await context.read<InquiryProvider>().sendInquiry(
                            property: property,
                            seeker: auth.currentUser!,
                            message: messageController.text.trim(),
                          );

                      if (context.mounted) {
                        Navigator.of(context).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success ? 'Inquiry sent successfully to ${property.providerName}!' : 'Failed to send inquiry.'),
                            backgroundColor: success ? AppColors.success : AppColors.rejected,
                          ),
                        );
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showReportModal(BuildContext context, PropertyModel property) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ReportPropertyModal(
        propertyId: property.id,
        propertyTitle: property.title,
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final propProvider = context.read<PropertyProvider>();
      try {
        final prop = propProvider.properties.firstWhere((p) => p.id == widget.propertyId);
        UserBehaviorTracker.trackPropertyView(prop);
        context.read<AiRecommendationsProvider>().fetchRecommendations();
      } catch (_) {}
    });
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final favoritesProvider = context.watch<FavoritesProvider>();
    final user = context.watch<AuthProvider>().currentUser;

    PropertyModel? found;
    try {
      found = propertyProvider.properties.firstWhere((p) => p.id == widget.propertyId);
    } catch (_) {
      try {
        found = propertyProvider.providerProperties.firstWhere((p) => p.id == widget.propertyId);
      } catch (_) {
        found = null;
      }
    }

    if (found == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Property Details')),
        body: const Center(
          child: Text('Property not found or unavailable.'),
        ),
      );
    }

    final PropertyModel property = found;

    final isFav = favoritesProvider.isFavorite(property.id);
    final hasImages = property.images.isNotEmpty;
    final safeIndex = hasImages ? (_currentImageIndex % property.images.length) : 0;
    final currentImageUrl = hasImages ? property.images[safeIndex] : '';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          property.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: Icon(
              isFav ? Icons.favorite : Icons.favorite_border,
              color: isFav ? Colors.red : AppColors.textPrimary,
            ),
            onPressed: () {
              if (user != null) {
                favoritesProvider.toggleFavorite(user.id, property.id);
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.flag_outlined, color: AppColors.textPrimary),
            onPressed: () => _showReportModal(context, property),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image Gallery Banner
                  SizedBox(
                    height: 240,
                    width: double.infinity,
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: _buildSafeImage(
                            currentImageUrl,
                            fit: BoxFit.cover,
                            title: property.title,
                          ),
                        ),

                        // Left Carousel Arrow
                        if (property.images.length > 1)
                          Positioned(
                            left: 10,
                            top: 95,
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  _currentImageIndex = (_currentImageIndex - 1 + property.images.length) % property.images.length;
                                });
                              },
                              child: const CircleAvatar(
                                radius: 18,
                                backgroundColor: Colors.black45,
                                child: Icon(Icons.chevron_left_rounded, color: Colors.white, size: 22),
                              ),
                            ),
                          ),

                        // Right Carousel Arrow
                        if (property.images.length > 1)
                          Positioned(
                            right: 10,
                            top: 95,
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  _currentImageIndex = (_currentImageIndex + 1) % property.images.length;
                                });
                              },
                              child: const CircleAvatar(
                                radius: 18,
                                backgroundColor: Colors.black45,
                                child: Icon(Icons.chevron_right_rounded, color: Colors.white, size: 22),
                              ),
                            ),
                          ),

                        // Rented Banner Overlay
                        if (!property.availability || property.listingStatus == PropertyListingStatus.rented)
                          Positioned.fill(
                            child: Container(
                              color: Colors.black54,
                              child: Center(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: AppColors.rejected,
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: const Text(
                                    'THIS PROPERTY IS RENTED',
                                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                ),
                              ),
                            ),
                          ),

                        // Carousel Indicator Dots
                        if (property.images.length > 1)
                          Positioned(
                            bottom: 12,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                property.images.length,
                                (idx) => GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _currentImageIndex = idx;
                                    });
                                  },
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(horizontal: 3),
                                    width: safeIndex == idx ? 18 : 7,
                                    height: 7,
                                    decoration: BoxDecoration(
                                      color: safeIndex == idx ? AppColors.secondary : Colors.white70,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Main Details Content Body
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Price Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Expanded(
                              child: FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  context.watch<CurrencyProvider>().formatPrice(property.price),
                                  style: const TextStyle(
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const CurrencySelectorWidget(isCompact: true),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Title & Verification
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                property.title,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                            if (property.isVerified) const VerificationBadge(),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Location
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: AppColors.secondary, size: 20),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${property.neighborhood}, ${property.area}, ${property.city}',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        EthiopiaMapPreview(
                          city: property.city,
                          area: property.area,
                          neighborhood: property.neighborhood,
                          latitude: property.latitude,
                          longitude: property.longitude,
                        ),
                        const SizedBox(height: 16),
                        NeighborhoodRadarWidget(city: property.city, area: property.area),
                        const SizedBox(height: 20),

                        // Impressive Action Hub (Lease Contract, Schedule Visit, Rent Splitter)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.06),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Quick Rental Actions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary)),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 10),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      icon: const Icon(Icons.description_outlined, size: 16),
                                      label: const Text('Digital Contract', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => DigitalLeaseGeneratorScreen(property: property),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.secondary,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 10),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      icon: const Icon(Icons.calendar_month_outlined, size: 16),
                                      label: const Text('Schedule Tour', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      onPressed: () {
                                        showModalBottomSheet(
                                          context: context,
                                          isScrollControlled: true,
                                          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
                                          builder: (_) => ScheduleTourModal(property: property),
                                        );
                                      },
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.primary,
                                  minimumSize: const Size(double.infinity, 38),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.calculate_outlined, size: 16),
                                label: const Text('Roommate Rent & Utility Splitter', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => RoommateRentSplitterScreen(initialPrice: property.price),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Property Key Specs Card Bar
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _SpecItem(Icons.king_bed_outlined, '${property.rooms} Rooms'),
                              const _VerticalDivider(),
                              _SpecItem(Icons.bathtub_outlined, '${property.bathrooms} Baths'),
                              const _VerticalDivider(),
                              _SpecItem(Icons.apartment_outlined, property.propertyType),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Description
                        const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          property.description,
                          style: const TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.5),
                        ),
                        const SizedBox(height: 24),

                        // Amenities Grid
                        const Text('Amenities', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: property.amenities.map((amenity) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.primaryContainer,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.primary),
                                  const SizedBox(width: 6),
                                  Text(
                                    amenity,
                                    style: const TextStyle(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 28),

                        // Provider Info Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              const CircleAvatar(
                                radius: 26,
                                backgroundColor: AppColors.primaryContainer,
                                child: Icon(Icons.person, color: AppColors.primary),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      property.providerName,
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text('House Provider', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                    const SizedBox(height: 4),
                                    if (property.providerIsVerified) const VerificationBadge(label: 'Verified Provider', isSmall: true),
                                  ],
                                ),
                              ),
                              OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size(90, 38),
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                ),
                                onPressed: () => _showInquiryModal(context, property),
                                child: const Text('Contact'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Sticky Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, -2)),
              ],
            ),
            child: SafeArea(
              top: false,
              child: CustomButton(
                text: property.availability ? 'Contact Provider' : 'Property Rented',
                icon: Icons.chat_bubble_outline_rounded,
                onPressed: property.availability ? () => _showInquiryModal(context, property) : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpecItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _SpecItem(this.icon, this.label);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        ),
      ],
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();

  @override
  Widget build(BuildContext context) {
    return Container(height: 24, width: 1, color: AppColors.border);
  }
}
