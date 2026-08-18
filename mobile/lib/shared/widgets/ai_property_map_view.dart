import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/ethiopian_coordinates.dart';
import '../models/property_model.dart';
import '../widgets/property_card.dart';
import '../../features/house_seeker/screens/property_detail_screen.dart';

/// Small Inline Map Preview Widget rendered directly inside the chat message bubble
class AiPropertyMapView extends StatefulWidget {
  final List<PropertyModel> properties;
  final double height;

  const AiPropertyMapView({
    super.key,
    required this.properties,
    this.height = 250,
  });

  @override
  State<AiPropertyMapView> createState() => _AiPropertyMapViewState();
}

class _AiPropertyMapViewState extends State<AiPropertyMapView> {
  late LatLng _center;
  bool _isSatellite = false;
  PropertyModel? _selectedProperty;

  @override
  void initState() {
    super.initState();
    _center = _calculateCenter(widget.properties);
    if (widget.properties.isNotEmpty) {
      _selectedProperty = widget.properties.first;
    }
  }

  static LatLng _calculateCenter(List<PropertyModel> properties) {
    if (properties.isEmpty) {
      return EthiopianCoordinates.defaultCenter;
    }

    double totalLat = 0;
    double totalLng = 0;
    int count = 0;

    for (int i = 0; i < properties.length; i++) {
      final p = properties[i];
      final base = EthiopianCoordinates.resolveLocation(
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        area: p.area,
        neighborhood: p.neighborhood,
      );

      final latOffset = ((i % 5) - 2) * 0.003;
      final lngOffset = (((i ~/ 5) % 5) - 2) * 0.003;

      totalLat += base.latitude + latOffset;
      totalLng += base.longitude + lngOffset;
      count++;
    }

    return count > 0 ? LatLng(totalLat / count, totalLng / count) : EthiopianCoordinates.defaultCenter;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.properties.isEmpty) {
      return const SizedBox.shrink();
    }

