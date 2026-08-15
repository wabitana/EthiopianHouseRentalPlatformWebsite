import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/ai_repository.dart';
import '../../../shared/widgets/property_card.dart';
import '../../house_seeker/screens/property_detail_screen.dart';
import '../providers/ai_assistant_provider.dart';

class AiAssistantScreen extends StatefulWidget {
  final String? initialPrompt;

  const AiAssistantScreen({super.key, this.initialPrompt});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _quickPrompts = [
    'Find 2 bedrooms in Bole under 25,000 ETB',
    'በቦሌ 25000 ብር በታች 2 መኝታ ቤት ፈልግልኝ',
    '📜 Draft Amharic Lease Agreement (የሕግ የቤት ኪራይ ውል)',
    '🚕 Calculate commute time to Kazanchis',
    '💧 Check water & power reliability in Bole',
    '👥 Calculate roommate bill split',
    '📊 Is this price fair market value?',
    '🛡️ Run 5-point scam safety audit',
    '📢 Write Amharic listing copy for landlord',
    '🔔 Set price drop alert for Bole',
    '💡 Estimate monthly water & electric bill',
    'Show my saved houses',
    'What should I check before renting?',
    'How are my house listings doing?',
    'Compare houses under 30,000 ETB',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialPrompt != null && widget.initialPrompt!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<AiAssistantProvider>().sendMessage(widget.initialPrompt!);
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleSend() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _textController.clear();
    context.read<AiAssistantProvider>().sendMessage(text);
    _scrollToBottom();
  }

  void _handleQuickPrompt(String prompt) {
    context.read<AiAssistantProvider>().sendMessage(prompt);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final aiProvider = context.watch<AiAssistantProvider>();
    final messages = aiProvider.messages;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.auto_awesome_rounded, color: Colors.amberAccent, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Housing Assistant', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Real DB Search & Recommendations', style: TextStyle(fontSize: 10, color: Colors.white70)),
              ],
            ),
          ],
        ),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            tooltip: 'Clear Chat History',
            onPressed: () {
              aiProvider.clearChat();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick Action Prompt Chips Bar
          Container(
            height: 48,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _quickPrompts.length,
              itemBuilder: (context, index) {
                final prompt = _quickPrompts[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ActionChip(
                    backgroundColor: AppColors.background,
                    side: const BorderSide(color: AppColors.border),
                    avatar: const Icon(Icons.bolt_rounded, size: 14, color: AppColors.primary),
                    label: Text(prompt, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary)),
                    onPressed: aiProvider.isLoading ? null : () => _handleQuickPrompt(prompt),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Message Trajectory List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: messages.length + (aiProvider.isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == messages.length && aiProvider.isLoading) {
                  return _buildLoadingBubble();
                }

                final msg = messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 6,
                  offset: Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: InputDecoration(
                        hintText: 'Ask AI e.g. "Find 2 bedrooms in Bole under 25k"...',
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                        filled: true,
                        fillColor: const Color(0xFFF0F3F6),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primary,
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: aiProvider.isLoading ? null : _handleSend,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(AiChatMessage msg) {
    final isUser = msg.sender == 'user';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!isUser) ...[
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 18),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isUser ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
                      bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
                    ),
                    boxShadow: isUser
                        ? []
                        : [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                  ),
                  child: SelectableText(
                    _cleanMarkdownText(msg.text),
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.4,
                      color: isUser ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
              if (isUser) ...[
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.secondary,
                  child: const Icon(Icons.person, color: Colors.white, size: 18),
                ),
              ],
            ],
          ),

          // Render Real Property Cards if included in AI response
          if (msg.properties.isNotEmpty) ...[
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.only(left: 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.home_work_rounded, size: 16, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(
                        'Matched Real Properties (${msg.properties.length}):',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 340,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: msg.properties.length,
                      itemBuilder: (context, pIndex) {
                        final property = msg.properties[pIndex];
                        return Container(
                          width: 290,
                          margin: const EdgeInsets.only(right: 12),
                          child: PropertyCard(
                            property: property,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PropertyDetailScreen(propertyId: property.id),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _cleanMarkdownText(String rawText) {
    if (rawText.isEmpty) return rawText;
    // Remove markdown image tags like ![Image 1](url)
    String cleaned = rawText.replaceAll(RegExp(r'!\[.*?\]\(.*?\)', caseSensitive: false), '');
    // Remove markdown bold asterisks **
    cleaned = cleaned.replaceAll('**', '');
    // Remove extra consecutive blank lines
    cleaned = cleaned.replaceAll(RegExp(r'\n{3,}'), '\n\n');
    return cleaned.trim();
  }

  Widget _buildLoadingBubble() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                ),
                SizedBox(width: 10),
                Text('Searching real platform database...', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
