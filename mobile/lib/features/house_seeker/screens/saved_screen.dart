import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/property_card.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/property_provider.dart';
import '../providers/favorites_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'property_detail_screen.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final favoritesProvider = context.watch<FavoritesProvider>();
    final user = context.watch<AuthProvider>().currentUser;

    final savedProperties = propertyProvider.properties
        .where((p) => favoritesProvider.isFavorite(p.id))
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Houses'),
      ),
      body: savedProperties.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.favorite_border_rounded,
              title: 'No saved houses yet',
              description: 'Tap the heart icon on any house listing to save it here for quick access later.',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: savedProperties.length,
              itemBuilder: (context, index) {
                final property = savedProperties[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: PropertyCard(
                    property: property,
                    isFavorite: true,
                    onFavoriteToggle: () {
                      if (user != null) {
                        favoritesProvider.toggleFavorite(user.id, property.id);
                      }
                    },
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => PropertyDetailScreen(propertyId: property.id),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}
