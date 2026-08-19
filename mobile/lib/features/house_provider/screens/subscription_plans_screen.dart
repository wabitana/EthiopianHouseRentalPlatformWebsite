import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';

class SubscriptionPlansScreen extends StatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  State<SubscriptionPlansScreen> createState() => _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends State<SubscriptionPlansScreen> {
  bool _isLoading = true;
  bool _isSubscribing = false;
  List<Map<String, dynamic>> _plans = [];
  Map<String, dynamic>? _activeSubscription;

  @override
  void initState() {
    super.initState();
    _loadSubscriptionData();
  }

  Future<void> _loadSubscriptionData() async {
    setState(() => _isLoading = true);
    try {
      final plansRes = await ApiClient.get(ApiEndpoints.subscriptionPlans);
      if (plansRes != null && plansRes is List && plansRes.isNotEmpty) {
        _plans = List<Map<String, dynamic>>.from(plansRes);
      } else {
        _plans = _defaultPlans;
      }

      final subRes = await ApiClient.get(ApiEndpoints.mySubscription);
      if (subRes != null && subRes is Map<String, dynamic>) {
        _activeSubscription = subRes['subscription'] as Map<String, dynamic>?;
      }
    } catch (e) {
      debugPrint('Error loading subscription plans from backend: $e');
      _plans = _defaultPlans;
    }
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  static final List<Map<String, dynamic>> _defaultPlans = [
    {
      'id': 'plan_basic',
      'name': 'Basic',
      'priceETB': 500,
      'durationDays': 30,
      'maxListings': 3,
      'features': ['Up to 3 Active Property Listings', 'Basic Analytics', 'Standard Support'],
    },
    {
      'id': 'plan_professional',
      'name': 'Professional',
      'priceETB': 1200,
      'durationDays': 30,
      'maxListings': 10,
      'features': ['Up to 10 Listings + 360° Panorama Tours', 'Advanced Analytics', 'Priority Support'],
    },
    {
      'id': 'plan_business',
      'name': 'Business',
      'priceETB': 2500,
      'durationDays': 30,
      'maxListings': 100,
      'features': ['Unlimited Listings', 'Top Sponsor Placement', 'Dedicated Account Manager'],
    },
  ];

  Future<void> _subscribeToPlan(String planId, String planName, double price) async {
    setState(() => _isSubscribing = true);
    try {
      final res = await ApiClient.post(
        '${ApiEndpoints.baseUrl}/subscriptions/subscribe',
        body: {'planId': planId},
      );

      if (res != null && res['subscription'] != null) {
        if (!mounted) return;
        await context.read<AuthProvider>().refreshCurrentUser();
        if (!mounted) return;
        context.read<AuthProvider>().switchRole(UserRole.provider);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🎉 $planName Subscription Activated via Chapa Payment Engine! You can now post properties.'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _loadSubscriptionData();
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res?['error'] ?? 'Subscription checkout failed'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error activating subscription: $e'), backgroundColor: Colors.redAccent),
      );
    }
    setState(() => _isSubscribing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Landlord Subscription Plans'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Active Subscription Banner (if any)
                  if (_activeSubscription != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, Color(0xFF047857)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: AppColors.cardShadow,
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.verified_rounded, color: Colors.amberAccent, size: 36),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Active Plan: ${_activeSubscription!['plan']?['name'] ?? 'Landlord Membership'}',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Status: ${_activeSubscription!['status']} • Unlimited Postings',
                                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline_rounded, color: Colors.amber, size: 28),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'An active subscription plan is required before posting property listings for Rent or Sale on Ethiopian Property Platform.',
                              style: TextStyle(fontSize: 12, color: Colors.black87, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  const Text(
                    'Select Your Subscription Plan',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Choose a plan powered by Chapa Payment Engine to start listing properties.',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),

                  // Plans List
                  ..._plans.map((plan) {
                    final id = plan['id'] as String;
                    final name = plan['name'] as String? ?? 'Plan';
                    final price = (plan['priceETB'] as num?)?.toDouble() ?? 0.0;
                    final days = plan['durationDays'] ?? 30;
                    final maxListings = plan['maxListings'] ?? 5;
                    final isCurrentActive = _activeSubscription?['planId'] == id;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: isCurrentActive ? AppColors.primaryContainer.withValues(alpha: 0.2) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isCurrentActive ? AppColors.primary : AppColors.border,
                          width: isCurrentActive ? 2 : 1,
                        ),
                        boxShadow: AppColors.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                name,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isCurrentActive ? AppColors.primary : AppColors.textPrimary,
                                ),
                              ),
                              if (isCurrentActive)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text('CURRENT PLAN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '${price.toStringAsFixed(0)} ETB',
                                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.primary),
                              ),
                              Text(' / $days Days', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(height: 1),
                          const SizedBox(height: 12),
                          _buildPlanFeature('Up to $maxListings Active Listings'),
                          _buildPlanFeature('Chapa Payment Simulation Engine'),
                          _buildPlanFeature('Subcity Map Search Placement'),
                          _buildPlanFeature('2-Way Chatting & Analytics'),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: isCurrentActive || _isSubscribing
                                  ? null
                                  : () => _subscribeToPlan(id, name, price),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: _isSubscribing
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : Text(
                                      isCurrentActive ? 'Active Plan' : 'Subscribe via Chapa Engine',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }

  Widget _buildPlanFeature(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
        ],
      ),
    );
  }
}
