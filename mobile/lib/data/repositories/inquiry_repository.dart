import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../mock_data.dart';
import '../../shared/models/inquiry_model.dart';

abstract class InquiryRepository {
  Future<List<InquiryModel>> getSeekerInquiries(String seekerId);
  Future<List<InquiryModel>> getProviderInquiries(String providerId);
  Future<InquiryModel> sendInquiry(InquiryModel inquiry);
  Future<InquiryModel> respondToInquiry(String inquiryId, String reply, InquiryStatus newStatus);
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
      final res = await ApiClient.patch(
        ApiEndpoints.inquiryDetail(inquiryId),
        body: {
          'response': reply,
          'status': newStatus.code,
        },
      );
      if (res is Map<String, dynamic>) {
        return InquiryModel.fromJson(res);
      }
    } catch (_) {}
    return MockInquiryRepository().respondToInquiry(inquiryId, reply, newStatus);
  }
}

class MockInquiryRepository implements InquiryRepository {
  final List<InquiryModel> _inquiries = List.from(MockData.mockInquiries);

  @override
  Future<List<InquiryModel>> getSeekerInquiries(String seekerId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _inquiries.where((inq) => inq.seekerId == seekerId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<List<InquiryModel>> getProviderInquiries(String providerId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _inquiries.where((inq) => inq.providerId == providerId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<InquiryModel> sendInquiry(InquiryModel inquiry) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _inquiries.insert(0, inquiry);
    return inquiry;
  }

  @override
  Future<InquiryModel> respondToInquiry(String inquiryId, String reply, InquiryStatus newStatus) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final index = _inquiries.indexWhere((inq) => inq.id == inquiryId);
    if (index != -1) {
      final updated = _inquiries[index].copyWith(
        providerReply: reply,
        status: newStatus,
      );
      _inquiries[index] = updated;
      return updated;
    }
    throw Exception('Inquiry not found');
  }
}
