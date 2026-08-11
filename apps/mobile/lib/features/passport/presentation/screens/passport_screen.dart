import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class PassportStampModel {
  final String id;
  final String title;
  final String category;
  final String stampIcon;
  final String dateEarned;
  final bool isCollected;

  PassportStampModel({
    required this.id,
    required this.title,
    required this.category,
    required this.stampIcon,
    required this.dateEarned,
    required this.isCollected,
  });
}

class PassportScreen extends StatelessWidget {
  const PassportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final stamps = [
      PassportStampModel(
        id: 'st-1',
        title: 'Phaselis Antik Koyu',
        category: 'Kültür Rotası',
        stampIcon: '🏛️',
        dateEarned: '08 Ağustos 2026',
        isCollected: true,
      ),
      PassportStampModel(
        id: 'st-2',
        title: 'Likya Bahar Şenliği',
        category: 'Konser & Sanat',
        stampIcon: '🎭',
        dateEarned: '10 Ağustos 2026',
        isCollected: true,
      ),
      PassportStampModel(
        id: 'st-3',
        title: 'Maker Onarım Atölyesi',
        category: 'Döngüsel Ekonomi',
        stampIcon: '🛠️',
        dateEarned: '10 Ağustos 2026',
        isCollected: true,
      ),
      PassportStampModel(
        id: 'st-4',
        title: 'Patara Kum Tepeleri',
        category: 'Doğa Koruma',
        stampIcon: '🌊',
        dateEarned: '-',
        isCollected: false,
      ),
      PassportStampModel(
        id: 'st-5',
        title: 'Olympos Yanartaş Efsanesi',
        category: 'Gece Yürüyüşü',
        stampIcon: '🔥',
        dateEarned: '-',
        isCollected: false,
      ),
      PassportStampModel(
        id: 'st-6',
        title: 'Sıfır Atık Kampüs Şampiyonluğu',
        category: 'Sürdürülebilirlik',
        stampIcon: '♻️',
        dateEarned: '-',
        isCollected: false,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Likya Dijital Pasaportu 🛂'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Pasaport Başlığı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2C3E50), Color(0xFF0F4C81)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.menu_book, color: Colors.white, size: 36),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('LİKYA KÜLTÜR PASAPORTU', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                        SizedBox(height: 4),
                        Text('Ahmet Yılmaz', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('Pasaport No: LKY-PASS-2026-99', style: TextStyle(color: Colors.white60, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Toplanan Damgalar Grid'i
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Etkinlik & Parkur Damgaları',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const Text('3/6 Tamamlandı', style: TextStyle(fontSize: 12, color: AppTheme.primaryLight, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.9,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: stamps.length,
              itemBuilder: (context, index) {
                final stamp = stamps[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: stamp.isCollected ? Colors.white : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: stamp.isCollected ? AppTheme.secondaryColor.withOpacity(0.5) : Colors.grey.shade300,
                      width: stamp.isCollected ? 2 : 1,
                    ),
                    boxShadow: stamp.isCollected
                        ? [BoxShadow(color: AppTheme.secondaryColor.withOpacity(0.12), blurRadius: 10)]
                        : [],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: stamp.isCollected ? AppTheme.secondaryColor.withOpacity(0.1) : Colors.grey.shade200,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          stamp.stampIcon,
                          style: TextStyle(fontSize: 32, color: stamp.isCollected ? null : Colors.grey),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        stamp.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: stamp.isCollected ? AppTheme.textDark : Colors.grey,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        stamp.isCollected ? stamp.dateEarned : 'Ziyaret Edilmedi 🔒',
                        style: TextStyle(
                          fontSize: 10,
                          color: stamp.isCollected ? AppTheme.textMuted : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
