import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/property_card.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../../shared/widgets/custom_button.dart';
import '../providers/property_provider.dart';
import '../providers/favorites_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'property_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final provider = context.read<PropertyProvider>();
    _searchController.text = provider.searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openFilterModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const SearchFilterBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final favoritesProvider = context.watch<FavoritesProvider>();
    final user = context.watch<AuthProvider>().currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Search Rental Houses'),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: propertyProvider.activeFiltersCount > 0,
              label: Text('${propertyProvider.activeFiltersCount}'),
              backgroundColor: AppColors.secondary,
              child: const Icon(Icons.tune_rounded),
            ),
            onPressed: () => _openFilterModal(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Input Container
          Container(
            padding: const EdgeInsets.all(16.0),
            color: AppColors.surface,
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (val) {
                          propertyProvider.setSearchQuery(val);
                        },
                        decoration: InputDecoration(
                          hintText: 'Search city, area or neighborhood...',
                          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear, size: 18),
                                  onPressed: () {
                                    _searchController.clear();
                                    propertyProvider.setSearchQuery('');
                                  },
                                )
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    InkWell(
                      onTap: () => _openFilterModal(context),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: const Icon(Icons.tune_rounded, color: AppColors.primary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Sort Dropdown & Filter Pills Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${propertyProvider.properties.length} results found',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Row(
                      children: [
                        const Text('Sort: ', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: propertyProvider.sortBy,
                            isDense: true,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                            items: ['Recommended', 'Lowest price', 'Highest price', 'Newest']
                                .map((sort) => DropdownMenuItem(value: sort, child: Text(sort)))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) propertyProvider.setSortBy(val);
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Active Filters horizontal bar
          if (propertyProvider.activeFiltersCount > 0)
            Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              color: AppColors.surfaceVariant,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: TextButton(
                        onPressed: () => propertyProvider.resetFilters(),
                        child: const Text('Clear All', style: TextStyle(fontSize: 12, color: AppColors.rejected, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                  if (propertyProvider.selectedCity != 'All')
                    _FilterTag('City: ${propertyProvider.selectedCity}', () => propertyProvider.setSelectedCity('All')),
                  if (propertyProvider.selectedArea != 'All')
                    _FilterTag('Area: ${propertyProvider.selectedArea}', () => propertyProvider.setSelectedArea('All')),
                  if (propertyProvider.selectedPropertyType != 'All')
                    _FilterTag('Type: ${propertyProvider.selectedPropertyType}', () => propertyProvider.setPropertyType('All')),
                ],
              ),
            ),

          // Results List
          Expanded(
            child: propertyProvider.isLoading
                ? ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: 3,
                    itemBuilder: (context, index) => const PropertyCardSkeleton(),
                  )
                : propertyProvider.properties.isEmpty
                    ? EmptyStateWidget(
                        title: 'No properties match your filters',
                        description: 'Try loosening your price range or clearing specific amenity filters.',
                        buttonText: 'Reset Filters',
                        onButtonPressed: () => propertyProvider.resetFilters(),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
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
          ),
        ],
      ),
    );
  }
}

class _FilterTag extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;

  const _FilterTag(this.label, this.onRemove);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      child: Chip(
        label: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
        deleteIcon: const Icon(Icons.close, size: 14, color: AppColors.primary),
        onDeleted: onRemove,
        backgroundColor: Colors.white,
        side: const BorderSide(color: AppColors.primaryContainer),
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),
    );
  }
}

class SearchFilterBottomSheet extends StatelessWidget {
  const SearchFilterBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertyProvider>();

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filter Houses',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const Divider(),

          Expanded(
            child: ListView(
              children: [
                // City Filter
                const Text('City', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: AppConstants.ethiopianCities.contains(provider.selectedCity)
                      ? provider.selectedCity
                      : AppConstants.ethiopianCities.first,
                  decoration: const InputDecoration(border: OutlineInputBorder()),
                  items: AppConstants.ethiopianCities.toSet().map((city) {
                    return DropdownMenuItem(value: city, child: Text(city));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) provider.setSelectedCity(val);
                  },
                ),
                const SizedBox(height: 16),

                // Area / Subcity Filter (for Addis Ababa)
                if (provider.selectedCity == 'Addis Ababa') ...[
                  const Text('Area / Subcity', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: ['All', ...AppConstants.addisSubcities].contains(provider.selectedArea)
                        ? provider.selectedArea
                        : 'All',
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: <String>{'All', ...AppConstants.addisSubcities}.map((area) {
                      return DropdownMenuItem(value: area, child: Text(area));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) provider.setSelectedArea(val);
                    },
                  ),
                  const SizedBox(height: 16),
                ],

                // Price Range Filter in ETB
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Monthly Price (ETB)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    Text(
                      '${Formatters.formatCurrency(provider.minPrice)} - ${Formatters.formatCurrency(provider.maxPrice)}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ],
                ),
                RangeSlider(
                  values: RangeValues(provider.minPrice, provider.maxPrice),
                  min: 0,
                  max: 100000,
                  divisions: 20,
                  activeColor: AppColors.primary,
                  labels: RangeLabels(
                    Formatters.formatCurrency(provider.minPrice),
                    Formatters.formatCurrency(provider.maxPrice),
                  ),
                  onChanged: (values) {
                    provider.setPriceRange(values.start, values.end);
                  },
                ),
                const SizedBox(height: 16),

                // Property Type
                const Text('Property Type', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ['All', ...AppConstants.propertyTypes].map((type) {
                    final isSelected = provider.selectedPropertyType == type;
                    return ChoiceChip(
                      label: Text(type),
                      selected: isSelected,
                      onSelected: (selected) => provider.setPropertyType(selected ? type : 'All'),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Rooms Count
                const Text('Minimum Bedrooms', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  children: List.generate(5, (index) {
                    final isSelected = provider.minRooms == index;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(index == 0 ? 'Any' : '$index+'),
                        selected: isSelected,
                        onSelected: (selected) => provider.setRooms(index),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 16),

                // Amenities Checklist
                const Text('Amenities', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: AppConstants.amenities.map((amenity) {
                    final isSelected = provider.selectedAmenities.contains(amenity);
                    return FilterChip(
                      label: Text(amenity),
                      selected: isSelected,
                      onSelected: (_) => provider.toggleAmenity(amenity),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: 'Reset',
                  variant: CustomButtonVariant.outline,
                  onPressed: () {
                    provider.resetFilters();
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomButton(
                  text: 'Apply Filters',
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
