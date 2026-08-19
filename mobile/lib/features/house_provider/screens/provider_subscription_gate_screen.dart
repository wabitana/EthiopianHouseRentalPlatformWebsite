import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/main_layout_wrapper.dart';

class ProviderSubscriptionGateScreen extends StatefulWidget {
  const ProviderSubscriptionGateScreen({super.key});

  @override
  State<ProviderSubscriptionGateScreen> createState() => _ProviderSubscriptionGateScreenState();
}

class _ProviderSubscriptionGateScreenState extends State<ProviderSubscriptionGateScreen> {
  bool _isLoadingPlans = true;
  bool _isProcessing = false;
  String? _errorMessage;
  List<Map<String, dynamic>> _plans = [];
  String? _selectedPlanId;

  @override
  void initState() {
    super.initState();
    _fetchPlans();
  }

  Future<void> _fetchPlans() async {
    setState(() {
      _isLoadingPlans = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiClient.get(ApiEndpoints.subscriptionPlans);
      if (res != null && res is List) {
        _plans = List<Map<String, dynamic>>.from(res);
        if (_plans.isNotEmpty) {
          // Default to Professional or first plan
          final prof = _plans.firstWhere(
            (p) => (p['name'] as String).toLowerCase() == 'professional',
            orElse: () => _plans.first,
          );
          _selectedPlanId = prof['id'] as String;
        }
      } else {
        _errorMessage = 'Failed to load subscription plans';
      }
    } catch (e) {
      _errorMessage = 'Network error fetching subscription plans: $e';
    }

    if (mounted) {
      setState(() => _isLoadingPlans = false);
    }
  }

  void _onSubscribeWithChapa() async {
    if (_selectedPlanId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subscription plan')),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiClient.post(
        ApiEndpoints.subscribe,
        body: {'planId': _selectedPlanId},
      );

      if (mounted) {
        setState(() => _isProcessing = false);

        if (res != null && (res['subscription'] != null || res['payment'] != null)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Chapa Payment Successful! Subscription Plan Activated.'),
              backgroundColor: AppColors.primary,
            ),
          );
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainLayoutWrapper()),
            (route) => false,
          );
        } else {
          final err = res?['error'] ?? 'Subscription transaction failed';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err), backgroundColor: Colors.redAccent),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Subscription failed: $e'), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  void _onSkipNotNow() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const MainLayoutWrapper()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                    SizedBox(width: 6),
                    Text(
                      'Landlord & Provider Portal',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Activate Owner Subscription',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Choose a plan to list properties, receive inquiry calls, and access tenant management tools across Ethiopia.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 28),

              if (_isLoadingPlans)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(color: Colors.amber),
                )
              else if (_errorMessage != null)
                Column(
                  children: [
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: _fetchPlans,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Retry Loading Plans'),
                    ),
                  ],
                )
              else ...[
                // Dynamic Plans Selection from Backend API
                ..._plans.map((plan) {
                  final id = plan['id'] as String;
                  final name = plan['name'] as String? ?? 'Plan';
                  final price = plan['priceETB'] ?? 0;
                  final isSelected = _selectedPlanId == id;
                  final isPopular = name.toLowerCase() == 'professional';
                  final maxListings = plan['maxListings'] ?? 5;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _PlanCard(
                      title: '$name Plan',
                      price: '$price ETB / mo',
                      listings: 'Up to $maxListings Active Property Listings',
                      isSelected: isSelected,
                      isPopular: isPopular,
                      onTap: () => setState(() => _selectedPlanId = id),
                    ),
                  );
                }),

                const SizedBox(height: 28),
                CustomButton(
                  text: _isProcessing ? 'Connecting Chapa Gateway...' : 'Subscribe & Continue with Chapa',
                  isLoading: _isProcessing,
                  onPressed: _onSubscribeWithChapa,
                ),
              ],

              const SizedBox(height: 16),
              TextButton(
                onPressed: _onSkipNotNow,
                child: const Text(
                  'Not Now (Skip & Subscribe Later)',
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String title;
  final String price;
  final String listings;
  final bool isSelected;
  final bool isPopular;
  final VoidCallback onTap;

  const _PlanCard({
    required this.title,
    required this.price,
    required this.listings,
    required this.isSelected,
    this.isPopular = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFF334155),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppColors.primary : const Color(0xFF64748B),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      if (isPopular) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text(
                            'POPULAR',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    price,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.secondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    listings,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
