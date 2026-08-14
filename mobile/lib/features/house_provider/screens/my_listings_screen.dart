import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/property_model.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../house_seeker/providers/property_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../house_seeker/screens/property_detail_screen.dart';

class MyListingsScreen extends StatefulWidget {
  const MyListingsScreen({super.key});

  @override
  State<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends State<MyListingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final user = context.watch<AuthProvider>().currentUser;
    final myListings = propertyProvider.providerProperties;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My House Listings'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textMuted,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Active'),
            Tab(text: 'Pending'),
            Tab(text: 'Rented'),
            Tab(text: 'Rejected'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildListingsList(myListings, null, propertyProvider, user?.id),
          _buildListingsList(myListings, PropertyListingStatus.active, propertyProvider, user?.id),
          _buildListingsList(myListings, PropertyListingStatus.pending, propertyProvider, user?.id),
          _buildListingsList(myListings, PropertyListingStatus.rented, propertyProvider, user?.id),
          _buildListingsList(myListings, PropertyListingStatus.rejected, propertyProvider, user?.id),
        ],
      ),
    );
  }

  Widget _buildListingsList(
    List<PropertyModel> listings,
    PropertyListingStatus? filterStatus,
    PropertyProvider propertyProvider,
    String? userId,
  ) {
    final filtered = filterStatus == null
        ? listings
        : listings.where((p) => p.listingStatus == filterStatus).toList();

    if (filtered.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.holiday_village_outlined,
        title: 'No listings found',
        description: 'You do not have any property listings under this status tab.',
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        if (userId != null) {
          await propertyProvider.fetchProviderProperties(userId);
        }
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final property = filtered[index];
          return _ProviderPropertyCard(
            property: property,
            onToggleAvailability: () {
              propertyProvider.toggleAvailability(property.id, !property.availability);
            },
            onDelete: () {
              _confirmDelete(context, propertyProvider, property.id);
            },
          );
        },
      ),
    );
  }

  void _confirmDelete(BuildContext context, PropertyProvider provider, String propertyId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Listing?'),
        content: const Text('Are you sure you want to remove this property listing permanently?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              provider.deleteProperty(propertyId);
              Navigator.of(ctx).pop();
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _ProviderPropertyCard extends StatelessWidget {
  final PropertyModel property;
  final VoidCallback onToggleAvailability;
  final VoidCallback onDelete;

  const _ProviderPropertyCard({
    required this.property,
    required this.onToggleAvailability,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                Formatters.formatImageUrl(property.images.isNotEmpty ? property.images.first : ''),
                width: 65,
                height: 65,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(width: 65, height: 65, color: AppColors.surfaceVariant),
              ),
            ),
            title: Text(property.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 2),
                Text('${Formatters.formatCurrency(property.price)} / ${property.rentalPeriod}', style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text('📍 ${property.area}, ${property.city}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
            trailing: StatusBadge(status: property.listingStatus),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.remove_red_eye_outlined, size: 16),
                  label: const Text('View'),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => PropertyDetailScreen(propertyId: property.id)),
                    );
                  },
                ),
                TextButton.icon(
                  icon: Icon(property.availability ? Icons.check_circle : Icons.key_rounded, size: 16),
                  label: Text(property.availability ? 'Mark Rented' : 'Mark Available'),
                  onPressed: onToggleAvailability,
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.rejected, size: 20),
                  onPressed: onDelete,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
