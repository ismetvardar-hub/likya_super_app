import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/carbon_credit_model.dart';

class CarbonCreditsScreen extends StatefulWidget {
  const CarbonCreditsScreen({super.key});

  @override
  State<CarbonCreditsScreen> createState() => _CarbonCreditsScreenState();
}

class _CarbonCreditsScreenState extends State<CarbonCreditsScreen> {
  final List<CarbonCreditModel> _credits = [
    CarbonCreditModel(
      id: 'cc-1',
      certificateHash: '0x7F92A...E41',
      amountKgCO2: 85.0,
      originActivity: 'Laptop Batarya Onarımı & Dönüşümü 🛠️',
      issuedDate: DateTime.now().subtract(const Duration(days: 3)),
      status: 'verified',
    ),
    CarbonCreditModel(
      id: 'cc-2',
      certificateHash: '0x3C18B...F90',
      amountKgCO2: 42.5,
      originActivity: 'Likya E-Bisiklet Ulaşımı (84 km) 🚲',
      issuedDate: DateTime.now().subtract(const Duration(days: 7)),
      status: 'verified',
    ),
    CarbonCreditModel(
      id: 'cc-3',
      certificateHash: '0x99D41...A12',
      amountKgCO2: 15.0,
      originActivity: 'Askıda Yemek Porsiyon Kurtarma 🍲',
      issuedDate: DateTime.now().subtract(const Duration(days: 12)),
      status: 'retired',
    ),
  ];

  void _retireCredit(CarbonCreditModel credit) {
    AudioFeedbackService().playHandshakeDealSound();
    setState(() {
      final index = _credits.indexWhere((c) => c.id == credit.id);
      if (index != -1) {
        _credits[index] = CarbonCreditModel(
          id: credit.id,
          certificateHash: credit.certificateHash,
          amountKgCO2: credit.amountKgCO2,
          originActivity: credit.originActivity,
          issuedDate: credit.issuedDate,
          status: 'retired',
        );
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${credit.amountKgCO2} kg CO₂ kredisi kalıcı olarak emekliye ayrılarak iklim nötrlendi! 🌿')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final activeTotal = _credits.where((c) => c.status == 'verified').fold<double>(0.0, (sum, c) => sum + c.amountKgCO2);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Doğrulanmış Karbon Kredilerim 🌿'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Toplam Karbon Kredisi Kartı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppTheme.ecoGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: AppTheme.accentColor.withOpacity(0.4), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Gold Standard & Likya Doğrulamalı', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                      Icon(Icons.verified_rounded, color: Colors.white, size: 24),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${activeTotal.toStringAsFixed(1)} kg CO₂',
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'E-bisiklet, onarım ve gıda kurtarma faaliyetlerinizden kazandığınız tokenlaştırılmış karbon ofset bakiyeniz.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Karbon Sertifikaları (${_credits.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._credits.map((c) {
              final isVerified = c.status == 'verified';
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
                          Text(c.originActivity, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isVerified ? AppTheme.successColor.withOpacity(0.15) : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isVerified ? 'AKTİF OFSET' : 'EMEKLİYE AYRILDI 🌱',
                              style: TextStyle(
                                color: isVerified ? AppTheme.successColor : Colors.grey.shade700,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Sertifika: ${c.certificateHash}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontFamily: 'monospace')),
                      const SizedBox(height: 10),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '+${c.amountKgCO2} kg CO₂',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 16),
                          ),
                          if (isVerified)
                            ElevatedButton(
                              onPressed: () => _retireCredit(c),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.secondaryColor,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              ),
                              child: const Text('İklim Nötrle (Emekli Et)', style: TextStyle(fontSize: 12)),
                            ),
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
