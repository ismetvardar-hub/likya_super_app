class RepairDonationModel {
  final String id;
  final String donorId;
  final String itemName;
  final String? description;
  final String category;
  final String repairStatus;
  final double donationAmount;
  final String? location;
  final DateTime createdAt;

  RepairDonationModel({
    required this.id,
    required this.donorId,
    required this.itemName,
    this.description,
    required this.category,
    required this.repairStatus,
    required this.donationAmount,
    this.location,
    required this.createdAt,
  });

  factory RepairDonationModel.fromJson(Map<String, dynamic> json) {
    return RepairDonationModel(
      id: json['id'] as String,
      donorId: json['donor_id'] as String,
      itemName: json['item_name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      repairStatus: json['repair_status'] as String? ?? 'pending',
      donationAmount: (json['donation_amount'] as num?)?.toDouble() ?? 0.0,
      location: json['location'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'donor_id': donorId,
      'item_name': itemName,
      'description': description,
      'category': category,
      'repair_status': repairStatus,
      'donation_amount': donationAmount,
      'location': location,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
