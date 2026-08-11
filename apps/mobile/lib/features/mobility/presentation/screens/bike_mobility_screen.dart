import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/bike_station_model.dart';

class BikeMobilityScreen extends StatefulWidget {
  const BikeMobilityScreen({super.key});

  @override
  State<BikeMobilityScreen> createState() => _BikeMobilityScreenState();
}

class _BikeMobilityScreenState extends State<BikeMobilityScreen> {
  bool _hasActiveRide = false;

  final List<BikeStationModel> _stations = [
    BikeStationModel(
      id: 'st-1',
      stationName: 'Merkez Kütüphane Güneş Şarj İstasyonu ☀️',
      availableBikes: 8,
      availableSlots: 4,
      avgBatteryPct: 92,
    ),
    BikeStationModel(
      id: 'st-2',
      stationName: 'Mühendislik Fakültesi İstasyonu ⚡',
      availableBikes: 5,
      availableSlots: 7,
      avgBatteryPct: 84,
    ),
    BikeStationModel(
      id: 'st-3',
      stationName: 'Öğrenci Yaşam Merkezi & Amfi İstasyonu 🌿',
      availableBikes: 11,
      availableSlots: 1,
      avgBatteryPct: 98,
    ),
  ];

  void _startRide() {
    setState(() => _hasActiveRide = true);
    AudioFeedbackService().playCoinEarnChime();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Likya E-Bisiklet Kilidi Açıldı! İyi sürüşler 🚴‍♂️')),
    );
  }

  void _endRide() {
    setState(() => _hasActiveRide = false);
    AudioFeedbackService().playHandshakeDealSound();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sürüş tamamlandı: +25 Eko-Puan ve 0.4kg CO₂ tasarrufu! 🌱')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Eko-Bisiklet & Mikromobilite 🚲'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Aktif Sürüş Kartı veya Kilit Aç Butonu
            if (_hasActiveRide)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppTheme.ecoGradient,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: AppTheme.accentColor.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 6)),
                  ],
                ),
                child: Column(
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('SÜRÜŞ DEVAM EDİYOR', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        Text('Bisiklet #LKY-88', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            Text('14:20', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                            Text('Süre (dk)', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                        Column(
                          children: [
                            Text('2.8 km', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                            Text('Mesafe', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                        Column(
                          children: [
                            Text('+25', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                            Text('Eko-Puan', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _endRide,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primaryColor,
                      ),
                      child: const Text('İstasyona Kilitle & Sürüşü Bitir'),
                    ),
                  ],
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Sıfır Emisyon Kampüs Ulaşımı 🌿', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 6),
                    const Text('Güneş Enerjili Akıllı Bisikletler', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('QR kodu okutarak anında kilidi açın, sürdükçe Eko-Puan kazanın.', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _startRide,
                      icon: const Icon(Icons.qr_code_scanner),
                      label: const Text('Bisiklet Kilidi Aç (QR Tara)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.secondaryColor,
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 24),

            // Kampüs Güneş İstasyonları Listesi
            Text(
              'Güneş Enerjili Şarj İstasyonları',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._stations.map((st) {
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
                            child: Text(st.stationName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.successColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text('%${st.avgBatteryPct} Şarj', style: const TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.directions_bike, size: 16, color: AppTheme.primaryLight),
                          const SizedBox(width: 4),
                          Text('${st.availableBikes} Kullanıma Hazır Bisiklet', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          const Spacer(),
                          Text('${st.availableSlots} Boş Park Yuvası', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
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
