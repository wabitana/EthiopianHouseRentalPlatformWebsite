import 'package:flutter/material.dart';
import '../../../data/repositories/maintenance_repository.dart';
import '../../../shared/models/maintenance_model.dart';

class MaintenanceProvider extends ChangeNotifier {
  final MaintenanceRepository _repository;

  List<MaintenanceRequestModel> _tenantTickets = [];
  List<MaintenanceRequestModel> _providerTickets = [];
  bool _isLoading = false;
  String? _errorMessage;

  MaintenanceProvider({MaintenanceRepository? repository})
      : _repository = repository ?? ApiMaintenanceRepository();

  List<MaintenanceRequestModel> get tenantTickets => _tenantTickets;
  List<MaintenanceRequestModel> get providerTickets => _providerTickets;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get pendingProviderTicketsCount =>
      _providerTickets.where((t) => t.status == MaintenanceStatus.pending).length;

  int get inProgressProviderTicketsCount =>
      _providerTickets.where((t) => t.status == MaintenanceStatus.inProgress).length;

  Future<void> fetchMyTickets() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _tenantTickets = await _repository.getMyTickets();
    } catch (e) {
      _errorMessage = 'Failed to load maintenance tickets: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProviderTickets() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _providerTickets = await _repository.getProviderTickets();
    } catch (e) {
      _errorMessage = 'Failed to load provider tickets: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<MaintenanceRequestModel?> createTicket({
    required String title,
    required String description,
    required String providerId,
    String? category,
    String? propertyId,
    String? propertyTitle,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final ticket = await _repository.createTicket(
        title: title,
        description: description,
        providerId: providerId,
        category: category,
        propertyId: propertyId,
        propertyTitle: propertyTitle,
      );

      _tenantTickets.insert(0, ticket);
      return ticket;
    } catch (e) {
      _errorMessage = 'Failed to submit repair request: $e';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateTicketStatus({
    required String ticketId,
    required MaintenanceStatus status,
    String? providerNotes,
  }) async {
    try {
      final updated = await _repository.updateTicketStatus(
        ticketId: ticketId,
        status: status,
        providerNotes: providerNotes,
      );

      // Update in providerTickets
      final idx = _providerTickets.indexWhere((t) => t.id == ticketId);
      if (idx != -1) {
        _providerTickets[idx] = updated;
      }

      // Also update in tenantTickets if present (dual role)
      final tIdx = _tenantTickets.indexWhere((t) => t.id == ticketId);
      if (tIdx != -1) {
        _tenantTickets[tIdx] = updated;
      }

      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to update ticket: $e';
      notifyListeners();
      return false;
    }
  }
}
