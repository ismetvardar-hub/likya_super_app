class WaterStationModel {
  final String id;
  final String stationName;
  final double temperatureCelsius;
  final double phLevel;
  final int filterPurityPct;
  final int totalLitresDispensed;
  final int bottlesSaved;

  WaterStationModel({
    required this.id,
    required this.stationName,
    required this.temperatureCelsius,
    required this.phLevel,
    required this.filterPurityPct,
    required this.totalLitresDispensed,
    required this.bottlesSaved,
  });
}
