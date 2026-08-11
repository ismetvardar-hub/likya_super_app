class CarbonCreditModel {
  final String id;
  final String certificateHash;
  final double amountKgCO2;
  final String originActivity;
  final DateTime issuedDate;
  final String status; // 'verified' | 'retired'

  CarbonCreditModel({
    required this.id,
    required this.certificateHash,
    required this.amountKgCO2,
    required this.originActivity,
    required this.issuedDate,
    required this.status,
  });
}
