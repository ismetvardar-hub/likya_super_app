import 'package:flutter/services.dart';

class AudioFeedbackService {
  static final AudioFeedbackService _instance = AudioFeedbackService._internal();
  factory AudioFeedbackService() => _instance;
  AudioFeedbackService._internal();

  bool _isSoundEnabled = true;

  bool get isSoundEnabled => _isSoundEnabled;

  void toggleSound(bool enabled) {
    _isSoundEnabled = enabled;
  }

  // 1. QR Bilet Başarılı Okutma Sesi
  Future<void> playTicketSuccessSound() async {
    if (!_isSoundEnabled) return;
    await SystemSound.play(SystemSoundType.click);
    await HapticFeedback.mediumImpact();
  }

  // 2. Likya Coin & Puan Kazanma Çanı
  Future<void> playCoinEarnChime() async {
    if (!_isSoundEnabled) return;
    await SystemSound.play(SystemSoundType.click);
    await HapticFeedback.lightImpact();
  }

  // 3. Adil Takas El Sıkışma Onay Sesi
  Future<void> playHandshakeDealSound() async {
    if (!_isSoundEnabled) return;
    await SystemSound.play(SystemSoundType.click);
    await HapticFeedback.heavyImpact();
  }

  // 4. Hata / Uyarı Sesi
  Future<void> playErrorAlertSound() async {
    if (!_isSoundEnabled) return;
    await SystemSound.play(SystemSoundType.alert);
    await HapticFeedback.heavyImpact();
  }
}
