import 'package:flutter/material.dart';
import '../../../data/repositories/ai_repository.dart';
import '../../../shared/models/property_model.dart';

class AiAssistantProvider extends ChangeNotifier {
  final AiRepository _aiRepository;

  List<AiChatMessage> _messages = [];
  bool _isLoading = false;
  String? _conversationId;
  String? _errorMessage;

  List<AiChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get conversationId => _conversationId;
  String? get errorMessage => _errorMessage;

  AiAssistantProvider({AiRepository? aiRepository})
      : _aiRepository = aiRepository ?? AiRepository() {
    _addInitialWelcomeMessage();
  }

  void _addInitialWelcomeMessage() {
    _messages = [
      AiChatMessage(
        id: 'welcome-msg',
        sender: 'ai',
        text: 'Selam! I am your AI Housing Assistant for Ethiopian House Rental. 🏠🇪🇹\n\nAsk me to search real available houses in Addis Ababa or any city, compare properties, check lease rules, or summarize your listings!',
        timestamp: DateTime.now(),
      ),
    ];
  }

  Future<void> sendMessage(String text) async {
    final trimmedText = text.trim();
    if (trimmedText.isEmpty) return;

    _errorMessage = null;

    final userMsg = AiChatMessage(
      id: 'user-${DateTime.now().millisecondsSinceEpoch}',
      sender: 'user',
      text: trimmedText,
      timestamp: DateTime.now(),
    );
    _messages.add(userMsg);
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _aiRepository.sendChatMessage(
        message: trimmedText,
        conversationId: _conversationId,
      );

      _conversationId = response['conversationId'] as String?;

      final rawProps = response['properties'];
      final List<PropertyModel> propsList = (rawProps is List)
          ? rawProps.whereType<PropertyModel>().toList()
          : [];

      final rawActions = response['actions'];
      final List<String> actionsList = (rawActions is List)
          ? rawActions.whereType<String>().toList()
          : [];

      final aiMsg = AiChatMessage(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        sender: 'ai',
        text: response['message'] as String,
        properties: propsList,
        actions: actionsList,
        timestamp: DateTime.now(),
      );

      _messages.add(aiMsg);
    } catch (e) {
      _errorMessage = 'Failed to connect to AI server. Please check your internet connection and try again.';
      _messages.add(
        AiChatMessage(
          id: 'error-${DateTime.now().millisecondsSinceEpoch}',
          sender: 'ai',
          text: 'Sorry, I had trouble reaching our backend housing database. Please tap retry or ask again.',
          timestamp: DateTime.now(),
        ),
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> clearChat() async {
    if (_conversationId != null) {
      await _aiRepository.clearConversationHistory(_conversationId!);
    }
    _conversationId = null;
    _addInitialWelcomeMessage();
    notifyListeners();
  }
}
