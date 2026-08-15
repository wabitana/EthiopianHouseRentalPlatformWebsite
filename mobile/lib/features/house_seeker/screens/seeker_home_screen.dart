import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/property_card.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../providers/property_provider.dart';
import '../providers/favorites_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notification_provider.dart';
import '../../notifications/screens/notification_center_screen.dart';
import 'property_detail_screen.dart';
import 'search_screen.dart';
import '../../../shared/widgets/app_navigation_drawer.dart';

class SeekerHomeScreen extends StatelessWidget {
  const SeekerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final propertyProvider = context.watch<PropertyProvider>();
    final favoritesProvider = context.watch<FavoritesProvider>();
    final notificationProvider = context.watch<NotificationProvider>();
    final user = authProvider.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppNavigationDrawer(),
      appBar: AppBar(
        title: const Text('Ethiopian House Rental'),
        centerTitle: true,
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(24),
          ),
        ),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: notificationProvider.unreadCount > 0,
              label: Text('${notificationProvider.unreadCount}'),
              backgroundColor: AppColors.secondary,
              child: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationCenterScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => propertyProvider.fetchProperties(),
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Greeting Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primaryContainer,
                      backgroundImage: (user?.avatarUrl != null && user!.avatarUrl!.trim().isNotEmpty && user.avatarUrl!.startsWith('http'))
                          ? NetworkImage(user.avatarUrl!.trim())
                          : null,
                      child: (user?.avatarUrl == null || user!.avatarUrl!.trim().isEmpty || !user.avatarUrl!.startsWith('http'))
                          ? const Icon(Icons.person, color: AppColors.primary)
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Selam, ${user?.name.split(' ').first ?? 'Seeker'} 👋',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const Text(
                            'Find your next home in Ethiopia',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

                // City Selector Banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: AppColors.secondary, size: 20),
                      const SizedBox(width: 8),
                      const Text(
                        'Location: ',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                      ),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: propertyProvider.selectedCity,
                          isDense: true,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.primary),
                          items: AppConstants.ethiopianCities.map((city) {
                            return DropdownMenuItem(
                              value: city,
                              child: Text(city),
                            );
                          }).toList(),
                          onChanged: (newCity) {
                            if (newCity != null) {
                              propertyProvider.setSelectedCity(newCity);
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Search Bar Trigger
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SearchScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.search_rounded, color: AppColors.primary, size: 22),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Search by city, area or neighborhood...',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                        Icon(Icons.tune_rounded, color: AppColors.textMuted, size: 20),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Property Types Quick Filter Chips
                SizedBox(
                  height: 38,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildCategoryChip('All', propertyProvider),
                      ...AppConstants.propertyTypes.map((type) => _buildCategoryChip(type, propertyProvider)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Featured / Recommended Section Carousel
                if (propertyProvider.featuredProperties.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Featured Properties',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const SearchScreen()),
                          );
                        },
                        child: const Text('See All', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 250,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: propertyProvider.featuredProperties.length,
                      itemBuilder: (context, index) {
                        final property = propertyProvider.featuredProperties[index];
                        return PropertyCard(
                          property: property,
                          isHorizontal: true,
                          isFavorite: favoritesProvider.isFavorite(property.id),
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
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // All Available Properties Heading
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Available in ${propertyProvider.selectedCity}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${propertyProvider.properties.length} houses',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Properties List or Loader / Empty State
                if (propertyProvider.isLoading)
                  Column(
                    children: List.generate(3, (_) => const PropertyCardSkeleton()),
                  )
                else if (propertyProvider.properties.isEmpty)
                  EmptyStateWidget(
                    title: 'No houses found in ${propertyProvider.selectedCity}',
                    description: 'Try changing your search location or clearing active filter options.',
                    buttonText: 'Reset Search',
                    onButtonPressed: () => propertyProvider.resetFilters(),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: propertyProvider.properties.length,
                    itemBuilder: (context, index) {
                      final property = propertyProvider.properties[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: PropertyCard(
                          property: property,
                          isFavorite: favoritesProvider.isFavorite(property.id),
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
              ],
            ),
          ),
        ),
    );
  }

  Widget _buildCategoryChip(String type, PropertyProvider provider) {
    final isSelected = provider.selectedPropertyType == type;
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(type),
        selected: isSelected,
        selectedColor: AppColors.primaryContainer,
        backgroundColor: AppColors.surface,
        checkmarkColor: AppColors.primary,
        side: BorderSide(
          color: isSelected ? AppColors.primary : AppColors.border,
        ),
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          fontSize: 13,
        ),
        onSelected: (selected) {
          provider.setPropertyType(selected ? type : 'All');
        },
      ),
    );
  }
}
