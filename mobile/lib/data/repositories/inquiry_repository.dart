import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../mock_data.dart';
import '../../shared/models/inquiry_model.dart';

abstract class InquiryRepository {
  Future<List<InquiryModel>> getSeekerInquiries(String seekerId);
  Future<List<InquiryModel>> getProviderInquiries(String providerId);
  Future<InquiryModel> sendInquiry(InquiryModel inquiry);
  Future<InquiryModel> respondToInquiry(String inquiryId, String reply, InquiryStatus newStatus);
  Future<InquiryModel> sendChatMessage(String inquiryId, String messageText, String senderId, String senderRole, String senderName);
}

class ApiInquiryRepository implements InquiryRepository {
  @override
  Future<List<InquiryModel>> getSeekerInquiries(String seekerId) async {
    try {
      final res = await ApiClient.get(ApiEndpoints.inquiries);
      if (res is List) {
        return res.map((item) => InquiryModel.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return MockInquiryRepository().getSeekerInquiries(seekerId);
  }

  @override
  Future<List<InquiryModel>> getProviderInquiries(String providerId) async {
    try {
      final res = await ApiClient.get(ApiEndpoints.providerInquiries);
      if (res is List) {
        return res.map((item) => InquiryModel.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return MockInquiryRepository().getProviderInquiries(providerId);
  }

  @override
  Future<InquiryModel> sendInquiry(InquiryModel inquiry) async {
    try {
      final res = await ApiClient.post(
        ApiEndpoints.inquiries,
        body: {
          'propertyId': inquiry.propertyId,
          'message': inquiry.message,
        },
      );
      if (res is Map<String, dynamic>) {
        return InquiryModel.fromJson(res);
      }
    } catch (_) {}
    return MockInquiryRepository().sendInquiry(inquiry);
  }

  @override
  Future<InquiryModel> respondToInquiry(String inquiryId, String reply, InquiryStatus newStatus) async {
    try {
      final res = await ApiClient.post(
        '${ApiEndpoints.inquiries}/$inquiryId/messages',
        body: {
          'message': reply,
        },
      );
      if (res is Map<String, dynamic>) {
        return InquiryModel.fromJson(res);
      }
    } catch (_) {}
    return MockInquiryRepository().respondToInquiry(inquiryId, reply, newStatus);
  }

  @override
  Future<InquiryModel> sendChatMessage(
    String inquiryId,
    String messageText,
    String senderId,
    String senderRole,
    String senderName,
  ) async {
    try {
      final res = await ApiClient.post(
        '${ApiEndpoints.inquiries}/$inquiryId/messages',
        body: {
          'message': messageText,
        },
      );
      if (res is Map<String, dynamic>) {
        return InquiryModel.fromJson(res);
      }
    } catch (_) {}
    return MockInquiryRepository().sendChatMessage(inquiryId, messageText, senderId, senderRole, senderName);
  }
}

class MockInquiryRepository implements InquiryRepository {
  final List<InquiryModel> _inquiries = List.from(MockData.mockInquiries);

  @override
  Future<List<InquiryModel>> getSeekerInquiries(String seekerId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _inquiries.where((inq) => inq.seekerId == seekerId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<List<InquiryModel>> getProviderInquiries(String providerId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _inquiries.where((inq) => inq.providerId == providerId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<InquiryModel> sendInquiry(InquiryModel inquiry) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _inquiries.insert(0, inquiry);
    return inquiry;
  }

  @override
  Future<InquiryModel> respondToInquiry(String inquiryId, String reply, InquiryStatus newStatus) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return sendChatMessage(inquiryId, reply, 'provider_id', 'provider', 'House Provider');
  }

  @override
  Future<InquiryModel> sendChatMessage(
    String inquiryId,
    String messageText,
    String senderId,
    String senderRole,
    String senderName,
  ) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _inquiries.indexWhere((inq) => inq.id == inquiryId);
    if (index != -1) {
      final currentMessages = List<ChatMessageModel>.from(_inquiries[index].messages);
      currentMessages.add(
        ChatMessageModel(
          id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
          senderId: senderId,
          senderName: senderName,
          senderRole: senderRole,
          text: messageText,
          createdAt: DateTime.now(),
        ),
      );
      final updated = _inquiries[index].copyWith(
        providerReply: senderRole == 'provider' ? messageText : _inquiries[index].providerReply,
        status: senderRole == 'provider' ? InquiryStatus.responded : _inquiries[index].status,
        messages: currentMessages,
      );
      _inquiries[index] = updated;
      return updated;
    }
    throw Exception('Inquiry not found');
  }
}
