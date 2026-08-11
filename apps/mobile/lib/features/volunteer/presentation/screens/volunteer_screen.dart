import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class VolunteerTaskModel {
  final String id;
  final String title;
  final String clubName;
  final String location;
  final String date;
  final int rewardEcoPoints;
  final int quota;
  final int registered;

  VolunteerTaskModel({
    required this.id,
    required this.title,
    required this.clubName,
    required this.location,
    required this.date,
    required this.rewardEcoPoints,
    required this.quota,
    required this.registered,
  });
}

class VolunteerScreen extends StatefulWidget {
  const VolunteerScreen({super.key});

  @override
  State<VolunteerScreen> createState() => _VolunteerScreenState();
}

class _VolunteerScreenState extends State<VolunteerScreen> {
  final List<VolunteerTaskModel> _tasks = [
    VolunteerTaskModel(
      id: 'vol-1',
      title: 'Phaselis Kıyı Temizliği & Biyoçeşitlilik Sayımı 🌊',
      clubName: 'Likya Çevre Kulübü',
      location: 'Phaselis Antik Koyu',
      date: '16 Ağustos Cumartesi, 09:00',
      rewardEcoPoints: 150,
      quota: 30,
      registered: 22,
    ),
    VolunteerTaskModel(
      id: 'vol-2',
      title: 'Döngüsel Onarım Atölyesi Genç Mentorluğu 🛠️',
      clubName: 'Mühendislik & Maker Topluluğu',
      location: 'Merkez Kampüs Maker Lab',
      date: '19 Ağustos Salı, 14:00',
      rewardEcoPoints: 200,
      quota: 10,
      registered: 6,
    ),
    VolunteerTaskModel(
      id: 'vol-3',
      title: 'Likya Yolu Hatıra Koruluğu Fidan Dikim Seferi 🌲',
      clubName: 'TEMA Kampüs Temsilciliği',
      location: 'Likya Yolu 3. km Etabı',
      date: '23 Ağustos Pazar, 10:00',
      rewardEcoPoints: 250,
      quota: 50,
      registered: 41,
    ),
  ];

  void _applyTask(VolunteerTaskModel task) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.volunteer_activism, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text('Gönüllü Başvurusu Alındı!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(task.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Text('Tarih: ${task.date}'),
              Text('Yer: ${task.location}'),
              const Divider(height: 20),
              Text(
                'Etkinlik tamamlandığında cüzdanınıza +${task.rewardEcoPoints} Eko-Puan aktarılacaktır. 🌱',
                style: const TextStyle(fontSize: 12, color: AppTheme.successColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Harika!'),
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
        title: const Text('Gönüllülük & Kulüp Görevleri 🤝'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tasks.length,
        itemBuilder: (context, index) {
          final task = _tasks[index];
          final progress = task.registered / task.quota;

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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(task.clubName, style: const TextStyle(color: AppTheme.primaryColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('+${task.rewardEcoPoints} Puan', style: const TextStyle(color: AppTheme.successColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(task.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(task.date, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 14, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(task.location, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Doluluk İlerleme Çubuğu
                  LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.grey.shade200,
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text('${task.registered} / ${task.quota} Gönüllü Katıldı', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                  ),
                  const SizedBox(height: 12),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _applyTask(task),
                      child: const Text('Gönüllü Olarak Katıl 🤝'),
                    ),
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
