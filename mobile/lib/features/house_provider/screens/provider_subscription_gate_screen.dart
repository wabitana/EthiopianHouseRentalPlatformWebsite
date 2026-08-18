import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/main_layout_wrapper.dart';

class ProviderSubscriptionGateScreen extends StatefulWidget {
  const ProviderSubscriptionGateScreen({super.key});

  @override
  State<ProviderSubscriptionGateScreen> createState() => _ProviderSubscriptionGateScreenState();
}

class _ProviderSubscriptionGateScreenState extends State<ProviderSubscriptionGateScreen> {
  String _selectedPlan = 'Professional';
  bool _isProcessing = false;

  void _onSubscribeWithChapa() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Chapa Payment Successful! $_selectedPlan Plan Activated.'),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainLayoutWrapper()),
        (route) => false,
      );
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

              // Plans Selection
              _PlanCard(
                title: 'Basic Plan',
                price: '500 ETB / mo',
                listings: 'Up to 3 Active Property Listings',
                isSelected: _selectedPlan == 'Basic',
                onTap: () => setState(() => _selectedPlan = 'Basic'),
              ),
              const SizedBox(height: 12),
              _PlanCard(
                title: 'Professional Plan',
                price: '1,200 ETB / mo',
                listings: 'Up to 10 Listings + 360° Panorama Tours',
                isSelected: _selectedPlan == 'Professional',
                isPopular: true,
                onTap: () => setState(() => _selectedPlan = 'Professional'),
              ),
              const SizedBox(height: 12),
              _PlanCard(
                title: 'Business Plan',
                price: '2,500 ETB / mo',
                listings: 'Unlimited Listings + Top Sponsor Placement',
                isSelected: _selectedPlan == 'Business',
                onTap: () => setState(() => _selectedPlan = 'Business'),
              ),

              const SizedBox(height: 28),
              CustomButton(
                text: _isProcessing ? 'Connecting Chapa Gateway...' : 'Subscribe & Continue with Chapa',
                isLoading: _isProcessing,
                onPressed: _onSubscribeWithChapa,
              ),

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
