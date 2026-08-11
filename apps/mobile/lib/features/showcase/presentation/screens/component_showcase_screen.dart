import 'package:flutter/material.dart';
import 'package:likya_mobile/core/theme/app_theme.dart';
import 'package:likya_mobile/features/fair_products/presentation/widgets/seller_badge_widget.dart';
import 'package:likya_mobile/features/fair_products/presentation/widgets/review_list_widget.dart';
import 'package:likya_mobile/features/weather/presentation/widgets/campus_weather_widget.dart';

class ComponentShowcaseScreen extends StatelessWidget {
  const ComponentShowcaseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bileşen & Tasarım Galerisi 🎨'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Likya Renk Paleti & Tokenları', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildColorSwatch('Derin Mavi', AppTheme.primaryColor),
                _buildColorSwatch('Terrakotta', AppTheme.secondaryColor),
                _buildColorSwatch('Adaçayı', AppTheme.accentColor),
                _buildColorSwatch('Başarı', AppTheme.successColor),
                _buildColorSwatch('Uyarı', AppTheme.warningColor),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Hava Durumu & Parkur Bileşeni', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            CampusWeatherWidget(),
            const SizedBox(height: 24),
            const Text('Doğrulanmış Üretici Rozeti', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            SellerBadgeWidget(
              sellerName: 'Antalya Yerel Üretici Kooperatifi 🌾',
              rating: 4.9,
              totalReviews: 64,
              isVerifiedProducer: true,
            ),
            const SizedBox(height: 24),
            const ReviewListWidget(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildColorSwatch(String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Container(
            height: 40,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 10), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
