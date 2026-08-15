import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_theme.dart';

class RollingQrWidget extends StatefulWidget {
  final String baseTicketId;

  const RollingQrWidget({super.key, required this.baseTicketId});

  @override
  State<RollingQrWidget> createState() => _RollingQrWidgetState();
}

class _RollingQrWidgetState extends State<RollingQrWidget> {
  int _secondsRemaining = 15;
  late Timer _timer;
  late String _currentDynamicPayload;

  @override
  void initState() {
    super.initState();
    _refreshPayload();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        _refreshPayload();
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _refreshPayload() {
    final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 15000;
    setState(() {
      _secondsRemaining = 15;
      _currentDynamicPayload = '${widget.baseTicketId}-TOTP-$timestamp';
    });
  }

  @override
  Widget build(BuildContext context) {
    final double progress = _secondsRemaining / 15.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield_outlined, color: AppTheme.successColor, size: 18),
              SizedBox(width: 6),
              Text(
                'Dinamik Güvenlikli QR (Sahtecilik Önleyici)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryColor),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Dinamik QR Kod
          QrImageView(
            data: _currentDynamicPayload,
            version: QrVersions.auto,
            size: 180.0,
            backgroundColor: Colors.white,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primaryColor),
          ),
          const SizedBox(height: 14),

          // Geri Sayım İlerleme Çubuğu
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey.shade200,
              color: AppTheme.primaryColor,
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('$_secondsRemaining sn sonra yenilenecek', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              const Text('Ekran Görüntüsü Geçersizdir 🚫', style: TextStyle(fontSize: 10, color: Colors.redAccent, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
