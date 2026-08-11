import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/p2p_chat_model.dart';

class DirectChatScreen extends StatefulWidget {
  final P2PChatRoomModel room;

  const DirectChatScreen({super.key, required this.room});

  @override
  State<DirectChatScreen> createState() => _DirectChatScreenState();
}

class _DirectChatScreenState extends State<DirectChatScreen> {
  final _textController = TextEditingController();

  final List<P2PMessageModel> _messages = [
    P2PMessageModel(
      id: '1',
      senderName: 'Mert',
      text: 'Selamlar! İlanınızdaki zeytinyağı için takas düşünür müsünüz?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
      isMine: false,
    ),
    P2PMessageModel(
      id: '2',
      senderName: 'Ben',
      text: 'Merhaba Mert Bey. Tabii ki, elinizdeki ürün nedir?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 20)),
      isMine: true,
    ),
    P2PMessageModel(
      id: '3',
      senderName: 'Mert',
      text: 'El yapımı seramik kupa veya 1 kg dağ balı ile takas yapabiliriz. Yarın kampüs yaşam merkezinde buluşalım mı?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
      isMine: false,
    ),
  ];

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        P2PMessageModel(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          senderName: 'Ben',
          text: text,
          timestamp: DateTime.now(),
          isMine: true,
        ),
      );
    });
    _textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.room.participantName, style: const TextStyle(fontSize: 16)),
            Text(
              'İlan: ${widget.room.itemTitle}',
              style: const TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Takas Teklifi Hızlı Aksiyon Barı
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppTheme.accentColor.withValues(alpha: 0.15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.handshake, color: AppTheme.primaryColor, size: 20),
                    SizedBox(width: 8),
                    Text('Adil Takas Teklifi Gönder', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Takas anlaşması teklifi gönderildi 🤝')),
                    );
                  },
                  child: const Text('Teklif Ver'),
                ),
              ],
            ),
          ),

          // Mesajlaşma Akışı
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Align(
                  alignment: msg.isMine ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: msg.isMine ? AppTheme.primaryColor : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment:
                          msg.isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg.text,
                          style: TextStyle(
                            color: msg.isMine ? Colors.white : AppTheme.textDark,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                          style: TextStyle(
                            color: msg.isMine ? Colors.white70 : AppTheme.textMuted,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Mesaj Yazma Alanı
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2)),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: const InputDecoration(
                        hintText: 'Mesajınızı yazınız...',
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send),
                    style: IconButton.styleFrom(backgroundColor: AppTheme.primaryColor),
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
