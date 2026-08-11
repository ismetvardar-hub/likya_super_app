import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/chat_message_model.dart';
import '../../data/services/ai_assistant_service.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {
  final _textController = TextEditingController();
  final _service = AIAssistantService();
  bool _isTyping = false;

  final List<ChatMessageModel> _messages = [
    ChatMessageModel(
      id: 'welcome',
      text: 'Merhaba! Ben Likya Otonom Asistanı 🤖\nKampüs etkinlikleri, adil takas fırsatları veya eşya onarımı konusunda size nasıl yardımcı olabilirim?',
      isUser: false,
      timestamp: DateTime.now(),
      suggestedActions: ['Konser Biletleri Nerede?', 'Laptopum Bozuldu', 'Adil Masa Nedir?'],
    ),
  ];

  void _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isTyping = true;
    });
    _textController.clear();

    final response = await _service.processQuery(text);

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add(response);
      });
    }
  }

  void _handleAction(String action) {
    if (action.contains('Bilet') || action.contains('Etkinlik')) {
      context.go('/events');
    } else if (action.contains('Onarım') || action.contains('Bozuk')) {
      context.push('/repair-donations/create');
    } else if (action.contains('Pazar') || action.contains('Adil')) {
      context.go('/fair-products');
    } else {
      _sendMessage(action);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.auto_awesome, color: AppTheme.warningColor),
            SizedBox(width: 8),
            Text('Likya AI Asistan'),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    crossAxisAlignment:
                        msg.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment:
                            msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (!msg.isUser) ...[
                            const CircleAvatar(
                              backgroundColor: AppTheme.primaryColor,
                              radius: 16,
                              child: Icon(Icons.psychology, size: 18, color: Colors.white),
                            ),
                            const SizedBox(width: 8),
                          ],
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: msg.isUser
                                    ? AppTheme.primaryColor
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Text(
                                msg.text,
                                style: TextStyle(
                                  color: msg.isUser ? Colors.white : AppTheme.textDark,
                                  fontSize: 14,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ),
                          if (msg.isUser) ...[
                            const SizedBox(width: 8),
                            const CircleAvatar(
                              backgroundColor: AppTheme.secondaryColor,
                              radius: 16,
                              child: Icon(Icons.person, size: 18, color: Colors.white),
                            ),
                          ],
                        ],
                      ),
                      if (msg.suggestedActions != null && msg.suggestedActions!.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: msg.suggestedActions!.map((action) {
                            return ActionChip(
                              label: Text(action, style: const TextStyle(fontSize: 12)),
                              backgroundColor: AppTheme.primaryColor.withOpacity(0.08),
                              labelStyle: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                              onPressed: () => _handleAction(action),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
          if (_isTyping)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  SizedBox(width: 10),
                  Text('Likya AI düşünüyor...', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: const InputDecoration(
                        hintText: 'Bir şey sorun (örn: konser, bozuk laptop)...',
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: () => _sendMessage(_textController.text),
                    icon: const Icon(Icons.send_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
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
