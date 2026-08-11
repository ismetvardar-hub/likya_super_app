class ForestTreeModel {
  final String id;
  final String treeType; // 'Zeytin' | 'Kızılçam' | 'Toros Sediri'
  final String donorName;
  final String coordinates;
  final DateTime plantingDate;
  final String certificateNumber;

  ForestTreeModel({
    required this.id,
    required this.treeType,
    required this.donorName,
    required this.coordinates,
    required this.plantingDate,
    required this.certificateNumber,
  });
}
