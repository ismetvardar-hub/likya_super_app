import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class EmergencySosScreen extends StatefulWidget {
  const EmergencySosScreen({super.key});

  @override
  State<EmergencySosScreen> createState() => _EmergencySosScreenState();
}

class _EmergencySosScreenState extends State<EmergencySosScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  bool _isSosActive = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _triggerSos() {
    setState(() => _isSosActive = true);
    AudioFeedbackService().playErrorAlertSound();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded,
                  color: Colors.redAccent, size: 28),
              SizedBox(width: 8),
              Text('SOS Sinyali Gönderildi!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                  'Konumunuz Kampüs Güvenlik Merkezi ve Nöbetçi Sağlık Ekibine iletildi.'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'GPS: 36.8841° K, 30.7056° D\nTahmini Ekip Varış Süresi: 3 Dakika',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: Colors.redAccent),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() => _isSosActive = false);
              },
              child: const Text('İptal Et / Durum Güvende'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Acil Durum & Güvenli Rota 🚨'),
        backgroundColor: Colors.red.shade900,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 10),
            const Text(
              'Kampüs & Likya Yolu Güvenlik Ağı',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 6),
            const Text(
              'Acil bir sağlık, güvenlik veya kaybolma durumunda butona basılı tutunuz.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),

            // SOS Nabız Butonu
            GestureDetector(
              onTap: _triggerSos,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  final isActive = _isSosActive;
                  return Container(
                    width: 180 + (_pulseController.value * 20),
                    height: 180 + (_pulseController.value * 20),
                    decoration: BoxDecoration(
                      color: isActive ? Colors.red.shade700 : Colors.redAccent,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withValues(
                              alpha: isActive ? 0.8 : 0.5),
                          blurRadius: 30 + (_pulseController.value * 20),
                          spreadRadius: isActive ? 10 : 5,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isActive
                                ? Icons.emergency_share_rounded
                                : Icons.sos_rounded,
                            size: 54,
                            color: Colors.white,
                          ),
                          Text(
                            isActive ? 'SOS AKTİF' : 'ACİL YARDIM',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                letterSpacing: 1.2),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 50),

            // Hızlı Telefon Butonları
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Colors.blueAccent,
                      child: Icon(Icons.security, color: Colors.white),
                    ),
                    title: const Text('Kampüs Güvenlik Amiri',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: const Text('Dahili: 1122 • 7/24 Kesintisiz',
                        style: TextStyle(fontSize: 12)),
                    trailing: IconButton(
                      icon:
                          const Icon(Icons.phone, color: AppTheme.successColor),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Kampüs Güvenlik (1122) aranıyor...')),
                        );
                      },
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Colors.green,
                      child: Icon(Icons.local_hospital, color: Colors.white),
                    ),
                    title: const Text('Kampüs Sağlık & İlkyardım',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: const Text('Dahili: 1133 • Nöbetçi Hekim',
                        style: TextStyle(fontSize: 12)),
                    trailing: IconButton(
                      icon:
                          const Icon(Icons.phone, color: AppTheme.successColor),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Kampüs Sağlık (1133) aranıyor...')),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
