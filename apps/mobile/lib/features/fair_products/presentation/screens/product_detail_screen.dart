import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class ProductDetailScreen extends StatelessWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ürün Detayı'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ürün Görsel Alanı
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: const Center(
                child: Icon(Icons.nature_people_rounded, size: 80, color: AppTheme.primaryLight),
              ),
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Chip(
                  label: const Text('Gıda & Organik'),
                  backgroundColor: AppTheme.accentColor.withValues(alpha: 0.2),
                ),
                const Text(
                  'Stokta Var (15 Adet)',
                  style: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Text(
              'Soğuk Sıkım Sızma Zeytinyağı (1 L)',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),

            const Text(
              'Satıcı: Antalya Yerel Üretici Kooperatifi 🌾',
              style: TextStyle(fontSize: 15, color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),

            const Text(
              'Açıklama',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 6),
            const Text(
              'Toros dağlarının eteklerinde kimyasal gübre ve tarım ilacı kullanılmadan yetiştirilen zeytinlerden geleneksel soğuk sıkım yöntemiyle elde edilmiştir. Tamamen adil ticaret ve sürdürülebilir tarım standartlarına uygundur.',
              style: TextStyle(color: AppTheme.textDark, height: 1.5),
            ),
            const SizedBox(height: 32),

            Row(
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Fiyat', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                    Text(
                      '₺180.00',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Sipariş/Takas talebi üreticiye iletildi!')),
                      );
                    },
                    icon: const Icon(Icons.handshake_rounded),
                    label: const Text('Satın Al / Takas İste'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: AppTheme.secondaryColor,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
