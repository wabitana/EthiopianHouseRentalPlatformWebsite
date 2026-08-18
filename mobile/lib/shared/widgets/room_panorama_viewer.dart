import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';

class RoomPanoramaViewer extends StatefulWidget {
  final List<String> images;
  final String title;

  const RoomPanoramaViewer({
    super.key,
    required this.images,
    required this.title,
  });

  @override
  State<RoomPanoramaViewer> createState() => _RoomPanoramaViewerState();
}

class _RoomPanoramaViewerState extends State<RoomPanoramaViewer> {
  int _selectedCategoryIndex = 0;
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();

  final List<Map<String, dynamic>> _categories = [
    {'name': 'All Photos', 'icon': Icons.grid_view_rounded},
    {'name': 'Living Room', 'icon': Icons.weekend_outlined},
    {'name': 'Master Bed', 'icon': Icons.bed_outlined},
    {'name': 'Kitchen', 'icon': Icons.kitchen_outlined},
    {'name': 'Balcony View', 'icon': Icons.balcony_outlined},
    {'name': 'Bathroom', 'icon': Icons.bathtub_outlined},
  ];

  @override
  Widget build(BuildContext context) {
    final displayImages = widget.images.isNotEmpty ? widget.images : ['/uploads/placeholder.jpg'];

    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          // Top Bar Category Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: List.generate(_categories.length, (index) {
                final category = _categories[index];
                final isSelected = _selectedCategoryIndex == index;
                return Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: ChoiceChip(
                    avatar: Icon(category['icon'] as IconData, size: 14, color: isSelected ? Colors.white : AppColors.primary),
                    label: Text(category['name'] as String, style: const TextStyle(fontSize: 11)),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedCategoryIndex = index;
                        });
                      }
                    },
                  ),
                );
              }),
            ),
          ),

          // Interactive Photo Viewer
          SizedBox(
            height: 220,
            child: Stack(
              children: [
                PageView.builder(
                  controller: _pageController,
                  itemCount: displayImages.length,
                  onPageChanged: (idx) {
                    setState(() {
                      _currentImageIndex = idx;
                    });
                  },
                  itemBuilder: (context, index) {
                    return Image.network(
                      Formatters.formatImageUrl(displayImages[index]),
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (_, _, _) => Container(
                        color: Colors.grey.shade900,
                        child: const Center(
                          child: Icon(Icons.home, size: 60, color: Colors.white24),
                        ),
                      ),
                    );
                  },
                ),

                // Category Tag Overlay
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _categories[_selectedCategoryIndex]['name'] as String,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

                // Image Count Indicator
                Positioned(
                  bottom: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_currentImageIndex + 1} / ${displayImages.length}',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
