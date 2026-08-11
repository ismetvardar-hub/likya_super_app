import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class DigitalIdScreen extends StatelessWidget {
  const DigitalIdScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const String didIdentifier = 'did:likya:0x89F2A71BC44E3D82';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Merkeziyetsiz Kimlik (DID) 🪪'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Holografik Eko-Vatandaşlık Kartı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F4C81), Color(0xFF1E3A8A), Color(0xFF2B6CB0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.verified, color: AppTheme.accentColor, size: 24),
                          SizedBox(width: 8),
                          Text('LİKYA EKO-VATANDAŞLIK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.1)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(8)),
                        child: const Text('W3C DID', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  const Text('Ahmet Yılmaz', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Rol: Aktif Öğrenci & Gönüllü Onarımcı 🛠️', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      didIdentifier,
                      style: TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Kimlik Doğrulama QR Kodu
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text(
                      'Turnike & Atölye Geçiş Karekodu',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    const SizedBox(height: 12),
                    QrImageView(
                      data: didIdentifier,
                      version: QrVersions.auto,
                      size: 160.0,
                      backgroundColor: Colors.white,
                      eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primaryColor),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Kütüphane, amfi tiyatro ve maker atölyesi girişlerinde okutunuz.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              onPressed: () {
                AudioFeedbackService().playTicketSuccessSound();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Kriptografik Kimlik İmzası Doğrulandı! 🔐')),
                );
              },
              icon: const Icon(Icons.fingerprint),
              label: const Text('Biyometrik Kimlik İmzala (FaceID)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondaryColor,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
