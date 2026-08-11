import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class ARLensScreen extends StatefulWidget {
  const ARLensScreen({super.key});

  @override
  State<ARLensScreen> createState() => _ARLensScreenState();
}

class _ARLensScreenState extends State<ARLensScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  String? _selectedPointTitle;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AR Kampüs Vizörü 📷'),
      ),
      body: Stack(
        children: [
          // Kamera Arka Plan Simülasyonu
          Container(
            color: const Color(0xFF1A202C),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.view_in_ar_rounded, size: 80, color: Colors.white.withOpacity(0.15)),
                  const SizedBox(height: 12),
                  Text(
                    'Kamerayı Çevrenize Doğrultunuz',
                    style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                  ),
                ],
              ),
            ),
          ),

          // Üst Radar / Pusula Göstergesi
          Positioned(
            top: 20,
            right: 20,
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: Colors.black54,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.accentColor, width: 1.5),
              ),
              child: const Center(
                child: Text('KUZEY\n340°', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.accentColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
          ),

          // Yüzen AR Pinleri (Spatial HUD Waypoints)
          _buildARWaypoint(
            top: 140,
            left: 40,
            icon: '🛠️',
            title: 'Onarım Atölyesi',
            distance: '120m',
            color: AppTheme.accentColor,
          ),
          _buildARWaypoint(
            top: 240,
            right: 40,
            icon: '🚰',
            title: 'Akıllı Su Çeşmesi',
            distance: '45m',
            color: const Color(0xFF38B6FF),
          ),
          _buildARWaypoint(
            top: 380,
            left: 70,
            icon: '🏛️',
            title: 'Amfi Sahnesi',
            distance: '250m',
            color: AppTheme.secondaryColor,
          ),

          // Alt Bilgilendirme Kartı
          if (_selectedPointTitle != null)
            Positioned(
              bottom: 30,
              left: 20,
              right: 20,
              child: Card(
                elevation: 10,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppTheme.primaryColor,
                        child: Icon(Icons.navigation, color: Colors.white),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_selectedPointTitle!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 2),
                            const Text('AR Rota Çizgisi Başlatıldı • 1 dk yürüme', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => setState(() => _selectedPointTitle = null),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildARWaypoint({
    required double top,
    double? left,
    double? right,
    required String icon,
    required String title,
    required String distance,
    required Color color,
  }) {
    return Positioned(
      top: top,
      left: left,
      right: right,
      child: GestureDetector(
        onTap: () {
          AudioFeedbackService().playCoinEarnChime();
          setState(() => _selectedPointTitle = '$title ($distance)');
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.75),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 10,
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 6),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                  Text(distance, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
