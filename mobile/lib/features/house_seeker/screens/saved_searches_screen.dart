import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class SavedSearchesScreen extends StatefulWidget {
  const SavedSearchesScreen({super.key});

  @override
  State<SavedSearchesScreen> createState() => _SavedSearchesScreenState();
}

class _SavedSearchesScreenState extends State<SavedSearchesScreen> {
  final List<Map<String, dynamic>> _savedSearches = [
    {
      'title': 'Condos in Bole / Kazanchis',
      'criteria': 'Addis Ababa • 2+ Rooms • Max 25,000 ETB',
      'matches': '4 New Matches',
      'isNotify': true,
    },
    {
      'title': 'Houses in Sarbet / Old Airport',
      'criteria': 'Addis Ababa • Standalone Villa • Max 50,000 ETB',
      'matches': '1 New Match',
      'isNotify': true,
    },
    {
      'title': 'Studio Rooms in Mekelle / Hawassa',
      'criteria': 'Mekelle/Hawassa • Single Room • Max 8,000 ETB',
      'matches': '2 New Matches',
      'isNotify': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Searches & Price Drop Alerts'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: AppColors.cardShadow,
              ),
              child: const Row(
                children: [
                  Icon(Icons.notifications_active_outlined, color: AppColors.primary, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Instant Property Alerts Active', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('You will receive email & in-app alerts when matching houses are posted or price drops.', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Your Saved Search Filters', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            ..._savedSearches.map((search) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(search['title'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            search['matches'] as String,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    Text(search['criteria'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    const SizedBox(height: 10),
                    const Divider(height: 1),
                    const SizedBox(height: 6),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Notify Me on New Posts', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Switch(
                          value: search['isNotify'] as bool,
                          activeThumbColor: AppColors.primary,
                          onChanged: (val) {
                            setState(() {
                              search['isNotify'] = val;
                            });
                          },
                        ),
                      ],
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
}
