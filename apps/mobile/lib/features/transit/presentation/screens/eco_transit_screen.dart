import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class EcoTransitScreen extends StatelessWidget {
  const EcoTransitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shuttles = [
      {
        'route': 'Ring 1: Doğu Kapısı ➔ Amfi Tiyatro ➔ Kütüphane 🚌',
        'type': '%100 Elektrikli Otonom Ring',
        'eta': '3 Dakika',
        'occupancy': '%45 Dolu (Ferah)',
        'color': AppTheme.primaryColor,
      },
      {
        'route': 'Ring 2: Batı Yurtlar ➔ Maker Lab ➔ Spor Kompleksi ⚡',
        'type': '%100 Güneş Enerjili Minibüs',
        'eta': '8 Dakika',
        'occupancy': '%70 Dolu',
        'color': AppTheme.secondaryColor,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Eko-Ulaşım & Elektrikli Ring 🚌'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Yürü & Kazan Kartı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.ecoGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: AppTheme.accentColor.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Bugünkü Adım Sayarın', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.directions_walk_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('8,420 Adım Atıldı 👟', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    '+15 Likya Coin & 1.2 kg CO₂ Tasarruf Edildi! 🌲',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Canlı Elektrikli Ring Seferleri',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...shuttles.map((s) {
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
                          Expanded(
                            child: Text(s['route'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.successColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(s['eta'] as String, style: const TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('${s['type']} • ${s['occupancy']}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
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
