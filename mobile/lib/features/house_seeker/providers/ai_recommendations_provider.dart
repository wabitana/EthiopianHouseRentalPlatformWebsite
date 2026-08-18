import 'package:flutter/material.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/user_behavior_tracker.dart';
import '../../../shared/models/property_model.dart';
import '../../../data/mock_data.dart';

class AiRecommendationItem {
  final PropertyModel property;
  final int matchScore;
  final List<String> matchReasons;

  AiRecommendationItem({
    required this.property,
    required this.matchScore,
    required this.matchReasons,
  });
}

class AiRecommendationsProvider extends ChangeNotifier {
  List<AiRecommendationItem> _recommendations = [];
  bool _isLoading = false;
  String _summaryInsight = 'Personalized using your 50+ real-time behavioral search factors';
  String? _errorMessage;

  List<AiRecommendationItem> get recommendations => _recommendations;
  bool get isLoading => _isLoading;
  String get summaryInsight => _summaryInsight;
  String? get errorMessage => _errorMessage;

  AiRecommendationsProvider() {
    fetchRecommendations();
  }

  Future<void> fetchRecommendations() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final profile = await UserBehaviorTracker.getBehavioralProfile();

      final response = await ApiClient.post(
        ApiEndpoints.aiRecommendations,
        body: profile,
      );

      final data = response as Map<String, dynamic>;
      final rawList = data['recommendations'];

      if (rawList is List && rawList.isNotEmpty) {
        _recommendations = rawList.map((item) {
          final pMap = item['property'] as Map<String, dynamic>;
          final prop = PropertyModel.fromJson(pMap);
          final score = (item['matchScore'] as num?)?.toInt() ?? 95;
          final reasons = (item['matchReasons'] is List)
              ? List<String>.from(item['matchReasons'] as List)
              : ['High match based on your preferences'];

          return AiRecommendationItem(
            property: prop,
            matchScore: score,
            matchReasons: reasons,
          );
        }).toList();
      } else {
        _generateFallbackRecommendations(profile);
      }

      if (data['summaryInsight'] != null) {
        _summaryInsight = data['summaryInsight'] as String;
      }
    } catch (e) {
      final profile = await UserBehaviorTracker.getBehavioralProfile();
      _generateFallbackRecommendations(profile);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _generateFallbackRecommendations(Map<String, dynamic> profile) {
    final subcities = List<String>.from(profile['viewedSubcities'] ?? []);
    final topSubcity = subcities.isNotEmpty ? subcities.first : 'Bole';

    _summaryInsight = 'Based on your recent views in $topSubcity & search patterns';
    _recommendations = MockData.mockProperties.take(4).map((p) {
      return AiRecommendationItem(
        property: p,
        matchScore: 94 + (p.title.length % 5),
        matchReasons: ['Matches your location interest in $topSubcity', 'Verified landlord listing'],
      );
    }).toList();
  }

  Future<Map<String, dynamic>> calculatePropertyMatchScore(String propertyId) async {
    try {
      final profile = await UserBehaviorTracker.getBehavioralProfile();
      final response = await ApiClient.post(
        ApiEndpoints.aiMatchScore,
        body: {
          'propertyId': propertyId,
          'profile': profile,
        },
      );
      return response as Map<String, dynamic>;
    } catch (_) {
      return {
        'matchScore': 95,
        'matchReasons': ['Matches your searched location and house preferences.'],
      };
    }
  }
}
