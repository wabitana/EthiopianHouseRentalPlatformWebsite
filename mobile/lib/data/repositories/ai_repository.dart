import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/property_model.dart';

class AiChatMessage {
  final String id;
  final String sender; // 'user' | 'ai'
  final String text;
  final List<PropertyModel> properties;
  final List<String> actions;
  final DateTime timestamp;

  AiChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    this.properties = const [],
    this.actions = const [],
    required this.timestamp,
  });
}

class AiRepository {
  Future<Map<String, dynamic>> sendChatMessage({
    required String message,
    String? conversationId,
  }) async {
    final response = await ApiClient.post(
      ApiEndpoints.aiChat,
      body: {
        'message': message,
        if (conversationId != null) 'conversationId': conversationId,
      },
    );

    final data = response as Map<String, dynamic>;

    List<PropertyModel> properties = [];
    if (data['properties'] is List) {
      properties = (data['properties'] as List)
          .map((p) => PropertyModel.fromJson(p as Map<String, dynamic>))
          .toList();
    }

    return {
      'message': data['message'] ?? 'I completed your request.',
      'properties': properties,
      'actions': List<String>.from(data['actions'] ?? []),
      'conversationId': data['conversationId'] ?? conversationId,
    };
  }

  Future<void> clearConversationHistory(String conversationId) async {
    try {
      await ApiClient.delete('${ApiEndpoints.aiChat}/$conversationId');
    } catch (_) {}
  }
}
