import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../models/property_model.dart';

class PropertyComparisonSheet extends StatelessWidget {
  final List<PropertyModel> properties;

  const PropertyComparisonSheet({
    super.key,
    required this.properties,
  });

  @override
  Widget build(BuildContext context) {
    if (properties.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('No properties selected for comparison.')),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.compare_arrows_rounded, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Comparing ${properties.length} Properties',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ],
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),

          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: properties.map((property) {
                  return Container(
                    width: 240,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            Formatters.formatImageUrl(property.images.isNotEmpty ? property.images.first : ''),
                            height: 120,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => Container(
                              height: 120,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.home, size: 40, color: AppColors.primary),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),

                        Text(
                          property.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 4),

                        Text(
                          Formatters.formatCurrency(property.price),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary),
                        ),
                        const SizedBox(height: 10),

                        const Divider(),
                        _buildComparisonRow('Location', '${property.neighborhood}, ${property.area}'),
                        _buildComparisonRow('City', property.city),
                        _buildComparisonRow('Property Type', property.propertyType),
                        _buildComparisonRow('Rooms', '${property.rooms} Bed / ${property.bathrooms} Bath'),
                        _buildComparisonRow('Verified', property.isVerified ? 'Yes ✅' : 'Pending'),
                        _buildComparisonRow('Amenities', '${property.amenities.length} Included'),
                        _buildComparisonRow('Provider', property.providerName),
                      ],
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
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
