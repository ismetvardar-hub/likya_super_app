import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class EnvironmentalSensorsScreen extends StatelessWidget {
  const EnvironmentalSensorsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sensors = [
      {
        'title': 'Amfi Sahnesi Akustik Desibel Ölçer 🎙️',
        'value': '68.2 dB',
        'status': 'İdeal Akustik Seviyesi',
        'color': AppTheme.primaryColor,
        'location': 'Merkez Amfi Tiyatro Ses Masası',
      },
      {
        'title': 'Hava Partikül Sensörü (PM2.5) 🍃',
        'value': '12 µg/m³',
        'status': 'Tertemiz Çam & Deniz Havası',
        'color': AppTheme.successColor,
        'location': 'Likya Orman Koruluğu Girişi',
      },
      {
        'title': 'Güneş UV İndeksi Ölçer ☀️',
        'value': '5.4 UV',
        'status': 'Orta Risk (Gözlük/Şapka Tavsiye Edilir)',
        'color': AppTheme.warningColor,
        'location': 'Kütüphane Çatı Meteoroloji İstasyonu',
      },
      {
        'title': 'Toprak Nemi & pH Sensörü 🫒',
        'value': '%48 Nem | pH 6.8',
        'status': 'Zeytin Ağaçları İçin Optimum',
        'color': AppTheme.accentColor,
        'location': 'Hatıra Zeytinliği Sektör 2',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Çevre & Akustik Sensörler 📊'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sensors.length,
        itemBuilder: (context, index) {
          final s = sensors[index];
          final Color color = s['color'] as Color;

          return Card(
            margin: const EdgeInsets.only(bottom: 14),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(s['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(s['value'] as String, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(s['status'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textDark)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 14, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(s['location'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
