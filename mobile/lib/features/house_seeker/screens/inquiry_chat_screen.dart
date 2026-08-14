import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/inquiry_provider.dart';
import 'property_detail_screen.dart';

class InquiryChatScreen extends StatefulWidget {
  final InquiryModel inquiry;

  const InquiryChatScreen({super.key, required this.inquiry});

  @override
  State<InquiryChatScreen> createState() => _InquiryChatScreenState();
}

class _InquiryChatScreenState extends State<InquiryChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  late InquiryModel _currentInquiry;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _currentInquiry = widget.inquiry;
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _handleSendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    final currentUser = context.read<AuthProvider>().currentUser;
    if (currentUser == null) return;

    final isSeeker = currentUser.id == _currentInquiry.seekerId;
    final senderRole = isSeeker ? 'seeker' : 'provider';

    _messageController.clear();
    setState(() {
      _isSending = true;
    });

    final updated = await context.read<InquiryProvider>().sendChatMessage(
          inquiryId: _currentInquiry.id,
          messageText: text,
          senderId: currentUser.id,
          senderRole: senderRole,
          senderName: currentUser.name,
        );

    if (mounted) {
      setState(() {
        _isSending = false;
        if (updated != null) {
          _currentInquiry = updated;
        }
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AuthProvider>().currentUser;
    final currentUserId = currentUser?.id ?? '';
    
    // Check if live inquiry updated in provider
    final liveInquiries = currentUser?.role == UserRole.provider
        ? context.watch<InquiryProvider>().providerInquiries
        : context.watch<InquiryProvider>().seekerInquiries;
    final liveMatch = liveInquiries.where((i) => i.id == _currentInquiry.id);
    if (liveMatch.isNotEmpty) {
      _currentInquiry = liveMatch.first;
    }

    final messages = _currentInquiry.messages;

    return Scaffold(
      backgroundColor: const Color(0xFFEFEAE2), // WhatsApp light beige chat background
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        titleSpacing: 0,
        title: InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => PropertyDetailScreen(propertyId: _currentInquiry.propertyId),
              ),
            );
          },
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.network(
                  Formatters.formatImageUrl(_currentInquiry.propertyImage),
                  width: 38,
                  height: 38,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      Container(width: 38, height: 38, color: Colors.white24, child: const Icon(Icons.home, color: Colors.white)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentInquiry.propertyTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${_currentInquiry.propertyArea}, ${_currentInquiry.propertyCity}',
                      style: const TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone, color: Colors.white),
            onPressed: () {
              final phone = currentUser?.id == _currentInquiry.seekerId ? _currentInquiry.seekerPhone : '+251 911 000 000';
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Calling $phone...')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Property Header Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.white,
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Inquiry for ${_currentInquiry.propertyTitle} (${Formatters.formatCurrency(_currentInquiry.propertyPrice)})',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    _currentInquiry.status.displayName,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: messages.isEmpty
                ? const Center(
                    child: Text('No messages yet. Send a message to start chatting!', style: TextStyle(color: Colors.black45)),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final msg = messages[index];
                      final isMe = msg.senderId == currentUserId ||
                          (currentUser?.role == UserRole.seeker && msg.senderRole == 'seeker') ||
                          (currentUser?.role == UserRole.provider && msg.senderRole == 'provider');

                      return _ChatBubble(
                        message: msg,
                        isMe: isMe,
                      );
                    },
                  ),
          ),

          // Chat Input Bar (WhatsApp Style)
          SafeArea(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0F2F5),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _messageController,
                        textCapitalization: TextCapitalization.sentences,
                        minLines: 1,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                        onSubmitted: (_) => _handleSendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Material(
                    color: AppColors.primary,
                    shape: const CircleBorder(),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: _handleSendMessage,
                      child: const Padding(
                        padding: EdgeInsets.all(10.0),
                        child: Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      ),
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
}

class _ChatBubble extends StatelessWidget {
  final ChatMessageModel message;
  final bool isMe;

  const _ChatBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isMe ? const Color(0xFFE7FFDB) : Colors.white;
    final alignment = isMe ? Alignment.centerRight : Alignment.centerLeft;

    return Align(
      alignment: alignment,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(isMe ? 14 : 0),
            bottomRight: Radius.circular(isMe ? 0 : 14),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  message.senderName,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
            Text(
              message.text,
              style: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.3),
            ),
            const SizedBox(height: 2),
            Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  Formatters.formatDate(message.createdAt).contains('Just')
                      ? 'Just now'
                      : '${message.createdAt.hour.toString().padLeft(2, '0')}:${message.createdAt.minute.toString().padLeft(2, '0')}',
                  style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.done_all, size: 14, color: Colors.blue),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
