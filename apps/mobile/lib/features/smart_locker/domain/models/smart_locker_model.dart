class SmartLockerModel {
  final String id;
  final String hubName;
  final int compartmentNumber;
  final String status; // 'available' | 'reserved' | 'occupied'
  final String? pickupPinCode;
  final String itemDescription;
  final DateTime expiresAt;

  SmartLockerModel({
    required this.id,
    required this.hubName,
    required this.compartmentNumber,
    required this.status,
    this.pickupPinCode,
    required this.itemDescription,
    required this.expiresAt,
  });
}
