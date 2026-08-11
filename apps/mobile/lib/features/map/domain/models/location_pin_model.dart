class LocationPinModel {
  final String id;
  final String title;
  final String category; // 'event' | 'repair' | 'fair_pickup'
  final double latitude;
  final double longitude;
  final String address;
  final String description;

  LocationPinModel({
    required this.id,
    required this.title,
    required this.category,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.description,
  });
}
