import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/review_model.dart';

class ReviewListWidget extends StatelessWidget {
  const ReviewListWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleReviews = [
      SellerReviewModel(
        id: 'rev-1',
        reviewerName: 'Selin A.',
        rating: 5.0,
        comment: 'Zeytinyağı inanılmaz taze ve aromatik. Paketleme de tamamen geri dönüştürülebilir malzemeydi.',
        date: DateTime.now().subtract(const Duration(days: 2)),
      ),
      SellerReviewModel(
        id: 'rev-2',
        reviewerName: 'Burak K.',
        rating: 5.0,
        comment: 'El yapımı seramik kupa ile takas yaptık, çok nazik ve dürüst bir üretici. Teşekkürler!',
        date: DateTime.now().subtract(const Duration(days: 6)),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Topluluk Değerlendirmeleri (4.9 ★)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            TextButton(onPressed: () {}, child: const Text('Tümü')),
          ],
        ),
        const SizedBox(height: 8),

        ...sampleReviews.map((r) {
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(r.reviewerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.successColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('Doğrulanmış Alıcı', style: TextStyle(color: AppTheme.successColor, fontSize: 9, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      Row(
                        children: List.generate(5, (index) {
                          return const Icon(Icons.star, size: 14, color: Colors.amber);
                        }),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(r.comment, style: const TextStyle(fontSize: 12, color: AppTheme.textDark)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