    final streetUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    final satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    final markers = widget.properties.asMap().entries.map((entry) {
      final i = entry.key;
      final p = entry.value;

      final base = EthiopianCoordinates.resolveLocation(
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        area: p.area,
        neighborhood: p.neighborhood,
      );

      final latOffset = ((i % 5) - 2) * 0.003;
      final lngOffset = (((i ~/ 5) % 5) - 2) * 0.003;
      final point = LatLng(base.latitude + latOffset, base.longitude + lngOffset);
      final isSelected = _selectedProperty?.id == p.id;

      return Marker(
        point: point,
        width: 110,
        height: 44,
        alignment: Alignment.topCenter,
        child: GestureDetector(
          onTap: () {
            setState(() {
              _selectedProperty = p;
              _center = point;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.secondary : AppColors.primary,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? Colors.amberAccent : Colors.white,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 4, offset: Offset(0, 2)),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.home_work_rounded, size: 12, color: Colors.white),
                const SizedBox(width: 3),
                Text(
                  '${p.price.toInt()} ETB',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
          ),
        ),
      );
    }).toList();

    return Container(
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // Small Map Canvas
            FlutterMap(
              options: MapOptions(
                initialCenter: _center,
                initialZoom: 13.0,
                maxZoom: 18.0,
                minZoom: 5.0,
                onTap: (_, _) {
                  setState(() {
                    _selectedProperty = null;
                  });
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: _isSatellite ? satelliteUrl : streetUrl,
                  userAgentPackageName: 'com.ethiopianhouserental.app',
                ),
                MarkerLayer(markers: markers),
              ],
            ),

            // Top Right Action Buttons: Satellite Toggle & Fullscreen Expand Button (⤢)
            Positioned(
              top: 8,
              right: 8,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Street / Satellite Toggle
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _isSatellite = !_isSatellite;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_isSatellite ? Icons.map_outlined : Icons.satellite_alt_rounded, color: Colors.white, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            _isSatellite ? 'Street' : 'Satellite',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Expand Fullscreen Button (⤢)
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => AiPropertyMapScreen(properties: widget.properties),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 4)],
                      ),
                      child: const Icon(Icons.fullscreen_rounded, color: Colors.white, size: 18),
                    ),
                  ),
                ],
              ),
            ),

            // Top Left Pin Count Pill
            Positioned(
              top: 8,
              left: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on_rounded, color: Colors.amberAccent, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '${widget.properties.length} Homes',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Selected Property Mini Card Overlay
            if (_selectedProperty != null)
              Positioned(
                left: 8,
                right: 8,
                bottom: 8,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 2))],
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          _selectedProperty!.images.isNotEmpty
                              ? _selectedProperty!.images.first
                              : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(
                            width: 48,
                            height: 48,
                            color: Colors.grey[300],
                            child: const Icon(Icons.home, color: Colors.grey, size: 20),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _selectedProperty!.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            Text(
                              '📍 ${_selectedProperty!.area} • ${_selectedProperty!.price.toInt()} ETB',
                              style: const TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PropertyDetailScreen(propertyId: _selectedProperty!.id),
                            ),
                          );
                        },
                        child: const Text('View', style: TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Full-screen Interactive Map Screen (Pushed when user taps the Expand button ⤢)
class AiPropertyMapScreen extends StatefulWidget {
  final List<PropertyModel> properties;

  const AiPropertyMapScreen({
    super.key,
    required this.properties,
  });

  @override
  State<AiPropertyMapScreen> createState() => _AiPropertyMapScreenState();
}

class _AiPropertyMapScreenState extends State<AiPropertyMapScreen> {
  late LatLng _center;
  bool _isSatellite = false;
  PropertyModel? _selectedProperty;

  @override
  void initState() {
    super.initState();
    _center = _calculateCenter(widget.properties);
    if (widget.properties.isNotEmpty) {
      _selectedProperty = widget.properties.first;
    }
  }

  static LatLng _calculateCenter(List<PropertyModel> properties) {
    if (properties.isEmpty) {
      return EthiopianCoordinates.defaultCenter;
    }

    double totalLat = 0;
    double totalLng = 0;
    int count = 0;

    for (int i = 0; i < properties.length; i++) {
      final p = properties[i];
      final base = EthiopianCoordinates.resolveLocation(
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        area: p.area,
        neighborhood: p.neighborhood,
      );

      final latOffset = ((i % 5) - 2) * 0.003;
      final lngOffset = (((i ~/ 5) % 5) - 2) * 0.003;

      totalLat += base.latitude + latOffset;
      totalLng += base.longitude + lngOffset;
      count++;
    }

    return count > 0 ? LatLng(totalLat / count, totalLng / count) : EthiopianCoordinates.defaultCenter;
  }

  @override
  Widget build(BuildContext context) {
    final streetUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    final satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    final markers = widget.properties.asMap().entries.map((entry) {
      final i = entry.key;
      final p = entry.value;

      final base = EthiopianCoordinates.resolveLocation(
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        area: p.area,
        neighborhood: p.neighborhood,
      );

      final latOffset = ((i % 5) - 2) * 0.003;
      final lngOffset = (((i ~/ 5) % 5) - 2) * 0.003;
      final point = LatLng(base.latitude + latOffset, base.longitude + lngOffset);
      final isSelected = _selectedProperty?.id == p.id;

      return Marker(
        point: point,
        width: 120,
        height: 52,
        alignment: Alignment.topCenter,
        child: GestureDetector(
          onTap: () {
            setState(() {
              _selectedProperty = p;
              _center = point;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.secondary : AppColors.primary,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? Colors.amberAccent : Colors.white,
                width: isSelected ? 2.5 : 1.5,
              ),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 2)),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.home_work_rounded,
                  size: 14,
                  color: Colors.white,
                ),
                const SizedBox(width: 4),
                Text(
                  '${p.price.toInt()} ETB',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Interactive Map (${widget.properties.length} Available Homes)'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          // Live Fullscreen Interactive FlutterMap
          FlutterMap(
            options: MapOptions(
              initialCenter: _center,
              initialZoom: 13.5,
              maxZoom: 18.0,
              minZoom: 5.0,
              onTap: (_, _) {
                setState(() {
                  _selectedProperty = null;
                });
              },
            ),
            children: [
              TileLayer(
                urlTemplate: _isSatellite ? satelliteUrl : streetUrl,
                userAgentPackageName: 'com.ethiopianhouserental.app',
              ),
              MarkerLayer(markers: markers),
            ],
          ),

          // Street vs Satellite View Mode Switcher
          Positioned(
            top: 12,
            right: 12,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _isSatellite = !_isSatellite;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.75),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_isSatellite ? Icons.map_outlined : Icons.satellite_alt_rounded, color: Colors.white, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      _isSatellite ? 'Street View' : 'Satellite',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Selected Property Floating Preview Card at Bottom
          if (_selectedProperty != null)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 6.0),
                      child: CircleAvatar(
                        radius: 14,
                        backgroundColor: Colors.black54,
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          icon: const Icon(Icons.close, size: 16, color: Colors.white),
                          onPressed: () {
                            setState(() {
                              _selectedProperty = null;
                            });
                          },
                        ),
                      ),
                    ),
                  ),
                  PropertyCard(
                    property: _selectedProperty!,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => PropertyDetailScreen(propertyId: _selectedProperty!.id),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
