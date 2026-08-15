import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';

class RoommateRentSplitterScreen extends StatefulWidget {
  final double? initialPrice;

  const RoommateRentSplitterScreen({
    super.key,
    this.initialPrice,
  });

  @override
  State<RoommateRentSplitterScreen> createState() => _RoommateRentSplitterScreenState();
}

class _RoommateRentSplitterScreenState extends State<RoommateRentSplitterScreen> {
  int _roommateCount = 2;
  late final TextEditingController _totalRentController;
  final _waterCostController = TextEditingController(text: '1200');
  final _electricityCostController = TextEditingController(text: '800');
  final _securityFeeController = TextEditingController(text: '500');

  @override
  void initState() {
    super.initState();
    _totalRentController = TextEditingController(text: (widget.initialPrice ?? 18000).round().toString());
  }

  @override
  Widget build(BuildContext context) {
    final rent = double.tryParse(_totalRentController.text) ?? 0.0;
    final water = double.tryParse(_waterCostController.text) ?? 0.0;
    final electric = double.tryParse(_electricityCostController.text) ?? 0.0;
    final security = double.tryParse(_securityFeeController.text) ?? 0.0;

    final totalMonthlyExpenses = rent + water + electric + security;
    final sharePerPerson = _roommateCount > 0 ? (totalMonthlyExpenses / _roommateCount) : 0.0;
    final rentOnlyShare = _roommateCount > 0 ? (rent / _roommateCount) : 0.0;
    final utilitiesShare = _roommateCount > 0 ? ((water + electric + security) / _roommateCount) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Roommate Rent & Utility Splitter'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Per Person Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                children: [
                  const Text(
                    'Per Person Total Monthly Share',
                    style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${Formatters.formatCurrency(sharePerPerson)} ETB',
                    style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  Container(height: 1, color: Colors.white24),
                  const SizedBox(height: 12),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Rent Share', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text('${Formatters.formatCurrency(rentOnlyShare)} ETB', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      Container(width: 1, height: 26, color: Colors.white24),
                      Column(
                        children: [
                          const Text('Utilities Share', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text('${Formatters.formatCurrency(utilitiesShare)} ETB', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Calculator Parameters Card
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
                  const Text('Roommate Count', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: AppColors.primary),
                        onPressed: () {
                          if (_roommateCount > 1) setState(() => _roommateCount--);
                        },
                      ),
                      Text('$_roommateCount Roommates', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                        onPressed: () => setState(() => _roommateCount++),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  TextField(
                    controller: _totalRentController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Total Monthly Rent (ETB)', prefixIcon: Icon(Icons.home), border: OutlineInputBorder()),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _waterCostController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Monthly Water Tank / Bill (ETB)', prefixIcon: Icon(Icons.water_drop), border: OutlineInputBorder()),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _electricityCostController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Monthly Electricity Bill (ETB)', prefixIcon: Icon(Icons.bolt), border: OutlineInputBorder()),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _securityFeeController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Compound Security & Cleaning Fee (ETB)', prefixIcon: Icon(Icons.security), border: OutlineInputBorder()),
                    onChanged: (_) => setState(() {}),
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
