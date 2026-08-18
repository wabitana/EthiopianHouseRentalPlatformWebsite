import 'package:flutter/material.dart';
import '../../../data/repositories/inquiry_repository.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/models/property_model.dart';
import '../../../shared/models/user_model.dart';

import '../../../data/mock_data.dart';

class InquiryProvider extends ChangeNotifier {
  final InquiryRepository _inquiryRepository;

  List<InquiryModel> _seekerInquiries = List.from(MockData.mockInquiries);
  List<InquiryModel> _providerInquiries = List.from(MockData.mockInquiries);
  bool _isLoading = false;
  String? _errorMessage;

  InquiryProvider({InquiryRepository? inquiryRepository})
      : _inquiryRepository = inquiryRepository ?? ApiInquiryRepository() {
    _seekerInquiries = List.from(MockData.mockInquiries);
  }

  List<InquiryModel> get seekerInquiries => _seekerInquiries;
  List<InquiryModel> get providerInquiries => _providerInquiries;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  int get newProviderInquiriesCount =>
      _providerInquiries.where((inq) => inq.status == InquiryStatus.newInquiry).length;

  Future<void> fetchSeekerInquiries(String seekerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final items = await _inquiryRepository.getSeekerInquiries(seekerId);
      if (items.isNotEmpty) {
        _seekerInquiries = items;
      }
    } catch (e) {
      _errorMessage = 'Failed to load inquiries';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProviderInquiries(String providerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _providerInquiries = await _inquiryRepository.getProviderInquiries(providerId);
    } catch (e) {
      _errorMessage = 'Failed to load provider inquiries';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendInquiry({
    required PropertyModel property,
    required UserModel seeker,
    required String message,
  }) async {
    _isLoading = true;
    notifyListeners();

    final newInquiry = InquiryModel(
      id: 'inq_${DateTime.now().millisecondsSinceEpoch}',
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images.isNotEmpty ? property.images.first : '',
      propertyPrice: property.price,
      propertyCity: property.city,
      propertyArea: property.area,
      seekerId: seeker.id,
      seekerName: seeker.name,
      seekerPhone: seeker.phone,
      seekerAvatar: seeker.avatarUrl,
      providerId: property.providerId,
      message: message,
      messages: [
        ChatMessageModel(
          id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
          senderId: seeker.id,
          senderName: seeker.name,
          senderRole: 'seeker',
          text: message,
          createdAt: DateTime.now(),
        ),
      ],
    );

    try {
      final created = await _inquiryRepository.sendInquiry(newInquiry);
      _seekerInquiries.insert(0, created);
      _providerInquiries.insert(0, created);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to send inquiry';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> respondToInquiry(String inquiryId, String reply, InquiryStatus status) async {
    final updated = await _inquiryRepository.respondToInquiry(inquiryId, reply, status);
    
    final sIndex = _seekerInquiries.indexWhere((inq) => inq.id == inquiryId);
    if (sIndex != -1) _seekerInquiries[sIndex] = updated;

    final pIndex = _providerInquiries.indexWhere((inq) => inq.id == inquiryId);
    if (pIndex != -1) _providerInquiries[pIndex] = updated;

    notifyListeners();
  }

  Future<InquiryModel?> sendChatMessage({
    required String inquiryId,
    required String messageText,
    required String senderId,
    required String senderRole,
    required String senderName,
  }) async {
    try {
      final updated = await _inquiryRepository.sendChatMessage(
        inquiryId,
        messageText,
        senderId,
        senderRole,
        senderName,
      );

      final sIndex = _seekerInquiries.indexWhere((inq) => inq.id == inquiryId);
      if (sIndex != -1) _seekerInquiries[sIndex] = updated;

      final pIndex = _providerInquiries.indexWhere((inq) => inq.id == inquiryId);
      if (pIndex != -1) _providerInquiries[pIndex] = updated;

      notifyListeners();
      return updated;
    } catch (e) {
      _errorMessage = 'Failed to send chat message';
      notifyListeners();
      return null;
    }
  }
}
