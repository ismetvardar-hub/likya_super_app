import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class RepairDonationScreen extends StatelessWidget {
  const RepairDonationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleRequests = [
      {
        'id': 'rep-101',
        'itemName': 'Asus Laptop Klavye & Batarya Onarımı',
        'category': 'Elektronik',
        'donor': 'Ahmet Y.',
        'status': 'in_repair',
        'statusTitle': 'Onarımda 🛠️',
        'date': '08 Ağustos 2026',
        'stepIndex': 1,
      },
      {
        'id': 'rep-102',
        'itemName': 'Ahşap Çalışma Masası',
        'category': 'Mobilya',
        'donor': 'Zeynep K.',
        'status': 'repaired',
        'statusTitle': 'Onarıldı & Bağışa Hazır 🎁',
        'date': '02 Ağustos 2026',
        'stepIndex': 2,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Döngüsel Onarım & Bağış Takibi'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Yeni Başvuru Yap İnce Banner Kartı
            Card(
              color: AppTheme.secondaryColor.withOpacity(0.08),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryColor,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.handyman_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Bozuk Eşyanı Onar ya da Bağışla!',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Sürdürülebilir kampüs için e-atık ve atık mobilyaları yeniden kazandırın.',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Aktif Başvurularım',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                ElevatedButton.icon(
                  onPressed: () => context.push('/repair-donations/create'),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Yeni Başvuru'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Takip Kartları
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: sampleRequests.length,
              itemBuilder: (context, index) {
                final item = sampleRequests[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Chip(
                              label: Text(item['category'] as String),
                              backgroundColor: AppTheme.accentColor.withOpacity(0.2),
                            ),
                            Text(
                              item['statusTitle'] as String,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        Text(
                          item['itemName'] as String,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),

                        Text(
                          'Başvuru Tarihi: ${item['date']}',
                          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 16),

                        // Süreç Stepper UI
                        Row(
                          children: [
                            _buildStepIndicator('Beklemede', isDone: true, isActive: false),
                            _buildStepLine(isDone: (item['stepIndex'] as int) >= 1),
                            _buildStepIndicator('Onarımda', isDone: (item['stepIndex'] as int) >= 1, isActive: (item['stepIndex'] as int) == 1),
                            _buildStepLine(isDone: (item['stepIndex'] as int) >= 2),
                            _buildStepIndicator('Bağışlandı', isDone: (item['stepIndex'] as int) >= 2, isActive: (item['stepIndex'] as int) == 2),
                          ],
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

  Widget _buildStepIndicator(String label, {required bool isDone, required bool isActive}) {
    return Expanded(
      child: Column(
        children: [
          CircleAvatar(
            radius: 12,
            backgroundColor: isDone
                ? AppTheme.primaryColor
                : (isActive ? AppTheme.secondaryColor : Colors.grey.shade300),
            child: Icon(
              isDone ? Icons.check : Icons.circle,
              size: 14,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isActive || isDone ? FontWeight.bold : FontWeight.normal,
              color: isDone ? AppTheme.primaryColor : AppTheme.textMuted,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStepLine({required bool isDone}) {
    return Container(
      width: 24,
      height: 2,
      color: isDone ? AppTheme.primaryColor : Colors.grey.shade300,
    );
  }
}
