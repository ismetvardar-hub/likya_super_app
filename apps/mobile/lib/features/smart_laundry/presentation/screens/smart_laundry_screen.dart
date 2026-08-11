import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class SmartLaundryScreen extends StatefulWidget {
  const SmartLaundryScreen({super.key});

  @override
  State<SmartLaundryScreen> createState() => _SmartLaundryScreenState();
}

class _SmartLaundryScreenState extends State<SmartLaundryScreen> {
  final List<Map<String, dynamic>> _machines = [
    {
      'id': 'WM-01',
      'name': 'Çamaşır Makinesi #1 (Eko-Filtreli)',
      'status': 'available',
      'statusText': 'Kullanıma Hazır',
      'microplasticFilterPct': 99,
      'temp': '30°C Soğuk Eko-Yıkama',
    },
    {
      'id': 'WM-02',
      'name': 'Çamaşır Makinesi #2 (Eko-Filtreli)',
      'status': 'running',
      'statusText': 'Yıkamada (14 dk kaldı)',
      'microplasticFilterPct': 98,
      'temp': '40°C Hassas Yıkama',
    },
    {
      'id': 'DR-01',
      'name': 'Isı Pompalı Eko-Kurutucu #1',
      'status': 'available',
      'statusText': 'Kullanıma Hazır',
      'microplasticFilterPct': 100,
      'temp': 'Düşük Sıcaklık & İpek Koruma',
    },
  ];

  void _startMachine(Map<String, dynamic> machine) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.local_laundry_service, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text('Yıkama Başlatıldı! 🫧'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(machine['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              const Text('Mikroplastik Yakalama Filtresi: %99 Aktif'),
              const Text('Bitkisel Dökme Deterjan: Otomatik Dozlandı'),
              const Divider(height: 20),
              const Text(
                'Akdeniz\'e 120.000 mikroplastik lifinin karışması engellendi! 🌊',
                style: TextStyle(fontSize: 12, color: AppTheme.successColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Tamam'),
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
        title: const Text('Sıfır Mikroplastik Çamaşırhane 🫧'),
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
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F4C81), Color(0xFF81B29A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
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
                      Text('Denizleri & Akdeniz\'i Koruyan Yıkama', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.water_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('4.8 Milyon Mikroplastik Tutuldu 🌊', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Özel lif filtreli akıllı makineler sentetik giysi atıklarını süzerek deniz ekosistemini korur.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Yurt & Kampüs Makineleri Durumu',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._machines.map((m) {
              final isAvail = m['status'] == 'available';
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
                            child: Text(m['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isAvail ? AppTheme.successColor.withOpacity(0.15) : AppTheme.warningColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              m['statusText'] as String,
                              style: TextStyle(
                                color: isAvail ? AppTheme.successColor : Colors.deepOrange,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(m['temp'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(height: 12),

                      if (isAvail)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _startMachine(m),
                            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                            child: const Text('Makineyi Başlat & Dozajla (Likya Cüzdan)'),
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
