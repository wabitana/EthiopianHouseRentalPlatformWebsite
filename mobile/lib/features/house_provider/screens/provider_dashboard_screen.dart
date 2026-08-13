import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/property_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/verification_badge.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../house_seeker/providers/property_provider.dart';
import '../../house_seeker/providers/inquiry_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'post_house_wizard_screen.dart';
import 'my_listings_screen.dart';
import 'provider_inquiries_screen.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/app_navigation_drawer.dart';

class ProviderDashboardScreen extends StatelessWidget {
  const ProviderDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;
    final propertyProvider = context.watch<PropertyProvider>();
    final inquiryProvider = context.watch<InquiryProvider>();

    final myProperties = propertyProvider.providerProperties;
    final totalListings = myProperties.length;
    final activeListings = myProperties.where((p) => p.listingStatus == PropertyListingStatus.active).length;
    final pendingListings = myProperties.where((p) => p.listingStatus == PropertyListingStatus.pending).length;
    final rentedListings = myProperties.where((p) => p.listingStatus == PropertyListingStatus.rented).length;
    final newInquiries = inquiryProvider.newProviderInquiriesCount;

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppNavigationDrawer(),
      appBar: AppBar(
        title: const Text('Provider Dashboard'),
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
            tooltip: 'Switch to Seeker Mode',
            icon: const Icon(Icons.swap_horiz_rounded, color: Colors.white, size: 24),
            onPressed: () {
              authProvider.switchRole(UserRole.seeker);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Switched to House Seeker Mode ✓'),
                  backgroundColor: AppColors.primary,
                  behavior: SnackBarBehavior.floating,
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
              // Greeting Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Good day, ${user?.name.split(' ').first ?? 'Provider'} 👋',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: const [
                          Text('Provider Dashboard', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          SizedBox(width: 8),
                          VerificationBadge(label: 'Verified Provider', isSmall: true),
                        ],
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: AppColors.primaryContainer,
                    backgroundImage: (user?.avatarUrl != null && user!.avatarUrl!.trim().isNotEmpty && user.avatarUrl!.startsWith('http'))
                        ? NetworkImage(user.avatarUrl!.trim())
                        : null,
                    child: (user?.avatarUrl == null || user!.avatarUrl!.trim().isEmpty || !user.avatarUrl!.startsWith('http'))
                        ? const Icon(Icons.person, color: AppColors.primary)
                        : null,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Metric Stats Summary Grid
              Row(
                children: [
                  Expanded(child: _StatCard('Total Listings', '$totalListings', Icons.maps_home_work_outlined, AppColors.primary)),
                  const SizedBox(width: 10),
                  Expanded(child: _StatCard('Active', '$activeListings', Icons.check_circle_outline, AppColors.success)),
                  const SizedBox(width: 10),
                  Expanded(child: _StatCard('Rented', '$rentedListings', Icons.key_rounded, AppColors.rented)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _StatCard('Pending Review', '$pendingListings', Icons.hourglass_empty, AppColors.pending)),
                  const SizedBox(width: 10),
                  Expanded(child: _StatCard('New Inquiries', '$newInquiries', Icons.mail_outline_rounded, AppColors.secondary)),
                ],
              ),
              const SizedBox(height: 24),

              // CTA Post New House Button
              CustomButton(
                text: '+ Post New House for Rent',
                icon: Icons.add_home_outlined,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PostHouseWizardScreen()),
                  );
                },
              ),
              const SizedBox(height: 28),

              // Recent Inquiries Snippet
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Inquiries', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ProviderInquiriesScreen()),
                      );
                    },
                    child: const Text('View All', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (inquiryProvider.providerInquiries.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text('No inquiries received yet.', style: TextStyle(color: AppColors.textSecondary)),
                  ),
                )
              else
                for (final inq in inquiryProvider.providerInquiries.take(2))
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.primaryContainer,
                          backgroundImage: (inq.seekerAvatar != null && inq.seekerAvatar!.trim().isNotEmpty && inq.seekerAvatar!.startsWith('http'))
                              ? NetworkImage(inq.seekerAvatar!.trim())
                              : null,
                          child: (inq.seekerAvatar == null || inq.seekerAvatar!.trim().isEmpty || !inq.seekerAvatar!.startsWith('http'))
                              ? const Icon(Icons.person, color: AppColors.primary, size: 20)
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(inq.seekerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Text(
                                'Re: ${inq.propertyTitle}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          Formatters.formatTimeAgo(inq.createdAt),
                          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),

              const SizedBox(height: 24),

              // Recent Listings Snippet
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Your Listings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const MyListingsScreen()),
                      );
                    },
                    child: const Text('Manage', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (myProperties.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text('You have not posted any house listings yet.', style: TextStyle(color: AppColors.textSecondary)),
                  ),
                )
              else
                for (final property in myProperties.take(3))
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            property.images.isNotEmpty ? property.images.first : '',
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(width: 50, height: 50, color: AppColors.surfaceVariant),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(property.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text('${Formatters.formatCurrency(property.price)} / ${property.rentalPeriod}', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        StatusBadge(status: property.listingStatus),
                      ],
                    ),
                  ),
            ],
          ),
        ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard(this.title, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
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
              Icon(icon, color: color, size: 20),
              Text(
                value,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
