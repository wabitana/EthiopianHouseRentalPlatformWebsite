import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class ProviderAnalyticsScreen extends StatelessWidget {
  const ProviderAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Provider Listing Analytics'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overview Metric Header Cards
            Row(
              children: [
                Expanded(child: _buildMetricCard('Total Listing Views', '1,420', Icons.remove_red_eye_outlined, AppColors.primary)),
                const SizedBox(width: 12),
                Expanded(child: _buildMetricCard('Total Inquiries', '38', Icons.chat_bubble_outline_rounded, AppColors.secondary)),
              ],
            ),
            const SizedBox(width: 12),
            Row(
              children: [
                Expanded(child: _buildMetricCard('Phone Call Clicks', '24', Icons.phone_outlined, AppColors.success)),
                const SizedBox(width: 12),
                Expanded(child: _buildMetricCard('Map Directions Clicks', '89', Icons.directions_outlined, Colors.purple)),
              ],
            ),
            const SizedBox(height: 20),

            // Performance Chart Card
            Container(
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
                  const Text(
                    'Monthly Seeker Interest Trend',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 140,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildBar('Jan', 0.4),
                        _buildBar('Feb', 0.6),
                        _buildBar('Mar', 0.8),
                        _buildBar('Apr', 0.5),
                        _buildBar('May', 0.95),
                        _buildBar('Jun', 0.7),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Top Performing Properties List
            const Text('Top Performing Property Listings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            _buildPropertyPerformanceTile('Modern 2-Bedroom Condo in Bole Bulbula', '840 Views', '18 Inquiries', '18,500 ETB'),
            _buildPropertyPerformanceTile('Luxury 3-Bedroom Villa in Kazanchis', '580 Views', '20 Inquiries', '45,000 ETB'),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 10),
          Text(count, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildBar(String label, double heightFactor) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          width: 24,
          height: 110 * heightFactor,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  Widget _buildPropertyPerformanceTile(String title, String views, String inquiries, String price) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(views, style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 10),
                    Text(inquiries, style: const TextStyle(fontSize: 11, color: AppColors.secondary, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          Text(price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary)),
        ],
      ),
    );
  }
}
