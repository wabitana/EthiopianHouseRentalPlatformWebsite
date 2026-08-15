import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class NeighborhoodRadarWidget extends StatelessWidget {
  final String city;
  final String area;

  const NeighborhoodRadarWidget({
    super.key,
    required this.city,
    required this.area,
  });

  @override
  Widget build(BuildContext context) {
    // Generate area-specific neighborhood radar metrics
    final isBole = area.toLowerCase().contains('bole');
    final isKazanchis = area.toLowerCase().contains('kazanchis');

    final walkability = isKazanchis ? 4.8 : (isBole ? 4.5 : 4.0);
    final security = isBole ? 4.9 : 4.6;
    final waterSupply = isBole ? 4.7 : 4.2;
    final transport = isKazanchis ? 4.9 : 4.7;
    final marketProximity = 4.6;

    final overallRating = ((walkability + security + waterSupply + transport + marketProximity) / 5).toStringAsFixed(1);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shield_outlined, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Neighborhood Safety & Amenity Score',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Text(
                        '$area, $city Insights',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '$overallRating/5',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildRadarMetricBar('Security & Safety', security, Icons.security_rounded, Colors.green),
          _buildRadarMetricBar('Water Supply Reliability', waterSupply, Icons.water_drop_rounded, Colors.blue),
          _buildRadarMetricBar('Transport & Taxi Access', transport, Icons.directions_bus_rounded, Colors.orange),
          _buildRadarMetricBar('Walkability & Roads', walkability, Icons.directions_walk_rounded, Colors.purple),
          _buildRadarMetricBar('Schools & Supermarkets', marketProximity, Icons.storefront_rounded, Colors.teal),
        ],
      ),
    );
  }

  Widget _buildRadarMetricBar(String label, double rating, IconData icon, Color color) {
    final percentage = (rating / 5.0).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 15, color: color),
                  const SizedBox(width: 6),
                  Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                ],
              ),
              Text('${rating.toStringAsFixed(1)} / 5.0', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: percentage,
              minHeight: 6,
              backgroundColor: color.withValues(alpha: 0.12),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}
