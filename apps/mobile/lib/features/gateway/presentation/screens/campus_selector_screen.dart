import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class CampusSelectorScreen extends StatefulWidget {
  const CampusSelectorScreen({super.key});

  @override
  State<CampusSelectorScreen> createState() => _CampusSelectorScreenState();
}

class _CampusSelectorScreenState extends State<CampusSelectorScreen> {
  String _selectedCampusId = 'c-1';

  final List<Map<String, dynamic>> _campuses = [
    {
      'id': 'c-1',
      'name': 'Antalya Merkez Kampüs & Yaşam Havzası',
      'icon': '🏛️',
      'sub': '14 Atölye, 3 Amfi Sahnesi, 8 Güneş İstasyonu',
      'isMain': true,
    },
    {
      'id': 'c-2',
      'name': 'Fethiye Kültür & Deniz Havzası',
      'icon': '⛵',
      'sub': '6 Organik Pazar Standı, 4 Açık Hava Sahnesi',
      'isMain': false,
    },
    {
      'id': 'c-3',
      'name': 'Kaş / Kalkan Eko-Yerleşkesi',
      'icon': '🫒',
      'sub': 'Zeytinyağı Kooperatifleri & Dalış Kulüpleri',
      'isMain': false,
    },
    {
      'id': 'c-4',
      'name': 'Phaselis & Olympos Doğa Parkuru',
      'icon': '🌲',
      'sub': 'Likya Yolu Doğa Koruma & Sesli Rehber Noktası',
      'isMain': false,
    },
  ];

  void _selectCampus(String id, String name) {
    setState(() => _selectedCampusId = id);
    AudioFeedbackService().playCoinEarnChime();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Aktif Havza "$name" olarak değiştirildi! 📍')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bölge & Kampüs Değiştirici 📍'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _campuses.length,
        itemBuilder: (context, index) {
          final c = _campuses[index];
          final isSelected = _selectedCampusId == c['id'];

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            color: isSelected ? AppTheme.primaryColor.withOpacity(0.06) : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(18),
              side: BorderSide(
                color: isSelected ? AppTheme.primaryColor : Colors.transparent,
                width: 1.5,
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              onTap: () => _selectCampus(c['id'], c['name']),
              leading: Text(c['icon'], style: const TextStyle(fontSize: 32)),
              title: Row(
                children: [
                  Expanded(
                    child: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                  if (isSelected)
                    const Icon(Icons.check_circle, color: AppTheme.primaryColor, size: 20),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(c['sub'], style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              ),
            ),
          );
        },
      ),
    );
  }
}
