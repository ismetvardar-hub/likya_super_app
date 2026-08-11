import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/compost_batch_model.dart';

class CompostScreen extends StatelessWidget {
  const CompostScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final batches = [
      CompostBatchModel(
        batchId: 'CMP-BATCH-08',
        organicWasteKg: 850,
        fertilizerYieldKg: 340,
        internalTempCelsius: 58.4,
        moisturePct: 52,
        daysRemaining: 4,
        status: 'fermenting',
        targetUsage: 'Kampüs Ekolojik Permakültür Serası 🌿',
      ),
      CompostBatchModel(
        batchId: 'CMP-BATCH-07',
        organicWasteKg: 1200,
        fertilizerYieldKg: 480,
        internalTempCelsius: 32.0,
        moisturePct: 40,
        daysRemaining: 0,
        status: 'ready',
        targetUsage: 'Likya Yolu Hatıra Koruluğu Fidan Dikimi 🌲',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kompost & Biyogaz Dönüşümü ♻️'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Dönüşüm Banner'ı
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.ecoGradient,
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
                      Text('Döngüsel Organik Atık Reaktörü', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.recycling_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('3,400 kg Gıda Atığı Kurtarıldı 🌱', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Yemekhanelerden toplanan organik atıklar doğal kompost gübresine ve temiz biyogaza dönüştürülüyor.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Aktif Kompost Reaktörleri',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...batches.map((b) {
              final isReady = b.status == 'ready';
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
                          Text(b.batchId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isReady ? AppTheme.successColor.withOpacity(0.15) : AppTheme.warningColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isReady ? 'GÜBRE HAZIR ✅' : 'FERMENTE OLUYOR (${b.daysRemaining} gün)',
                              style: TextStyle(
                                color: isReady ? AppTheme.successColor : Colors.deepOrange,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Kullanım Alanı: ${b.targetUsage}', style: const TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 10),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${b.organicWasteKg} kg Atık ➔ ${b.fertilizerYieldKg} kg Doğal Gübre', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          Text('${b.internalTempCelsius}°C | %${b.moisturePct} Nem', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
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
