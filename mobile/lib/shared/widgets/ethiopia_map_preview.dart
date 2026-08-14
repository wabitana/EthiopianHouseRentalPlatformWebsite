import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:web/web.dart' as web;
import '../../core/theme/app_colors.dart';
import '../../core/utils/ethiopian_coordinates.dart';

class EthiopiaMapPreview extends StatefulWidget {
  final String city;
  final String area;
  final String neighborhood;
  final double? latitude;
  final double? longitude;
  final bool isInteractive;
  final ValueChanged<LatLng>? onLocationSelected;

  const EthiopiaMapPreview({
    super.key,
    required this.city,
    required this.area,
    required this.neighborhood,
    this.latitude,
    this.longitude,
    this.isInteractive = false,
    this.onLocationSelected,
  });

  @override
  State<EthiopiaMapPreview> createState() => _EthiopiaMapPreviewState();
}

class _EthiopiaMapPreviewState extends State<EthiopiaMapPreview> {
  late final MapController _mapController;
  late LatLng _currentCenter;
  bool _isSatellite = false;
  double _zoomLevel = 14.5;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _currentCenter = EthiopianCoordinates.resolveLocation(
      latitude: widget.latitude,
      longitude: widget.longitude,
      city: widget.city,
      area: widget.area,
      neighborhood: widget.neighborhood,
    );
  }

  @override
  void didUpdateWidget(covariant EthiopiaMapPreview oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.city != widget.city ||
        oldWidget.area != widget.area ||
        oldWidget.neighborhood != widget.neighborhood ||
        oldWidget.latitude != widget.latitude ||
        oldWidget.longitude != widget.longitude) {
      final newCenter = EthiopianCoordinates.resolveLocation(
        latitude: widget.latitude,
        longitude: widget.longitude,
        city: widget.city,
        area: widget.area,
        neighborhood: widget.neighborhood,
      );
      setState(() {
        _currentCenter = newCenter;
      });
      _mapController.move(newCenter, _zoomLevel);
    }
  }

  void _openGoogleMapsDirections() async {
    final query = '${widget.neighborhood}, ${widget.area}, ${widget.city}, Ethiopia';
    final targetUrlString =
        'https://www.google.com/maps/dir/?api=1&destination=${_currentCenter.latitude},${_currentCenter.longitude}&travelmode=driving';

    // On Web: Use native browser window.open to bypass MissingPluginException on hot-reloaded dev sessions
    if (kIsWeb) {
      try {
        web.window.open(targetUrlString, '_blank');
        return;
      } catch (e) {
        debugPrint('Web window.open info: $e');
      }
    }

    final googleMapsDirectionsUrl = Uri.parse(targetUrlString);
    final fallbackUrl = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(query)}&travelmode=driving',
    );

    try {
      final success = await launchUrl(googleMapsDirectionsUrl, mode: LaunchMode.externalApplication);
      if (!success) {
        await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      try {
        await launchUrl(fallbackUrl, mode: LaunchMode.platformDefault);
      } catch (e) {
        debugPrint('Error launching maps: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final streetUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    final satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    return Container(
      height: 220,
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
            // Real Live FlutterMap View
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _currentCenter,
                initialZoom: _zoomLevel,
                maxZoom: 18.0,
                minZoom: 5.0,
                onTap: widget.isInteractive
                    ? (tapPos, latLng) {
                        setState(() {
                          _currentCenter = latLng;
                        });
                        widget.onLocationSelected?.call(latLng);
                      }
                    : null,
              ),
              children: [
                TileLayer(
                  urlTemplate: _isSatellite ? satelliteUrl : streetUrl,
                  userAgentPackageName: 'com.ethiopianhouserental.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentCenter,
                      width: 140,
                      height: 80,
                      alignment: Alignment.topCenter,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2))],
                              border: Border.all(color: AppColors.primary, width: 1.5),
                            ),
                            child: Text(
                              widget.neighborhood.isNotEmpty ? widget.neighborhood : widget.area,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 8, spreadRadius: 2),
                              ],
                            ),
                            child: const Icon(Icons.home_work_rounded, color: Colors.white, size: 18),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),

            // Top Bar: Map Style Switcher (Street vs Satellite)
            Positioned(
              top: 10,
              right: 10,
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _isSatellite = !_isSatellite;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.75),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: Row(
                        children: [
                          Icon(_isSatellite ? Icons.map_outlined : Icons.satellite_alt_rounded, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            _isSatellite ? 'Street View' : 'Satellite',
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Zoom Controls (+ / -)
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        InkWell(
                          onTap: () {
                            setState(() {
                              _zoomLevel = (_zoomLevel + 1).clamp(5.0, 18.0);
                            });
                            _mapController.move(_currentCenter, _zoomLevel);
                          },
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                            child: Icon(Icons.add, size: 16, color: AppColors.primary),
                          ),
                        ),
                        Container(width: 1, height: 16, color: AppColors.border),
                        InkWell(
                          onTap: () {
                            setState(() {
                              _zoomLevel = (_zoomLevel - 1).clamp(5.0, 18.0);
                            });
                            _mapController.move(_currentCenter, _zoomLevel);
                          },
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                            child: Icon(Icons.remove, size: 16, color: AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Bar: City Tag & Real Google Maps Directions Trigger
            Positioned(
              bottom: 10,
              left: 10,
              right: 10,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppColors.secondary),
                        const SizedBox(width: 4),
                        Text(
                          '${widget.city}, Ethiopia',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(100, 34),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 2,
                    ),
                    icon: const Icon(Icons.directions, size: 15),
                    label: const Text('Directions', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: _openGoogleMapsDirections,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
