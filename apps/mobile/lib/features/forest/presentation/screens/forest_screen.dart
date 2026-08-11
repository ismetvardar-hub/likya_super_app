import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/forest_tree_model.dart';

class ForestScreen extends StatelessWidget {
  const ForestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleTrees = [
      ForestTreeModel(
        id: 'tree-01',
        treeType: 'Toros Sediri 🌲',
        donorName: 'Ahmet Yılmaz',
        coordinates: '36.88° K, 30.70° D (Likya Yolu Etabı)',
        plantingDate: DateTime.now().subtract(const Duration(days: 10)),
        certificateNumber: 'LKY-FOREST-2026-0842',
      ),
      ForestTreeModel(
        id: 'tree-02',
        treeType: 'Ölümsüz Zeytin Fidanı 🫒',
        donorName: 'Ahmet Yılmaz',
        coordinates: '36.85° K, 30.65° D (Kampüs Hatıra Koruluğu)',
        plantingDate: DateTime.now().subtract(const Duration(days: 25)),
        certificateNumber: 'LKY-FOREST-2026-0719',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Likya Hatıra Ormanı 🌲'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Orman Etki Banner'ı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.ecoGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentColor.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Topluluk Fidanlığı 🌿', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Icon(Icons.forest_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '1,842 Dikilen Fidan',
                    style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Onarılan her 3 eşya ve 500 Eko-Puan Likya Yolu\'nda 1 fidana dönüşüyor.',
                    style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Şahsi Fidanlarım
            Text(
              'Adına Dikilen Fidanların (${sampleTrees.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...sampleTrees.map((tree) {
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
                          Text(tree.treeType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.successColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Toprakla Buluştu 🌱', style: TextStyle(color: AppTheme.successColor, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Sertifika No: ${tree.certificateNumber}', style: const TextStyle(fontSize: 12, color: AppTheme.primaryLight, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.place_outlined, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Text(tree.coordinates, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('${tree.certificateNumber} Dijital Fidan Sertifikası İndirildi 📜')),
                          );
                        },
                        icon: const Icon(Icons.card_membership, size: 16),
                        label: const Text('Dijital Sertifikayı Görüntüle'),
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
