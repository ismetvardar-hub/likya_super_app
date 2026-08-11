import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/water_station_model.dart';

class WaterRefillScreen extends StatefulWidget {
  const WaterRefillScreen({super.key});

  @override
  State<WaterRefillScreen> createState() => _WaterRefillScreenState();
}

class _WaterRefillScreenState extends State<WaterRefillScreen> {
  final List<WaterStationModel> _stations = [
    WaterStationModel(
      id: 'ws-1',
      stationName: 'Merkez Kütüphane Zemin Kat Çeşmesi 🚰',
      temperatureCelsius: 9.5,
      phLevel: 7.8,
      filterPurityPct: 99,
      totalLitresDispensed: 14200,
      bottlesSaved: 28400,
    ),
    WaterStationModel(
      id: 'ws-2',
      stationName: 'Amfi Tiyatro Konser Meydanı Sebili 🌿',
      temperatureCelsius: 11.0,
      phLevel: 7.6,
      filterPurityPct: 97,
      totalLitresDispensed: 8600,
      bottlesSaved: 17200,
    ),
    WaterStationModel(
      id: 'ws-3',
      stationName: 'Spor Salonu & Likya Parkur Başlangıcı ⛰️',
      temperatureCelsius: 8.0,
      phLevel: 8.0,
      filterPurityPct: 100,
      totalLitresDispensed: 11500,
      bottlesSaved: 23000,
    ),
  ];

  void _dispenseWater(WaterStationModel st) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.water_drop_rounded, color: Color(0xFF38B6FF)),
              SizedBox(width: 8),
              Text('Matara Dolduruluyor... 💧'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(st.stationName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Text('Sıcaklık: ${st.temperatureCelsius}°C (Soğuk Doğal Kaynak Suyu)'),
              Text('pH: ${st.phLevel} • Filtre Saflığı: %${st.filterPurityPct}'),
              const Divider(height: 20),
              const Text(
                '+1 Tek Kullanımlık Plastik Şişe İsrafı Önlendi! (+5 Eko-Puan) 🌱',
                style: TextStyle(fontSize: 12, color: AppTheme.successColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Dolum Tamamlandı'),
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
        title: const Text('Akıllı Su Sebili & Matara Dolumu 🚰'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Su Tasarruf Banner'ı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F4C81), Color(0xFF38B6FF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF38B6FF).withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Plastiksiz Kampüs Hareketi', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.water_drop_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('68,600 PET Şişe Önlendi 🚯', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Kendi matarınızı akıllı çeşmelere yanaştırarak ücretsiz soğuk kaynak suyuna ulaşın.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'En Yakın Akıllı Su Noktaları',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._stations.map((st) {
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
                            child: Text(st.stationName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF38B6FF).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text('${st.temperatureCelsius}°C Soğuk', style: const TextStyle(color: Color(0xFF0F4C81), fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('pH: ${st.phLevel} • Filtre Saflığı: %${st.filterPurityPct} (Alp Dağ Filtreli)', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(height: 6),
                      Text('Bu istasyonda ${st.bottlesSaved} plastik şişe kurtarıldı.', style: const TextStyle(fontSize: 11, color: AppTheme.successColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _dispenseWater(st),
                          icon: const Icon(Icons.qr_code_scanner),
                          label: const Text('Mataraya Su Doldur (QR Tara)'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F4C81)),
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
