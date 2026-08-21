import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';

import '../../../shared/widgets/property_card.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/property_provider.dart';
import '../providers/favorites_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'property_detail_screen.dart';

class SavedScreen extends StatefulWidget {
  final VoidCallback? onExploreTap;

  const SavedScreen({super.key, this.onExploreTap});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null) {
        context.read<FavoritesProvider>().loadFavorites(user.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final favoritesProvider = context.watch<FavoritesProvider>();
    final user = context.watch<AuthProvider>().currentUser;

    final savedProperties = propertyProvider.properties
        .where((p) => favoritesProvider.isFavorite(p.id))
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          savedProperties.isEmpty ? 'Saved Houses' : 'Saved Houses (${savedProperties.length})',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
        ),
      ),
      body: favoritesProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : savedProperties.isEmpty
              ? Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: EmptyStateWidget(
                      icon: Icons.favorite_border_rounded,
                      title: 'No saved houses yet',
                      description: 'Tap the heart icon on any house listing to save it here for quick access later.',
                      buttonText: 'Explore Houses',
                      onButtonPressed: widget.onExploreTap,
                    ),
                  ),
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
