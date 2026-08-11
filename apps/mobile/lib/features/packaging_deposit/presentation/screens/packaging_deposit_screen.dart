import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class PackagingDepositScreen extends StatefulWidget {
  const PackagingDepositScreen({super.key});

  @override
  State<PackagingDepositScreen> createState() => _PackagingDepositScreenState();
}

class _PackagingDepositScreenState extends State<PackagingDepositScreen> {
  final List<Map<String, dynamic>> _depositItems = [
    {
      'name': 'Paslanmaz Çelik Çok Kullanımlık Sefer Tası',
      'icon': '🍱',
      'depositRefund': 25.0,
      'location': 'Yemekhane Otomatı 1',
    },
    {
      'name': 'Organik Zeytinyağı Cam Şişesi 1L',
      'icon': '🍾',
      'depositRefund': 10.0,
      'location': 'Adil Masa İade Standı',
    },
    {
      'name': 'Pamuk Dokuma Likya Taşıma Çantası',
      'icon': '🛍️',
      'depositRefund': 15.0,
      'location': 'Kütüphane Girişi Kiosk',
    },
  ];

  void _returnItem(Map<String, dynamic> item) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.autorenew_rounded, color: AppTheme.successColor, size: 28),
              SizedBox(width: 8),
              Text('Depozito İade Edildi!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Text(
                '+₺${(item['depositRefund'] as double).toStringAsFixed(0)} Likya Cüzdanınıza Aktarıldı 💰',
                style: const TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const Divider(height: 20),
              const Text(
                'Ambalaj sterilize edilerek tekrar yemekhanelerde kullanıma sunulacaktır. Sıfır atık katkınız için teşekkürler! 🌿',
                style: TextStyle(fontSize: 12, color: AppTheme.primaryLight),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Harika!'),
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
        title: const Text('Döngüsel Depozito & Ambalaj İadesi 🍱'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.sunsetGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: AppTheme.secondaryColor.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Sıfır Tek Kullanımlık Ambalaj', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.inventory_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('Akıllı İade Otomatları ♻️', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Sefer taslarını ve cam şişeleri akıllı kutulara bırakın, depozitonuzu anında nakit veya Likya Coin olarak geri alın.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'İade Edilebilir Depozitolu Eşyalar',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._depositItems.map((item) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(item['icon'] as String, style: const TextStyle(fontSize: 28)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                Text('İade Noktası: ${item['location']}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              ],
                            ),
                          ),
                          Text(
                            '+₺${(item['depositRefund'] as double).toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor, fontSize: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _returnItem(item),
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                          child: const Text('Otomat Barkodunu Tara & İade Et'),
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
