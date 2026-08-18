import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../data/repositories/ai_repository.dart';
import '../../../shared/models/property_model.dart';

class AiAssistantProvider extends ChangeNotifier {
  static const String _historyStorageKey = 'ai_assistant_chat_history_v1';
  static const String _conversationStorageKey = 'ai_assistant_conversation_id_v1';

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
    _loadPersistedChatHistory();
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

  Future<void> _loadPersistedChatHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedId = prefs.getString(_conversationStorageKey);
      final rawJson = prefs.getString(_historyStorageKey);

      if (savedId != null && savedId.isNotEmpty) {
        _conversationId = savedId;
      }

      if (rawJson != null && rawJson.isNotEmpty) {
        final decoded = json.decode(rawJson);
        if (decoded is List && decoded.isNotEmpty) {
          _messages = decoded
              .map((item) => AiChatMessage.fromJson(item as Map<String, dynamic>))
              .toList();
          notifyListeners();
          return;
        }
      }
    } catch (_) {}

    _addInitialWelcomeMessage();
    notifyListeners();
  }

  Future<void> _savePersistedChatHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_conversationId != null) {
        await prefs.setString(_conversationStorageKey, _conversationId!);
      }
      final jsonList = _messages.map((m) => m.toJson()).toList();
      await prefs.setString(_historyStorageKey, json.encode(jsonList));
    } catch (_) {}
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
    _savePersistedChatHistory();

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
      _savePersistedChatHistory();
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
      _savePersistedChatHistory();
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
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_historyStorageKey);
      await prefs.remove(_conversationStorageKey);
    } catch (_) {}

    _addInitialWelcomeMessage();
    notifyListeners();
  }
}
