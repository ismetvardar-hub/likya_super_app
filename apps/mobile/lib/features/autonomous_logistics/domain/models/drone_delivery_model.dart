class AutonomousDeliveryModel {
  final String id;
  final String trackingCode;
  final String vehicleType; // 'Otonom Kara Roverı 🤖' | 'Elektrikli Kargo Dronu 🛸'
  final String originStation;
  final String destinationHub;
  final int etaMinutes;
  final String status; // 'in_transit' | 'landed' | 'delivered'
  final String payloadDescription;
  final double batteryPct;

  AutonomousDeliveryModel({
    required this.id,
    required this.trackingCode,
    required this.vehicleType,
    required this.originStation,
    required this.destinationHub,
    required this.etaMinutes,
    required this.status,
    required this.payloadDescription,
    required this.batteryPct,
  });
}
