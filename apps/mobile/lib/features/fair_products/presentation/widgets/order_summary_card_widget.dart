import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class OrderSummaryCardWidget extends StatefulWidget {
  final double subtotal;
  final double ecoDiscount;
  final VoidCallback onCheckout;

  const OrderSummaryCardWidget({
    super.key,
    this.subtotal = 450.00,
    this.ecoDiscount = 45.00,
    required this.onCheckout,
  });

  @override
  State<OrderSummaryCardWidget> createState() => _OrderSummaryCardWidgetState();
}

class _OrderSummaryCardWidgetState extends State<OrderSummaryCardWidget> {
  bool _ecoPackaging = true;
  bool _useEcoPoints = false;

  @override
  Widget build(BuildContext context) {
    final double discount = _useEcoPoints ? widget.ecoDiscount : 0.0;
    final double total = widget.subtotal - discount;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: AppTheme.cardColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shopping_bag_outlined,
                  color: AppTheme.primaryColor, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Sipariş Özeti & Ödeme',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textDark),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('Adil Masa 🌾',
                    style: TextStyle(
                        fontSize: 10,
                        color: AppTheme.accentColor,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(height: 24),

          // Ara Toplam
          _buildRow('Sepet Tutarı', '₺${widget.subtotal.toStringAsFixed(2)}'),
          const SizedBox(height: 8),

          // Ekolojik Puan İndirimi
          if (_useEcoPoints) ...[
            _buildRow('Eko-Puan İndirimi (%10)',
                '-₺${widget.ecoDiscount.toStringAsFixed(2)}',
                isDiscount: true),
            const SizedBox(height: 8),
          ],

          // Çevre Dostu Paketleme Seçeneği
          InkWell(
            onTap: () => setState(() => _ecoPackaging = !_ecoPackaging),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(
                    _ecoPackaging
                        ? Icons.check_box_rounded
                        : Icons.check_box_outline_blank_rounded,
                    color: _ecoPackaging
                        ? AppTheme.accentColor
                        : AppTheme.textMuted,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      '%100 Kompostlanabilir Eko-Paketleme',
                      style: TextStyle(
                          fontSize: 12, color: AppTheme.textMuted),
                    ),
                  ),
                  const Text('Ücretsiz',
                      style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.successColor,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),

          // Eko-Puan Kullanımı
          InkWell(
            onTap: () => setState(() => _useEcoPoints = !_useEcoPoints),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(
                    _useEcoPoints
                        ? Icons.check_box_rounded
                        : Icons.check_box_outline_blank_rounded,
                    color: _useEcoPoints
                        ? AppTheme.primaryColor
                        : AppTheme.textMuted,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Likya Eko-Puanlarımı Kullan (250 Puan)',
                      style: TextStyle(
                          fontSize: 12, color: AppTheme.textMuted),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: 24),

          // Toplam Tutar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Ödenecek Tutar',
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textDark)),
              Text(
                '₺${total.toStringAsFixed(2)}',
                style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Ödeme Butonu
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: widget.onCheckout,
              icon: const Icon(Icons.lock_outline_rounded, size: 18),
              label: const Text('Likya Pay ile Güvenli Öde',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String title, String value, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title,
            style: TextStyle(
                fontSize: 13,
                color: isDiscount
                    ? AppTheme.successColor
                    : AppTheme.textMuted)),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDiscount ? AppTheme.successColor : AppTheme.textDark,
          ),
        ),
      ],
    );
  }
}
