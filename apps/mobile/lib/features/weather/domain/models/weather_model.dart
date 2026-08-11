class CampusWeatherModel {
  final double temperature;
  final String condition;
  final int humidity;
  final double windSpeedKmH;
  final int aqi; // Air Quality Index
  final String outdoorSuitability; // 'Mükemmel' | 'Uygun' | 'Rüzgarlı' | 'Yağış Bekleniyor'

  CampusWeatherModel({
    required this.temperature,
    required this.condition,
    required this.humidity,
    required this.windSpeedKmH,
    required this.aqi,
    required this.outdoorSuitability,
  });
}
