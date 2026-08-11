class BikeStationModel {
  final String id;
  final String stationName;
  final int availableBikes;
  final int availableSlots;
  final int avgBatteryPct;
  final bool isSolarPowered;

  BikeStationModel({
    required this.id,
    required this.stationName,
    required this.availableBikes,
    required this.availableSlots,
    required this.avgBatteryPct,
    this.isSolarPowered = true,
  });
}

class ActiveRideModel {
  final String rideId;
  final String bikeCode;
  final int durationMinutes;
  final double distanceKm;
  final int caloriesBurned;
  final int ecoPointsEarned;

  ActiveRideModel({
    required this.rideId,
    required this.bikeCode,
    required this.durationMinutes,
    required this.distanceKm,
    required this.caloriesBurned,
    required this.ecoPointsEarned,
  });
}
