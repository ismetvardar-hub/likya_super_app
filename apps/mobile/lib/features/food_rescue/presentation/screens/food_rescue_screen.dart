import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/food_rescue_model.dart';

class FoodRescueScreen extends StatefulWidget {
  const FoodRescueScreen({super.key});

  @override
  State<FoodRescueScreen> createState() => _FoodRescueScreenState();
}

class _FoodRescueScreenState extends State<FoodRescueScreen> {
  final List<FoodRescueMealModel> _meals = [
    FoodRescueMealModel(
      id: 'meal-1',
      title: 'Taze Ege Otlu Mercimek Köftesi & Mevsim Salata',
      cafeteriaName: 'Merkez Yemekhane 1. Kat',
      originalPrice: 85.00,
      discountedPrice: 15.00,
      availablePortions: 6,
      isVegan: true,
      pickupWindow: '19:30 - 20:30',
    ),
    FoodRescueMealModel(
      id: 'meal-2',
      title: 'Fırında Sebzeli Güveç & Bulgur Pilavı',
      cafeteriaName: 'Mühendislik Kantini',
      originalPrice: 95.00,
      discountedPrice: 20.00,
      availablePortions: 4,
      isGlutenFree: false,
      pickupWindow: '20:00 - 21:00',
    ),
    FoodRescueMealModel(
      id: 'meal-3',
      title: 'Zeytinyağlı Enginar & Organik Çorba',
      cafeteriaName: 'Sosyal Tesisler Eko-Restoran',
      originalPrice: 110.00,
      discountedPrice: 0.00, // Askıda
      availablePortions: 8,
      isVegan: true,
      isGlutenFree: true,
      pickupWindow: '19:00 - 20:30',
    ),
  ];

  void _reserveMeal(FoodRescueMealModel meal) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.restaurant, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text('Porsiyon Kurtarıldı! 🎉'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(meal.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Text('Teslim Noktası: ${meal.cafeteriaName}'),
              Text('Saat: ${meal.pickupWindow}'),
              const Divider(height: 20),
              const Text(
                'Lütfen kendi saklama kabınızla gelerek ambalaj atığını sıfıra indiriniz. 🌿',
                style: TextStyle(fontSize: 12, color: AppTheme.primaryLight, fontWeight: FontWeight.w600),
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
        title: const Text('Askıda Yemek & Sıfır Atık Büfe 🍲'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // İsraf Önleme Banner'ı
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppTheme.sunsetGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Sıfır Gıda İsrafı & Dayanışma', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Icon(Icons.eco_rounded, color: Colors.white),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text('420 Porsiyon Gıda Kurtarıldı 🌾', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Günün arta kalan taze yemeklerini sembolik fiyata veya Askıda Yemek ile rezerve edin.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Kurtarılmayı Bekleyen Taze Porsiyonlar',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._meals.map((meal) {
              final isFreeSolidarity = meal.discountedPrice == 0.0;
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
                            child: Text(meal.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isFreeSolidarity ? AppTheme.accentColor.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isFreeSolidarity ? 'ASKIDA YEMEK (Ücretsiz)' : '₺${meal.discountedPrice.toStringAsFixed(0)} (₺${meal.originalPrice.toStringAsFixed(0)})',
                              style: TextStyle(
                                color: isFreeSolidarity ? AppTheme.primaryColor : Colors.redAccent,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('${meal.cafeteriaName} • ${meal.pickupWindow}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          if (meal.isVegan)
                            Container(
                              margin: const EdgeInsets.only(right: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(6)),
                              child: const Text('🌱 Vegan', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          if (meal.isGlutenFree)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(6)),
                              child: const Text('🌾 Glutensiz', style: TextStyle(color: Colors.brown, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          const Spacer(),
                          Text('${meal.availablePortions} Porsiyon Kaldı', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _reserveMeal(meal),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isFreeSolidarity ? AppTheme.accentColor : AppTheme.primaryColor,
                          ),
                          child: Text(isFreeSolidarity ? 'Askıdan Rezerve Et (Ücretsiz)' : 'Porsiyonu Kurtar (₺${meal.discountedPrice.toStringAsFixed(0)})'),
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
