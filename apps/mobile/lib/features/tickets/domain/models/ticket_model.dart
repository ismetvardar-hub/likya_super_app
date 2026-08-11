class TicketModel {
  final String id;
  final String eventId;
  final String userId;
  final String status;
  final String qrCode;
  final DateTime createdAt;

  TicketModel({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.status,
    required this.qrCode,
    required this.createdAt,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['id'] as String,
      eventId: json['event_id'] as String,
      userId: json['user_id'] as String,
      status: json['status'] as String? ?? 'valid',
      qrCode: json['qr_code'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'user_id': userId,
      'status': status,
      'qr_code': qrCode,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
