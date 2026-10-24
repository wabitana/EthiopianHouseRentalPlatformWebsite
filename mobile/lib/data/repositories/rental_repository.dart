import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';

abstract class RentalRepository {
  Future<Map<String, dynamic>> scheduleTourVisit({
    required String propertyId,
    required DateTime visitDate,
    required String timeSlot,
    required String tourType,
    String? notes,
    String? seekerName,
    String? seekerPhone,
  });

  Future<Map<String, dynamic>> createContractProposal({
    required String propertyId,
    required int durationMonths,
    required int advanceMonths,
    required double depositAmount,
    required double monthlyRent,
    required DateTime startDate,
    required String tenantName,
    required String tenantPhone,
    String language = 'am',
    String? notes,
  });

  Future<List<dynamic>> getUserVisits();
}

class ApiRentalRepository implements RentalRepository {
  @override
  Future<Map<String, dynamic>> scheduleTourVisit({
    required String propertyId,
    required DateTime visitDate,
    required String timeSlot,
    required String tourType,
    String? notes,
    String? seekerName,
    String? seekerPhone,
  }) async {
    final response = await ApiClient.post(
      ApiEndpoints.scheduleVisit,
      body: {
        'propertyId': propertyId,
        'visitDate': visitDate.toIso8601String(),
        'timeSlot': timeSlot,
        'tourType': tourType,
        'notes': notes ?? '',
        'seekerName': seekerName,
        'seekerPhone': seekerPhone,
      },
    );

    if (response is Map<String, dynamic>) {
      return response;
    }
    return {'success': true, 'data': response};
  }

  @override
  Future<Map<String, dynamic>> createContractProposal({
    required String propertyId,
    required int durationMonths,
    required int advanceMonths,
    required double depositAmount,
    required double monthlyRent,
    required DateTime startDate,
    required String tenantName,
    required String tenantPhone,
    String language = 'am',
    String? notes,
  }) async {
    final response = await ApiClient.post(
      ApiEndpoints.digitalContract,
      body: {
        'propertyId': propertyId,
        'durationMonths': durationMonths,
        'advanceMonths': advanceMonths,
        'depositAmount': depositAmount,
        'monthlyRent': monthlyRent,
        'startDate': startDate.toIso8601String(),
        'tenantName': tenantName,
        'tenantPhone': tenantPhone,
        'language': language,
        'notes': notes ?? '',
      },
    );

    if (response is Map<String, dynamic>) {
      return response;
    }
    return {'success': true, 'data': response};
  }

  @override
  Future<List<dynamic>> getUserVisits() async {
    try {
      final response = await ApiClient.get(ApiEndpoints.userVisits);
      if (response is List) {
        return response;
      }
    } catch (_) {}
    return [];
  }
}
