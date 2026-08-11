import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/p2p_chat_model.dart';
import 'direct_chat_screen.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleRooms = [
      P2PChatRoomModel(
        id: 'room-1',
        participantName: 'Mert (Adil Üretici)',
        itemTitle: 'Organik Zeytinyağı 1L',
        lastMessage: 'Yarın kampüs yaşam merkezinde takas edebiliriz.',
        unreadCount: 1,
        updatedAt: DateTime.now().subtract(const Duration(minutes: 15)),
      ),
      P2PChatRoomModel(
        id: 'room-2',
        participantName: 'Kemal Usta (Onarım Atölyesi)',
        itemTitle: 'Asus Laptop Batarya Değişimi',
        lastMessage: 'Cihazınızın testi tamamlandı, alabilirsiniz.',
        unreadCount: 0,
        updatedAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mesajlarım & Takas Sohbetleri'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: sampleRooms.length,
        itemBuilder: (context, index) {
          final room = sampleRooms[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => DirectChatScreen(room: room),
                  ),
                );
              },
              leading: CircleAvatar(
                backgroundColor: AppTheme.primaryLight,
                child: Text(
                  room.participantName[0],
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(room.participantName,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(
                    '${room.updatedAt.hour}:${room.updatedAt.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(
                        fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 2),
                  Text('İlgili İlan: ${room.itemTitle}',
                      style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(room.lastMessage,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13)),
                ],
              ),
              trailing: room.unreadCount > 0
                  ? CircleAvatar(
                      radius: 10,
                      backgroundColor: AppTheme.secondaryColor,
                      child: Text(
                        room.unreadCount.toString(),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold),
                      ),
                    )
                  : null,
            ),
          );
        },
      ),
    );
  }
}
