import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class SolarBuildingModel {
  final String buildingName;
  final double currentKw;
  final int panelCount;
  final int batteryPct;

  SolarBuildingModel({
    required this.buildingName,
    required this.currentKw,
    required this.panelCount,
    required this.batteryPct,
  });
}

class SolarGridScreen extends StatelessWidget {
  const SolarGridScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final buildings = [
      SolarBuildingModel(buildingName: 'Merkez Kütüphane Güneş Çatısı ☀️', currentKw: 48.5, panelCount: 120, batteryPct: 94),
      SolarBuildingModel(buildingName: 'Mühendislik GES Santrali ⚡', currentKw: 62.0, panelCount: 160, batteryPct: 88),
      SolarBuildingModel(buildingName: 'E-Bisiklet İstasyon Kanopileri 🚲', currentKw: 32.3, panelCount: 80, batteryPct: 99),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kampüs Güneş & Mikro-Şebeke ☀️'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Canlı Güneş Enerjisi Üretim Banner'ı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF6AD55), Color(0xFFE07A5F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFF6AD55).withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Canlı Güneş Üretimi (GES)', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.solar_power_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text(
                    '142.8 kW',
                    style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Bugün 1.2 MWh temiz enerji üretildi • Kampüs tüketiminin %68\'i karşılanıyor.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Özet Göstergeler
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Batarya Depolama', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                        SizedBox(height: 4),
                        Text('%93.4', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.successColor)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Karbon Tasarrufu', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                        SizedBox(height: 4),
                        Text('640 kg CO₂', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryColor)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            Text(
              'Bina Bazlı Güneş Panelleri',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...buildings.map((b) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFFFF3C4),
                    child: Icon(Icons.wb_sunny, color: Color(0xFFF6AD55)),
                  ),
                  title: Text(b.buildingName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('${b.panelCount} Fotovoltaik Panel • Batarya: %${b.batteryPct}', style: const TextStyle(fontSize: 12)),
                  trailing: Text(
                    '${b.currentKw} kW',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 14),
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
