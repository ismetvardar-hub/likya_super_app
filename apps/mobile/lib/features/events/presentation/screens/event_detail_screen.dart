import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class EventDetailScreen extends StatelessWidget {
  final String eventId;

  const EventDetailScreen({super.key, required this.eventId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Etkinlik Detayı'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.event_seat_rounded, size: 64, color: Colors.white),
                    SizedBox(height: 8),
                    Text('Likya Bahar Şenliği & Konser', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Chip(label: Text('Konser & Festival')),
                Text(
                  'Ücretsiz Katılım',
                  style: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 16),

            Text(
              'Likya Bahar Şenliği & Akustik Konser',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),

            const Text(
              'Organizatör: Likya Gençlik & Sanat Kulübü',
              style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),

            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(Icons.access_time_rounded, color: AppTheme.primaryLight),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Tarih & Saat', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                            Text('15 Ağustos 2026, 19:00 - 23:00', style: TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    Divider(height: 20),
                    Row(
                      children: [
                        Icon(Icons.place_rounded, color: AppTheme.secondaryColor),
                        SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Etkinlik Yeri', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                            Text('Kampüs Ana Amfi Tiyatro', style: TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            const Text('Etkinlik Hakkında', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 6),
            const Text(
              'Likya Super-App topluluk lansmanı kapsamında düzenlenen bahar şenliği konserimiz tüm öğrenci ve katılımcılara açıktır. Dijital QR biletiniz ile kapıda sıra beklemeden hızlı giriş yapabilirsiniz.',
              style: TextStyle(height: 1.5, color: AppTheme.textDark),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Biletiniz başarıyla oluşturuldu! Biletlerim sekmesinden erişebilirsiniz.')),
                  );
                  context.go('/tickets');
                },
                icon: const Icon(Icons.confirmation_number_rounded),
                label: const Text('Ücretsiz QR Bilet Al'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primaryColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
