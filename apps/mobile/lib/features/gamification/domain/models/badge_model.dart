class BadgeModel {
  final String id;
  final String title;
  final String description;
  final String icon;
  final bool isUnlocked;
  final DateTime? unlockedDate;

  BadgeModel({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.isUnlocked,
    this.unlockedDate,
  });
}

class LeaderboardUserModel {
  final int rank;
  final String name;
  final String department;
  final int ecoScore;
  final int repairedCount;
  final int fairTradesCount;

  LeaderboardUserModel({
    required this.rank,
    required this.name,
    required this.department,
    required this.ecoScore,
    required this.repairedCount,
    required this.fairTradesCount,
  });
}
