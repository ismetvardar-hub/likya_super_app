class CompostBatchModel {
  final String batchId;
  final int organicWasteKg;
  final int fertilizerYieldKg;
  final double internalTempCelsius;
  final int moisturePct;
  final int daysRemaining;
  final String status; // 'fermenting' | 'ready'
  final String targetUsage;

  CompostBatchModel({
    required this.batchId,
    required this.organicWasteKg,
    required this.fertilizerYieldKg,
    required this.internalTempCelsius,
    required this.moisturePct,
    required this.daysRemaining,
    required this.status,
    required this.targetUsage,
  });
}
