import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/maintenance_model.dart';

abstract class MaintenanceRepository {
  Future<List<MaintenanceRequestModel>> getMyTickets();
  Future<List<MaintenanceRequestModel>> getProviderTickets();
  Future<MaintenanceRequestModel> createTicket({
    required String title,
    required String description,
    required String providerId,
    String? category,
    String? propertyId,
    String? propertyTitle,
  });
  Future<MaintenanceRequestModel> updateTicketStatus({
    required String ticketId,
    required MaintenanceStatus status,
    String? providerNotes,
  });
}

class ApiMaintenanceRepository implements MaintenanceRepository {
  @override
  Future<List<MaintenanceRequestModel>> getMyTickets() async {
    try {
      final res = await ApiClient.get(ApiEndpoints.maintenanceMyTickets);
      if (res is List) {
        return res
            .map((item) => MaintenanceRequestModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  @override
  Future<List<MaintenanceRequestModel>> getProviderTickets() async {
    try {
      final res = await ApiClient.get(ApiEndpoints.maintenanceProviderTickets);
      if (res is List) {
        return res
            .map((item) => MaintenanceRequestModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  @override
  Future<MaintenanceRequestModel> createTicket({
    required String title,
    required String description,
    required String providerId,
    String? category,
    String? propertyId,
    String? propertyTitle,
  }) async {
    final res = await ApiClient.post(
      ApiEndpoints.maintenance,
      body: {
        'title': title,
        'description': description,
        'providerId': providerId,
        'category': category ?? 'General',
        'propertyId': propertyId,
        'propertyTitle': propertyTitle,
      },
    );

    if (res is Map<String, dynamic>) {
      return MaintenanceRequestModel.fromJson(res);
    }
    throw ApiException('Failed to create maintenance ticket on server');
  }

  @override
  Future<MaintenanceRequestModel> updateTicketStatus({
    required String ticketId,
    required MaintenanceStatus status,
    String? providerNotes,
  }) async {
    final res = await ApiClient.patch(
      ApiEndpoints.maintenanceStatus(ticketId),
      body: {
        'status': status.apiCode,
        if (providerNotes != null && providerNotes.isNotEmpty) 'providerNotes': providerNotes,
      },
    );

    if (res is Map<String, dynamic>) {
      return MaintenanceRequestModel.fromJson(res);
    }
    throw ApiException('Failed to update ticket status on server');
  }
}
