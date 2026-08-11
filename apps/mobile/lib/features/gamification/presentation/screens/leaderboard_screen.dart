import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/badge_model.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final badges = [
      BadgeModel(
        id: 'b1',
        title: 'Sıfır Atık Öncüsü ♻️',
        description: '5 bozuk cihazı onarıma kazandırdın.',
        icon: '🌿',
        isUnlocked: true,
        unlockedDate: DateTime.now().subtract(const Duration(days: 5)),
      ),
      BadgeModel(
        id: 'b2',
        title: 'Adil Takasçı 🤝',
        description: 'Adil Masa\'da 10 başarılı takas tamamladın.',
        icon: '🌾',
        isUnlocked: true,
        unlockedDate: DateTime.now().subtract(const Duration(days: 2)),
      ),
      BadgeModel(
        id: 'b3',
        title: 'Likya Kültür Elçisi 🎟️',
        description: '5 kampüs etkinliğine bilet aldın.',
        icon: '🏛️',
        isUnlocked: true,
      ),
      BadgeModel(
        id: 'b4',
        title: 'Usta Onarımcı 🛠️',
        description: '20 cihaz onarımında gönüllü mentorluk yap.',
        icon: '⚡',
        isUnlocked: false,
      ),
    ];

    final topUsers = [
      LeaderboardUserModel(rank: 1, name: 'Zeynep Kaya', department: 'Çevre Mühendisliği', ecoScore: 2450, repairedCount: 14, fairTradesCount: 22),
      LeaderboardUserModel(rank: 2, name: 'Ahmet Yılmaz', department: 'Bilgisayar Müh.', ecoScore: 1980, repairedCount: 11, fairTradesCount: 15),
      LeaderboardUserModel(rank: 3, name: 'Caner Demir', department: 'Mimarlık', ecoScore: 1720, repairedCount: 8, fairTradesCount: 19),
      LeaderboardUserModel(rank: 4, name: 'Elif Şahin', department: 'İktisat', ecoScore: 1450, repairedCount: 6, fairTradesCount: 12),
      LeaderboardUserModel(rank: 5, name: 'Murat Öztürk', department: 'Ziraat Fakültesi', ecoScore: 1200, repairedCount: 5, fairTradesCount: 10),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Liderlik & Rozetlerim 🏆'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rozetlerim Vitrini
            Text(
              'Kazanılan Likya Rozetleri',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            SizedBox(
              height: 140,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: badges.length,
                itemBuilder: (context, index) {
                  final b = badges[index];
                  return Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: b.isUnlocked ? Colors.white : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: b.isUnlocked ? AppTheme.accentColor : Colors.grey.shade300,
                        width: b.isUnlocked ? 1.5 : 1,
                      ),
                      boxShadow: b.isUnlocked
                          ? [BoxShadow(color: AppTheme.accentColor.withOpacity(0.15), blurRadius: 8)]
                          : [],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(b.icon, style: TextStyle(fontSize: 32, color: b.isUnlocked ? null : Colors.grey)),
                        const SizedBox(height: 6),
                        Text(
                          b.title,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: b.isUnlocked ? AppTheme.primaryColor : Colors.grey,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          b.isUnlocked ? 'Kazanıldı ✅' : 'Kilitli 🔒',
                          style: TextStyle(fontSize: 10, color: b.isUnlocked ? AppTheme.successColor : Colors.grey),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 28),

            // Kampüs Liderlik Sıralaması Başlığı
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Kampüs Döngüsel Sıralaması',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const Text('Bu Ay', style: TextStyle(fontSize: 12, color: AppTheme.primaryLight, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),

            // Sıralama Listesi
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: topUsers.length,
              itemBuilder: (context, index) {
                final u = topUsers[index];
                final isTop3 = u.rank <= 3;

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  color: u.rank == 1 ? AppTheme.primaryColor.withOpacity(0.04) : Colors.white,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: u.rank == 1
                          ? const Color(0xFFFFD700) // Altın
                          : (u.rank == 2
                              ? const Color(0xFFC0C0C0) // Gümüş
                              : (u.rank == 3
                                  ? const Color(0xFFCD7F32) // Bronz
                                  : Colors.grey.shade200)),
                      child: Text(
                        '#${u.rank}',
                        style: TextStyle(
                          color: isTop3 ? Colors.black87 : AppTheme.textDark,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(u.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('${u.department} • ${u.repairedCount} Onarım', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${u.ecoScore} Puan',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 14),
                        ),
                        Text(
                          '${u.fairTradesCount} Takas',
                          style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
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
