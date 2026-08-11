class WalletTransactionModel {
  final String id;
  final String title;
  final String type; // 'earn' veya 'spend'
  final double amount;
  final DateTime date;
  final String category;

  WalletTransactionModel({
    required this.id,
    required this.title,
    required this.type,
    required this.amount,
    required this.date,
    required this.category,
  });

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['id'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      date: DateTime.parse(json['date'] as String),
      category: json['category'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'amount': amount,
      'date': date.toIso8601String(),
      'category': category,
    };
  }
}

class WalletModel {
  final String userId;
  final double balance; // Likya Coin
  final int ecoPoints; // Ekolojik Puan
  final List<WalletTransactionModel> transactions;

  WalletModel({
    required this.userId,
    required this.balance,
    required this.ecoPoints,
    required this.transactions,
  });
}
