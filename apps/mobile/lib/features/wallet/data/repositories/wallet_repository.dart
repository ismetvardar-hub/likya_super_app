import 'package:likya_mobile/features/wallet/domain/models/wallet_model.dart';

class WalletRepository {
  Future<WalletModel> getUserWallet(String userId) async {
    await Future.delayed(const Duration(milliseconds: 300));

    return WalletModel(
      userId: userId,
      balance: 340.50,
      ecoPoints: 1250,
      transactions: [
        WalletTransactionModel(
          id: 'TX-101',
          title: 'Laptop Onarım Ödülü',
          type: 'earn',
          amount: 50.0,
          date: DateTime.now().subtract(const Duration(days: 1)),
          category: 'Onarım & Dönüşüm',
        ),
        WalletTransactionModel(
          id: 'TX-102',
          title: 'Organik Zeytinyağı Alımı',
          type: 'spend',
          amount: 180.0,
          date: DateTime.now().subtract(const Duration(days: 3)),
          category: 'Adil Masa',
        ),
        WalletTransactionModel(
          id: 'TX-103',
          title: 'Eski Kitap Bağışı',
          type: 'earn',
          amount: 25.0,
          date: DateTime.now().subtract(const Duration(days: 5)),
          category: 'Bağış',
        ),
      ],
    );
  }

  Future<bool> transferCoins({
    required String recipientId,
    required double amount,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return true;
  }
}
