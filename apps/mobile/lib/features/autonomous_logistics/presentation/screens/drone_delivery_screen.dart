import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/drone_delivery_model.dart';

class DroneDeliveryScreen extends StatelessWidget {
  const DroneDeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleDeliveries = [
      AutonomousDeliveryModel(
        id: 'del-1',
        trackingCode: 'ROVER-LKY-04',
        vehicleType: 'Otonom Kara Roverı 🤖',
        originStation: 'Adil Masa Merkez Depo',
        destinationHub: 'Öğrenci Yaşam Merkezi Dolap İstasyonu',
        etaMinutes: 4,
        status: 'in_transit',
        payloadDescription: '2x Organik Zeytinyağı & Seramik Kupa',
        batteryPct: 88.0,
      ),
      AutonomousDeliveryModel(
        id: 'del-2',
        trackingCode: 'DRONE-LKY-01',
        vehicleType: 'Elektrikli Kargo Dronu 🛸',
        originStation: 'Maker Onarım Atölyesi',
        destinationHub: 'Kütüphane Akıllı Emanet Noktası',
        etaMinutes: 1,
        status: 'landed',
        payloadDescription: 'Yedek Laptop Bataryası & Ekran Kablosu',
        batteryPct: 94.0,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Otonom Lojistik & Kargo Takibi 🤖'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Radar Banner'ı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF3B82F6).withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Otonom Sevkiyat Ağı ⚡', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.precision_manufacturing_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('Sıfır Karbon Otonom Teslimat', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Kampüs binaları arasında takas ürünleri ve onarım yedek parçaları elektrikli rover ve dronlarla taşınıyor.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Canlı Sevkiyatlar (${sampleDeliveries.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...sampleDeliveries.map((del) {
              final isInTransit = del.status == 'in_transit';
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
                          Text(del.vehicleType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isInTransit ? AppTheme.accentColor.withValues(alpha: 0.2) : AppTheme.successColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isInTransit ? 'YOLDA (${del.etaMinutes} dk)' : 'ULAŞTI ✅',
                              style: TextStyle(
                                color: isInTransit ? AppTheme.primaryColor : AppTheme.successColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Takip Kodu: ${del.trackingCode}', style: const TextStyle(color: AppTheme.primaryLight, fontWeight: FontWeight.w600, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text('Paket: ${del.payloadDescription}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 10),

                      // Rota Çizgisi
                      Row(
                        children: [
                          const Icon(Icons.trip_origin, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Expanded(child: Text(del.originStation, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted))),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.only(left: 6.0),
                        child: Icon(Icons.arrow_downward, size: 12, color: AppTheme.primaryColor),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppTheme.secondaryColor),
                          const SizedBox(width: 4),
                          Expanded(child: Text(del.destinationHub, style: const TextStyle(fontSize: 11, color: AppTheme.textDark, fontWeight: FontWeight.bold))),
                        ],
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
