import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/repositories/saved_search_repository.dart';
import '../../../shared/models/saved_search_model.dart';
import '../../notifications/providers/notification_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/property_provider.dart';
import 'property_detail_screen.dart';
import 'search_screen.dart';

class SavedSearchesScreen extends StatefulWidget {
  const SavedSearchesScreen({super.key});

  @override
  State<SavedSearchesScreen> createState() => _SavedSearchesScreenState();
}

class _SavedSearchesScreenState extends State<SavedSearchesScreen> {
  final SavedSearchRepository _repository = SavedSearchRepositoryImpl();
  List<SavedSearchModel> _savedSearches = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadSavedSearches();
  }

  Future<void> _loadSavedSearches() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final searches = await _repository.getSavedSearches();
      if (mounted) {
        setState(() {
          _savedSearches = searches;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Unable to calculate search matches from database. Tap to retry.';
        });
      }
    }
  }

  Future<void> _handleToggleNotify(SavedSearchModel search, bool newValue) async {
    final originalState = search.isNotify;
    setState(() {
      search.isNotify = newValue;
    });

    final success = await _repository.toggleAlert(search.id, newValue);
    if (!success && mounted) {
      setState(() {
        search.isNotify = originalState;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update alert preference. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    } else if (mounted) {
      final auth = context.read<AuthProvider>();
      if (auth.currentUser != null) {
        context.read<NotificationProvider>().fetchNotifications(auth.currentUser!.id);
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            newValue
                ? '🔔 Alerts enabled for "${search.title}". You will receive notifications on new posts & price drops.'
                : '🔕 Alerts muted for "${search.title}".',
          ),
          backgroundColor: newValue ? AppColors.primary : AppColors.textSecondary,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _handleDeleteSearch(SavedSearchModel search) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Search Alert?'),
        content: Text('Are you sure you want to remove "${search.title}"? You will no longer receive price drop and new match notifications for this criteria.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final success = await _repository.deleteSavedSearch(search.id);
    if (success && mounted) {
      setState(() {
        _savedSearches.removeWhere((s) => s.id == search.id);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Search alert "${search.title}" removed.'),
          backgroundColor: AppColors.textSecondary,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not delete search alert. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _applyFilterAndNavigate(SavedSearchModel search) {
    final propertyProvider = context.read<PropertyProvider>();
    propertyProvider.resetFilters();

    if (search.city.isNotEmpty && search.city != 'All') {
      propertyProvider.setSelectedCity(search.city);
    }
    if (search.area.isNotEmpty && search.area != 'All') {
      final primaryArea = search.area.split(RegExp(r'[/,]')).first.trim();
      propertyProvider.setSelectedArea(primaryArea);
    }
    if (search.propertyType.isNotEmpty && search.propertyType != 'All') {
      final primaryType = search.propertyType.split(RegExp(r'[/,]')).first.trim();
      propertyProvider.setPropertyType(primaryType);
    }
    if (search.minRooms > 0) {
      propertyProvider.setRooms(search.minRooms);
    }
    if (search.maxPrice > 0) {
      propertyProvider.setPriceRange(search.minPrice, search.maxPrice);
    }

    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SearchScreen()),
    );
  }

  void _showMatchingPropertiesModal(SavedSearchModel search) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          search.title,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          search.criteria,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${search.matchesCount} in DB',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Expanded(
                child: search.matchingProperties.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.search_off_rounded, size: 54, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'No Active Properties in Database',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'We will notify you immediately when a provider posts a house matching these criteria.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: search.matchingProperties.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (ctx, idx) {
                          final prop = search.matchingProperties[idx];
                          final hasImg = prop.images.isNotEmpty && prop.images.first.startsWith('http');
                          return InkWell(
                            onTap: () {
                              Navigator.pop(ctx);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PropertyDetailScreen(propertyId: prop.id),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: hasImg
                                        ? Image.network(
                                            prop.images.first,
                                            width: 72,
                                            height: 72,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Container(
                                              width: 72,
                                              height: 72,
                                              color: Colors.grey.shade200,
                                              child: const Icon(Icons.home_outlined, color: AppColors.primary),
                                            ),
                                          )
                                        : Container(
                                            width: 72,
                                            height: 72,
                                            color: AppColors.primary.withValues(alpha: 0.1),
                                            child: const Icon(Icons.home_outlined, color: AppColors.primary),
                                          ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          prop.title,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          '${prop.city} • ${prop.area} • ${prop.rooms} Bed',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${Formatters.formatCurrency(prop.price)} /month',
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.tune_rounded, color: Colors.white, size: 18),
                  label: const Text(
                    'Explore in Search Filter',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _applyFilterAndNavigate(search);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _openCreateAlertDialog() {
    final titleController = TextEditingController();
    String selectedCity = 'Addis Ababa';
    String selectedArea = 'All';
    String selectedType = 'All';
    int selectedRooms = 0;
    double maxPrice = 30000;
    bool isNotify = true;
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.88,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Create Search Alert',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const Divider(height: 1),
                  const SizedBox(height: 14),
                  Expanded(
                    child: ListView(
                      children: [
                        const Text('Alert Title / Label *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: titleController,
                          decoration: InputDecoration(
                            hintText: 'e.g. Condos in Bole Atlas or CMC Villa',
                            hintStyle: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                        const SizedBox(height: 16),

                        const Text('City', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: selectedCity,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          ),
                          items: AppConstants.ethiopianCities.toSet().map((city) {
                            return DropdownMenuItem(value: city, child: Text(city));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() {
                                selectedCity = val;
                                selectedArea = 'All';
                              });
                            }
                          },
                        ),
                        const SizedBox(height: 16),

                        if (selectedCity == 'Addis Ababa') ...[
                          const Text('Subcity / Area', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: selectedArea,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            ),
                            items: <String>{'All', ...AppConstants.addisSubcities}.map((area) {
                              return DropdownMenuItem(value: area, child: Text(area));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setModalState(() => selectedArea = val);
                              }
                            },
                          ),
                          const SizedBox(height: 16),
                        ],

                        const Text('Property Type', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: ['All', ...AppConstants.propertyTypes].map((type) {
                            final isSel = selectedType == type;
                            return ChoiceChip(
                              label: Text(type),
                              selected: isSel,
                              selectedColor: AppColors.primary.withValues(alpha: 0.15),
                              labelStyle: TextStyle(
                                fontSize: 12,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                color: isSel ? AppColors.primary : AppColors.textPrimary,
                              ),
                              onSelected: (_) => setModalState(() => selectedType = type),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),

                        const Text('Minimum Bedrooms', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Row(
                          children: List.generate(5, (idx) {
                            final isSel = selectedRooms == idx;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Text(idx == 0 ? 'Any' : '$idx+'),
                                selected: isSel,
                                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  color: isSel ? AppColors.primary : AppColors.textPrimary,
                                ),
                                onSelected: (_) => setModalState(() => selectedRooms = idx),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 16),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Maximum Monthly Budget', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            Text(
                              Formatters.formatCurrency(maxPrice),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ],
                        ),
                        Slider(
                          value: maxPrice,
                          min: 5000,
                          max: 100000,
                          divisions: 19,
                          activeColor: AppColors.primary,
                          label: Formatters.formatCurrency(maxPrice),
                          onChanged: (val) => setModalState(() => maxPrice = val),
                        ),
                        const SizedBox(height: 14),

                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Instant In-App & Email Alerts', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    SizedBox(height: 2),
                                    Text('Notify immediately when matching listings appear or prices drop', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                  ],
                                ),
                              ),
                              Switch.adaptive(
                                value: isNotify,
                                activeThumbColor: AppColors.primary,
                                onChanged: (val) => setModalState(() => isNotify = val),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final title = titleController.text.trim();
                              if (title.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Please enter an alert title'),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                                return;
                              }

                              setModalState(() => isSubmitting = true);

                              try {
                                final created = await _repository.createSavedSearch(
                                  title: title,
                                  city: selectedCity,
                                  area: selectedArea,
                                  propertyType: selectedType,
                                  maxPrice: maxPrice,
                                  minRooms: selectedRooms,
                                  isNotify: isNotify,
                                );

                                if (mounted) {
                                  Navigator.pop(context);
                                  setState(() {
                                    _savedSearches.insert(0, created);
                                  });

                                  final auth = context.read<AuthProvider>();
                                  if (auth.currentUser != null) {
                                    context.read<NotificationProvider>().fetchNotifications(auth.currentUser!.id);
                                  }

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        '🎉 Alert created! Found ${created.matchesCount} matching listings in database.',
                                      ),
                                      backgroundColor: AppColors.primary,
                                    ),
                                  );
                                }
                              } catch (e) {
                                setModalState(() => isSubmitting = false);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Failed to save alert: ${e.toString()}'),
                                      backgroundColor: AppColors.error,
                                    ),
                                  );
                                }
                              }
                            },
                      child: isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text(
                              'Save Search & Alert',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Searches & Price Drop Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_alert_rounded),
            tooltip: 'Add Search Alert',
            onPressed: _openCreateAlertDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Recalculate Matches',
            onPressed: _loadSavedSearches,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_alert_rounded, color: Colors.white),
        label: const Text('New Search Alert', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _openCreateAlertDialog,
      ),
      body: RefreshIndicator(
        onRefresh: _loadSavedSearches,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 90),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Real-Time Active Status Banner
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
                          Text(
                            'Instant Property Alerts Active',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'You will receive email & in-app alerts when matching houses are posted or price drops.',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Your Saved Search Filters',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.add, size: 16, color: AppColors.primary),
                    label: const Text('Add Alert', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    onPressed: _openCreateAlertDialog,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (_isLoading)
                Column(
                  children: List.generate(3, (index) => _buildSkeletonCard()),
                )
              else if (_errorMessage != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textSecondary),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: _loadSavedSearches,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              else if (_savedSearches.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.search_rounded, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'No Saved Searches Yet',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Create custom search alerts to get notified the second matching rental houses are listed in Ethiopia.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: _openCreateAlertDialog,
                        icon: const Icon(Icons.add_alert_rounded, color: Colors.white, size: 16),
                        label: const Text('Create First Alert', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )
              else
                ..._savedSearches.map((search) {
                  final hasMatches = search.matchesCount > 0;
                  return InkWell(
                    onTap: () => _showMatchingPropertiesModal(search),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
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
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  search.title,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: hasMatches
                                      ? AppColors.primary.withValues(alpha: 0.1)
                                      : Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: hasMatches
                                        ? AppColors.primary.withValues(alpha: 0.25)
                                        : Colors.grey.shade300,
                                  ),
                                ),
                                child: Text(
                                  hasMatches
                                      ? '${search.matchesCount} ${search.matchesCount == 1 ? "New Match" : "New Matches"}'
                                      : '0 Matches in DB',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: hasMatches ? AppColors.primary : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              IconButton(
                                constraints: const BoxConstraints(),
                                padding: const EdgeInsets.all(4),
                                icon: const Icon(Icons.delete_outline, size: 18, color: Colors.grey),
                                tooltip: 'Delete Alert',
                                onPressed: () => _handleDeleteSearch(search),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          Text(
                            search.criteria,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 8),

                          // Real matching houses thumbnail strip if present
                          if (search.matchingProperties.isNotEmpty) ...[
                            SizedBox(
                              height: 38,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: search.matchingProperties.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 6),
                                itemBuilder: (ctx, idx) {
                                  final prop = search.matchingProperties[idx];
                                  final hasImg = prop.images.isNotEmpty && prop.images.first.startsWith('http');
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.surface,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        if (hasImg)
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(4),
                                            child: Image.network(
                                              prop.images.first,
                                              width: 24,
                                              height: 24,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => const Icon(Icons.home, size: 16),
                                            ),
                                          )
                                        else
                                          const Icon(Icons.home, size: 16, color: AppColors.primary),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${Formatters.formatCurrency(prop.price)} (${prop.area})',
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 8),
                          ],

                          const Divider(height: 1),
                          const SizedBox(height: 6),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              InkWell(
                                onTap: () => _applyFilterAndNavigate(search),
                                child: const Row(
                                  children: [
                                    Text(
                                      'View Matches in Search',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                                    ),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward_ios_rounded, size: 11, color: AppColors.primary),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  const Text(
                                    'Notify Me on New Posts',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(width: 6),
                                  Switch.adaptive(
                                    value: search.isNotify,
                                    activeThumbColor: AppColors.primary,
                                    onChanged: (val) => _handleToggleNotify(search, val),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSkeletonCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(width: 140, height: 16, color: Colors.grey.shade200),
              Container(width: 80, height: 20, color: Colors.grey.shade200),
            ],
          ),
          const SizedBox(height: 8),
          Container(width: 220, height: 12, color: Colors.grey.shade100),
          const SizedBox(height: 14),
          const Divider(height: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(width: 120, height: 14, color: Colors.grey.shade100),
              Container(width: 40, height: 24, color: Colors.grey.shade200),
            ],
          ),
        ],
      ),
    );
  }
}
