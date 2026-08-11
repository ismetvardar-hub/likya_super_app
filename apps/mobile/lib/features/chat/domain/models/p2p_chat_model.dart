class P2PMessageModel {
  final String id;
  final String senderName;
  final String text;
  final DateTime timestamp;
  final bool isMine;

  P2PMessageModel({
    required this.id,
    required this.senderName,
    required this.text,
    required this.timestamp,
    required this.isMine,
  });
}

class P2PChatRoomModel {
  final String id;
  final String participantName;
  final String itemTitle;
  final String lastMessage;
  final int unreadCount;
  final DateTime updatedAt;

  P2PChatRoomModel({
    required this.id,
    required this.participantName,
    required this.itemTitle,
    required this.lastMessage,
    required this.unreadCount,
    required this.updatedAt,
  });
}
