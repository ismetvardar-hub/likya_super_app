import 'package:flutter/services.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();

  final bool _isBiometricsAvailable = true;

  Future<bool> isBiometricsAvailable() async {
    return _isBiometricsAvailable;
  }

  Future<bool> authenticate({required String localizedReason}) async {
    // Simüle edilmiş biyometrik onaylama
    await HapticFeedback.selectionClick();
    await Future.delayed(const Duration(milliseconds: 400));
    await HapticFeedback.mediumImpact();
    return true;
  }
}
