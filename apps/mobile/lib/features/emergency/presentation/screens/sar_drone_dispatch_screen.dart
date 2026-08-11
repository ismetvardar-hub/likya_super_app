import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class SarDroneDispatchScreen extends StatefulWidget {
  const SarDroneDispatchScreen({super.key});

  @override
  State<SarDroneDispatchScreen> createState() => _SarDroneDispatchScreenState();
}

class _SarDroneDispatchScreenState extends State<SarDroneDispatchScreen> {
  bool _isDroneDispatched = false;
  int _etaMinutes = 3;

  void _dispatchDrone() {
    AudioFeedbackService().playErrorAlertSound();
    setState(() => _isDroneDispatched = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Termal Kameralı Likya SAR Arama Kurtarma Dronu Havalandı! 🛸')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Termal SAR Kurtarma Dronu 🛸'),
        backgroundColor: Colors.red.shade900,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Canlı Termal Simülasyon
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isDroneDispatched ? Icons.flight_takeoff_rounded : Icons.radar_rounded,
                          size: 64,
                          color: _isDroneDispatched ? Colors.greenAccent : Colors.redAccent.withOpacity(0.6),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _isDroneDispatched ? 'TERMAL KAMERA AKTİF • CANLI ARAMA' : 'DRON HANGARDA BEKLEMEDE',
                          style: TextStyle(
                            color: _isDroneDispatched ? Colors.greenAccent : Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_isDroneDispatched)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(6)),
                        child: const Text('FLIR TERMAL 36.8°C', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_isDroneDispatched)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.successColor),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Kalan Uçuş Süresi:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('$_etaMinutes Dakika', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('İrtifa: 85m | Hız: 48 km/s', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        Text('Batarya: %92', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              )
            else
              Center(
                child: ElevatedButton.icon(
                  onPressed: _dispatchDrone,
                  icon: const Icon(Icons.emergency_share),
                  label: const Text('Acil Termal Kurtarma Dronu Çağır (SAR)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade800,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  ),
                ),
              ),

            const SizedBox(height: 24),

            const Text(
              'Likya SAR Otonom Filo Özellikleri',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildFeatureItem(Icons.thermostat, 'FLIR Termal İnsan Vücut Isısı Tespiti (Gece/Gündüz)'),
                    const Divider(height: 16),
                    _buildFeatureItem(Icons.medication, 'İlk Yardım Kiti & Su Matarası Bırakma Mekanizması'),
                    const Divider(height: 16),
                    _buildFeatureItem(Icons.wifi_tethering, 'Mesh Röle Sinyal Genişletici Anten Taşıyıcı'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 13))),
      ],
    );
  }
}
