class AudioTrackModel {
  final String id;
  final String title;
  final String locationName;
  final int durationMinutes;
  final String narrativeSummary;
  final String narrator;

  AudioTrackModel({
    required this.id,
    required this.title,
    required this.locationName,
    required this.durationMinutes,
    required this.narrativeSummary,
    this.narrator = 'Likya Kültür Elçisi & AI Rehber',
  });
}
