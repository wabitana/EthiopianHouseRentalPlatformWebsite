import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/services/currency_service.dart';
import '../models/property_model.dart';
import 'currency_selector_widget.dart';

class PropertyComparisonSheet extends StatelessWidget {
  final List<PropertyModel> properties;

  const PropertyComparisonSheet({
    super.key,
    required this.properties,
  });

  @override
  Widget build(BuildContext context) {
    context.watch<CurrencyProvider>();

    if (properties.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('No properties selected for comparison.')),
      );
    }

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle indicator
          Center(
            child: Container(
              width: 38,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.compare_arrows_rounded, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Comparing ${properties.length} Properties',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ],
              ),
              Row(
                children: [
                  const CurrencySelectorWidget(isCompact: true),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 22),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Horizontal scroll of comparison cards
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: properties.map((property) {
                  return Container(
                    width: 250,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Property Image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                Formatters.formatImageUrl(property.images.isNotEmpty ? property.images.first : ''),
                                height: 115,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Container(
                                  height: 115,
                                  color: Colors.grey.shade200,
                                  child: const Icon(Icons.home, size: 40, color: AppColors.primary),
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),

                            // Property Title
                            Text(
                              property.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                                height: 1.25,
                              ),
                            ),
                            const SizedBox(height: 4),

                            // Price
                            Text(
                              Formatters.formatCurrency(property.price),
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary),
                            ),
                            const SizedBox(height: 6),

                            const Divider(height: 16),

                            // Comparison Details
                            _buildComparisonRow('Location', '${property.neighborhood}, ${property.area}'),
                            _buildComparisonRow('City', property.city),
                            _buildComparisonRow('Property Type', property.propertyType),
                            _buildComparisonRow('Rooms', '${property.rooms} Bed / ${property.bathrooms} Bath'),
                            _buildComparisonRow('Verified', property.isVerified ? 'Yes ✅' : 'Pending'),
                            _buildComparisonRow('Amenities', '${property.amenities.length} Included'),
                            _buildComparisonRow('Provider', property.providerName),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 1),
          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }
}
