import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../house_seeker/screens/property_detail_screen.dart';

class ProviderAnalyticsScreen extends StatefulWidget {
  const ProviderAnalyticsScreen({super.key});

  @override
  State<ProviderAnalyticsScreen> createState() => _ProviderAnalyticsScreenState();
}

class _ProviderAnalyticsScreenState extends State<ProviderAnalyticsScreen> {
  bool _isLoading = true;
  int _totalViews = 0;
  int _totalInquiries = 0;
  int _phoneClicks = 0;
  int _mapClicks = 0;
  List<Map<String, dynamic>> _monthlyTrend = [];
  List<Map<String, dynamic>> _topProperties = [];

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.get(ApiEndpoints.providerAnalytics);
      if (res != null && res is Map<String, dynamic>) {
        setState(() {
          _totalViews = (res['totalViews'] as num?)?.toInt() ?? 0;
          _totalInquiries = (res['totalInquiries'] as num?)?.toInt() ?? 0;
          _phoneClicks = (res['phoneClicks'] as num?)?.toInt() ?? 0;
          _mapClicks = (res['mapClicks'] as num?)?.toInt() ?? 0;

          if (res['monthlyTrend'] is List) {
            _monthlyTrend = List<Map<String, dynamic>>.from(res['monthlyTrend']);
          }

          if (res['topProperties'] is List) {
            _topProperties = List<Map<String, dynamic>>.from(res['topProperties']);
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching provider analytics: $e');
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Provider Listing Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Analytics',
            onPressed: _fetchAnalytics,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchAnalytics,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Overview Metric Header Cards
                    Row(
                      children: [
                        Expanded(child: _buildMetricCard('Total Listing Views', '$_totalViews', Icons.remove_red_eye_outlined, AppColors.primary)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildMetricCard('Total Inquiries', '$_totalInquiries', Icons.chat_bubble_outline_rounded, AppColors.secondary)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _buildMetricCard('Phone Call Clicks', '$_phoneClicks', Icons.phone_outlined, AppColors.success)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildMetricCard('Map Directions Clicks', '$_mapClicks', Icons.directions_outlined, Colors.purple)),
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
                            child: _monthlyTrend.isEmpty
                                ? const Center(child: Text('No trend data yet'))
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: _monthlyTrend.map((m) {
                                      final month = m['month'] as String? ?? '';
                                      final factor = (m['factor'] as num?)?.toDouble() ?? 0.2;
                                      return _buildBar(month, factor);
                                    }).toList(),
                                  ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Top Performing Properties List
                    const Text('Top Performing Property Listings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_topProperties.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Center(
                          child: Text(
                            'No property listings found yet. Post your first house to view real analytics!',
                            style: TextStyle(color: AppColors.textSecondary),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    else
                      ..._topProperties.map((p) {
                        final id = p['id'] as String? ?? '';
                        final title = p['title'] as String? ?? 'Listing';
                        final views = '${p['viewsCount'] ?? 0} Views';
                        final inquiries = '${p['inquiriesCount'] ?? 0} Inquiries';
                        final price = p['price'] as String? ?? '';
                        final phoneClicks = (p['phoneClicks'] as num?)?.toInt();
                        final mapClicks = (p['mapClicks'] as num?)?.toInt();
                        return _buildPropertyPerformanceTile(
                          id: id,
                          title: title,
                          views: views,
                          inquiries: inquiries,
                          price: price,
                          phoneClicks: phoneClicks,
                          mapClicks: mapClicks,
                        );
                      }),
                  ],
                ),
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
          duration: const Duration(milliseconds: 500),
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

  Widget _buildPropertyPerformanceTile({
    required String id,
    required String title,
    required String views,
    required String inquiries,
    required String price,
    int? phoneClicks,
    int? mapClicks,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: id.isNotEmpty
              ? () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PropertyDetailScreen(propertyId: id),
                    ),
                  );
                }
              : null,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(views, style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 10),
                          Text(inquiries, style: const TextStyle(fontSize: 11, color: AppColors.secondary, fontWeight: FontWeight.w600)),
                          if (phoneClicks != null && phoneClicks > 0) ...[
                            const SizedBox(width: 8),
                            Icon(Icons.phone, size: 10, color: Colors.grey.shade600),
                            const SizedBox(width: 2),
                            Text('$phoneClicks', style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                          ],
                          if (mapClicks != null && mapClicks > 0) ...[
                            const SizedBox(width: 6),
                            Icon(Icons.directions, size: 10, color: Colors.grey.shade600),
                            const SizedBox(width: 2),
                            Text('$mapClicks', style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
