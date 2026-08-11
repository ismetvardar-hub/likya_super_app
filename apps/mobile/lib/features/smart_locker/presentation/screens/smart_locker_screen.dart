import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/smart_locker_model.dart';

class SmartLockerScreen extends StatefulWidget {
  const SmartLockerScreen({super.key});

  @override
  State<SmartLockerScreen> createState() => _SmartLockerScreenState();
}

class _SmartLockerScreenState extends State<SmartLockerScreen> {
  final List<SmartLockerModel> _myLockers = [
    SmartLockerModel(
      id: 'lck-1',
      hubName: 'Öğrenci Yaşam Merkezi Akıllı Dolap İstasyonu 📦',
      compartmentNumber: 7,
      status: 'occupied',
      pickupPinCode: '4829',
      itemDescription: 'Organik Zeytinyağı 1L (Adil Masa Teslimatı)',
      expiresAt: DateTime.now().add(const Duration(hours: 18)),
    ),
    SmartLockerModel(
      id: 'lck-2',
      hubName: 'Mühendislik Binası Girişi Dolap İstasyonu 🛠️',
      compartmentNumber: 12,
      status: 'reserved',
      pickupPinCode: '7193',
      itemDescription: 'Onarılan Asus Laptop (Atölye Teslimatı)',
      expiresAt: DateTime.now().add(const Duration(hours: 36)),
    ),
  ];

  void _unlockCompartment(SmartLockerModel locker) {
    AudioFeedbackService().playHandshakeDealSound();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.lock_open, color: AppTheme.successColor, size: 28),
              const SizedBox(width: 8),
              Text('Dolap #${locker.compartmentNumber} Açıldı!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Konum: ${locker.hubName}', style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
              const SizedBox(height: 8),
              Text('İçerik: ${locker.itemDescription}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const Divider(height: 24),
              const Text(
                'Lütfen eşyanızı aldıktan sonra dolap kapağını nazikçe kapatınız. Kapak kapandığında kilit otomatik kilitlenecektir. 🔐',
                style: TextStyle(fontSize: 12, color: AppTheme.primaryColor),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Kapağı Kapattım'),
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
        title: const Text('Akıllı Emanet & Teslimat Dolabı 📦'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Bilgilendirme Banner'ı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('7/24 Temassız & Güvenli Teslimat', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Icon(Icons.inventory_2_rounded, color: Colors.white),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text('Akıllı IoT Emanet İstasyonları 🔐', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Adil Masa takaslarınızı veya onarılan cihazlarınızı yüz yüze gelmeden dolaplardan teslim alabilirsiniz.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Teslimat Bekleyen Dolaplarım (${_myLockers.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._myLockers.map((locker) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text('Göz #${locker.compartmentNumber}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.successColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text('Teslime Hazır 📦', style: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 10)),
                              ),
                            ],
                          ),
                          Text('PIN: ${locker.pickupPinCode}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.secondaryColor)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(locker.itemDescription, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(locker.hubName, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(height: 14),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _unlockCompartment(locker),
                          icon: const Icon(Icons.lock_open_rounded),
                          label: const Text('Dolap Kilidini Aç (Bluetooth / IoT)'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.secondaryColor),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
