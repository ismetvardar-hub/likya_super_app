class EventModel {
  final String id;
  final String organizerId;
  final String title;
  final String? description;
  final String location;
  final DateTime startTime;
  final DateTime endTime;
  final int totalCapacity;
  final int availableCapacity;
  final double ticketPrice;
  final String status;
  final DateTime createdAt;

  EventModel({
    required this.id,
    required this.organizerId,
    required this.title,
    this.description,
    required this.location,
    required this.startTime,
    required this.endTime,
    required this.totalCapacity,
    required this.availableCapacity,
    required this.ticketPrice,
    required this.status,
    required this.createdAt,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] as String,
      organizerId: json['organizer_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      location: json['location'] as String,
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      totalCapacity: json['total_capacity'] as int,
      availableCapacity: json['available_capacity'] as int,
      ticketPrice: (json['ticket_price'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'published',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'organizer_id': organizerId,
      'title': title,
      'description': description,
      'location': location,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'total_capacity': totalCapacity,
      'available_capacity': availableCapacity,
      'ticket_price': ticketPrice,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
