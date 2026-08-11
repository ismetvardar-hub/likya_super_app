import 'package:flutter/services.dart';

class NfcCardModel {
  final String cardUid;
  final String linkedUserId;
  final String? linkedTicketId;
  final String cardType; // 'student_pass' | 'event_badge' | 'eco_wallet'
  final DateTime pairedAt;

  NfcCardModel({
    required this.cardUid,
    required this.linkedUserId,
    this.linkedTicketId,
    required this.cardType,
    required this.pairedAt,
  });
}

class NfcHapticService {
  static final NfcHapticService _instance = NfcHapticService._internal();
  factory NfcHapticService() => _instance;
  NfcHapticService._internal();

  // 1. Dokunma ve Onay Haptic Titreşimleri
  Future<void> triggerSuccessFeedback() async {
    await HapticFeedback.mediumImpact();
  }

  Future<void> triggerErrorFeedback() async {
    await HapticFeedback.heavyImpact();
  }

  Future<void> triggerSelectionFeedback() async {
    await HapticFeedback.selectionClick();
  }

  // 2. NFC Kart Eşleme & Doğrulama
  Future<NfcCardModel> pairNfcCard({
    required String cardUid,
    required String userId,
    required String cardType,
  }) async {
    await triggerSuccessFeedback();
    return NfcCardModel(
      cardUid: cardUid,
      linkedUserId: userId,
      cardType: cardType,
      pairedAt: DateTime.now(),
    );
  }
}
