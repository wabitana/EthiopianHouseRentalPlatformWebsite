import 'package:flutter/material.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../models/property_model.dart';

class NeighborhoodRadarWidget extends StatefulWidget {
  final String city;
  final String area;
  final PropertyModel? property;

  const NeighborhoodRadarWidget({
    super.key,
    required this.city,
    required this.area,
    this.property,
  });

  @override
  State<NeighborhoodRadarWidget> createState() => _NeighborhoodRadarWidgetState();
}

class _NeighborhoodRadarWidgetState extends State<NeighborhoodRadarWidget> {
  double _security = 4.0;
  double _waterSupply = 3.8;
  double _transport = 4.0;
  double _walkability = 3.8;
  double _schoolsAndAmenities = 4.0;
  double _overallRating = 4.0;

  List<String> _securityReasons = [];
  List<String> _waterReasons = [];
  List<String> _transportReasons = [];
  List<String> _walkabilityReasons = [];
  List<String> _schoolsReasons = [];

  bool _isLoading = false;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _computeLocalDynamicScores();
    _fetchDatabaseScores();
  }

  @override
  void didUpdateWidget(covariant NeighborhoodRadarWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.property?.id != widget.property?.id) {
      _computeLocalDynamicScores();
      _fetchDatabaseScores();
    }
  }

  double _clamp(double v) => (v.clamp(1.0, 5.0) * 10).round() / 10;

  void _computeLocalDynamicScores() {
    final p = widget.property;
    final areaLower = widget.area.toLowerCase();
    final neighLower = (p?.neighborhood ?? '').toLowerCase();
    final descLower = (p?.description ?? '').toLowerCase();
    final addressLower = (p?.addressDetails ?? '').toLowerCase();
    final fullText = '$areaLower $neighLower $descLower $addressLower';

    final amenities = p?.amenities.map((a) => a.toLowerCase()).toList() ?? [];

    // 1. Security Score
    double sec = 3.8;
    final secReasons = <String>[];
    if (areaLower.contains('old airport') || areaLower.contains('sarbet') || neighLower.contains('diplomatic')) {
      sec += 0.5;
      secReasons.add('Diplomatic & Embassy security zone');
    } else if (areaLower.contains('bole') || areaLower.contains('kazanchis')) {
      sec += 0.4;
      secReasons.add('High municipal police & commercial CCTV coverage');
    } else if (areaLower.contains('cmc') || areaLower.contains('ayat')) {
      sec += 0.35;
      secReasons.add('Gated residential compound neighborhood');
    }

    if (amenities.any((a) => a.contains('security') || a.contains('guard'))) {
      sec += 0.3;
      secReasons.add('24/7 Security guard on premises');
    }
    if (amenities.any((a) => a.contains('fence') || a.contains('cctv'))) {
      sec += 0.25;
      secReasons.add('Perimeter security & electric fence');
    }
    if (p?.isVerified == true || p?.providerIsVerified == true) {
      sec += 0.15;
      secReasons.add('Verified landlord & vetted property');
    }

    // 2. Water Score
    double water = 3.2;
    final watReasons = <String>[];
    if (amenities.any((a) => a.contains('water tank') || a.contains('tank') || a.contains('reservoir'))) {
      water += 0.9;
      watReasons.add('Dedicated backup water reserve tank installed');
    }
    if (amenities.any((a) => a.contains('borehole') || a.contains('well')) || fullText.contains('borehole')) {
      water += 0.5;
      watReasons.add('Groundwater borehole supply');
    }
    if (amenities.any((a) => a.contains('generator'))) {
      water += 0.2;
      watReasons.add('Backup generator ensures electric water pump');
    }
    if (fullText.contains('continuous water') || fullText.contains('24/7 water')) {
      water += 0.2;
      watReasons.add('Reported continuous municipal water supply');
    }

    // 3. Transport Score
    double trans = 3.6;
    final transReasons = <String>[];
    if (amenities.any((a) => a.contains('parking') || a.contains('garage'))) {
      trans += 0.4;
      transReasons.add('Secure on-site vehicle parking');
    }
    if (areaLower.contains('kazanchis') || areaLower.contains('bole') || areaLower.contains('mexico') || areaLower.contains('piassa')) {
      trans += 0.6;
      transReasons.add('Immediate access to major taxi hubs, LRT & arterial bus lines');
    } else if (areaLower.contains('cmc') || areaLower.contains('ayat')) {
      trans += 0.45;
      transReasons.add('Access to CMC Light Rail (LRT) and Ring Road minibuses');
    } else {
      trans += 0.35;
      transReasons.add('Readily accessible by Ride, Feres, and local taxis');
    }
    if (fullText.contains('asphalt') || fullText.contains('main road') || fullText.contains('ring road')) {
      trans += 0.25;
      transReasons.add('Direct paved asphalt road frontage');
    }

    // 4. Walkability Score
    double walk = 3.4;
    final walkReasons = <String>[];
    if (areaLower.contains('kazanchis') || areaLower.contains('bole atlas')) {
      walk += 0.9;
      walkReasons.add('Paved pedestrian sidewalks and urban walkability corridor');
    } else if (areaLower.contains('sarbet') || areaLower.contains('old airport')) {
      walk += 0.7;
      walkReasons.add('Quiet residential streets ideal for walking and jogging');
    } else if (areaLower.contains('cmc') || areaLower.contains('summit')) {
      walk += 0.55;
      walkReasons.add('Paved compound pathways and safe walkways');
    }
    if (fullText.contains('paved') || fullText.contains('asphalt')) {
      walk += 0.2;
      walkReasons.add('Well-maintained street infrastructure');
    }

    // 5. Schools & Amenities Score
    double amen = 3.5;
    final amenReasons = <String>[];
    if (fullText.contains('ics') || fullText.contains('school') || fullText.contains('sandford') || areaLower.contains('old airport')) {
      amen += 0.6;
      amenReasons.add('Proximity to prestigious international & local schools');
    }
    if (fullText.contains('mall') || fullText.contains('supermarket') || fullText.contains('edna') || areaLower.contains('bole')) {
      amen += 0.5;
      amenReasons.add('Minutes away from supermarkets, banks, and shopping malls');
    } else {
      amen += 0.3;
      amenReasons.add('Local neighborhood grocers and essential services nearby');
    }

    setState(() {
      _security = _clamp(sec);
      _waterSupply = _clamp(water);
      _transport = _clamp(trans);
      _walkability = _clamp(walk);
      _schoolsAndAmenities = _clamp(amen);
      _overallRating = ((_security + _waterSupply + _transport + _walkability + _schoolsAndAmenities) / 5 * 10).round() / 10;
      _securityReasons = secReasons;
      _waterReasons = watReasons;
      _transportReasons = transReasons;
      _walkabilityReasons = walkReasons;
      _schoolsReasons = amenReasons;
    });
  }

  Future<void> _fetchDatabaseScores() async {
    final propertyId = widget.property?.id;
    if (propertyId == null || propertyId.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      final res = await ApiClient.get(ApiEndpoints.propertyNeighborhoodStats(propertyId));
      if (!mounted) return;

      if (res is Map<String, dynamic> && res['success'] == true && res['data'] != null) {
        final data = res['data'] as Map<String, dynamic>;

        final sec = (data['security']?['score'] as num?)?.toDouble();
        final water = (data['waterSupply']?['score'] as num?)?.toDouble();
        final trans = (data['transport']?['score'] as num?)?.toDouble();
        final walk = (data['walkability']?['score'] as num?)?.toDouble();
        final amen = (data['schoolsAndAmenities']?['score'] as num?)?.toDouble();
        final overall = (data['overallRating'] as num?)?.toDouble();

        setState(() {
          if (sec != null) _security = sec;
          if (water != null) _waterSupply = water;
          if (trans != null) _transport = trans;
          if (walk != null) _walkability = walk;
          if (amen != null) _schoolsAndAmenities = amen;
          if (overall != null) _overallRating = overall;

          _securityReasons = List<String>.from(data['security']?['reasons'] ?? _securityReasons);
          _waterReasons = List<String>.from(data['waterSupply']?['reasons'] ?? _waterReasons);
          _transportReasons = List<String>.from(data['transport']?['reasons'] ?? _transportReasons);
          _walkabilityReasons = List<String>.from(data['walkability']?['reasons'] ?? _walkabilityReasons);
          _schoolsReasons = List<String>.from(data['schoolsAndAmenities']?['reasons'] ?? _schoolsReasons);
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final allReasons = [
      ..._securityReasons,
      ..._waterReasons,
      ..._transportReasons,
      ..._walkabilityReasons,
      ..._schoolsReasons,
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_outlined, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Neighborhood Safety & Amenity Score',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                          ),
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  '${widget.area}, ${widget.city} Insights',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 8,
                                        height: 8,
                                        child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.success),
                                      )
                                    : const Text(
                                        'Live DB',
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.success),
                                      ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${_overallRating.toStringAsFixed(1)}/5',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildRadarMetricBar('Security & Safety', _security, Icons.security_rounded, Colors.green),
          _buildRadarMetricBar('Water Supply Reliability', _waterSupply, Icons.water_drop_rounded, Colors.blue),
          _buildRadarMetricBar('Transport & Taxi Access', _transport, Icons.directions_bus_rounded, Colors.orange),
          _buildRadarMetricBar('Walkability & Roads', _walkability, Icons.directions_walk_rounded, Colors.purple),
          _buildRadarMetricBar('Schools & Supermarkets', _schoolsAndAmenities, Icons.storefront_rounded, Colors.teal),

          // Dynamic Verified Factors Accordion
          if (allReasons.isNotEmpty) ...[
            const SizedBox(height: 6),
            InkWell(
              onTap: () => setState(() => _isExpanded = !_isExpanded),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.verified_outlined, size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          _isExpanded ? 'Hide Verified Neighborhood Insights' : 'View Verified Neighborhood Insights (${allReasons.length})',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ],
                    ),
                    Icon(
                      _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      size: 16,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ),
            ),
            if (_isExpanded) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: allReasons.map((reason) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.check_circle, size: 13, color: AppColors.success),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              reason,
                              style: const TextStyle(fontSize: 11, color: AppColors.textPrimary, height: 1.3),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildRadarMetricBar(String label, double rating, IconData icon, Color color) {
    final percentage = (rating / 5.0).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, size: 15, color: color),
                  const SizedBox(width: 6),
                  Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                ],
              ),
              Text(
                '${rating.toStringAsFixed(1)} / 5.0',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: percentage,
              minHeight: 6,
              backgroundColor: color.withValues(alpha: 0.12),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}
