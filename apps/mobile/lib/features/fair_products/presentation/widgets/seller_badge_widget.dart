import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class SellerBadgeWidget extends StatelessWidget {
  final String sellerName;
  final double rating;
  final int totalReviews;
  final bool isVerifiedProducer;

  const SellerBadgeWidget({
    super.key,
    required this.sellerName,
    this.rating = 4.9,
    this.totalReviews = 48,
    this.isVerifiedProducer = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primaryColor,
            radius: 20,
            child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        sellerName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isVerifiedProducer) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.check_circle, color: AppTheme.primaryColor, size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    Text(
                      ' ($totalReviews Değerlendirme) • Doğrulanmış Üretici',
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
