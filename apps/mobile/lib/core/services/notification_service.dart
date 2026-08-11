class NotificationItem {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final String type; // 'event' | 'repair' | 'fair_product'
  final bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    required this.type,
    this.isRead = false,
  });
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: 'notif-1',
      title: '🎟️ Etkinlik Hatırlatması',
      body: 'Likya Bahar Şenliği konseri bu akşam 19:00\'da başlıyor. QR biletiniz hazır!',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      type: 'event',
    ),
    NotificationItem(
      id: 'notif-2',
      title: '🛠️ Onarım Durumu Güncellendi',
      body: 'Asus Laptop cihazınız atölyede onarıldı ve teslime hazır hale geldi.',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      type: 'repair',
    ),
    NotificationItem(
      id: 'notif-3',
      title: '🌾 Yeni Adil Masa İlanı',
      body: 'İlginizi çekebilecek "Organik Toros Balı" ilanlara eklendi.',
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
      type: 'fair_product',
    ),
  ];

  Future<List<NotificationItem>> getNotifications() async {
    return List.unmodifiable(_notifications);
  }

  Future<void> sendLocalNotification({
    required String title,
    required String body,
    required String type,
  }) async {
    final notif = NotificationItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      body: body,
      timestamp: DateTime.now(),
      type: type,
    );
    _notifications.insert(0, notif);
  }
}
