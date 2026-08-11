import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// ============================================================================
/// LİKYA KİRACI (TENANT) PANELİ
/// Faz 2: Kiracıların günlük ciro, stok durumu ve sadakat puanlarını görebildiği ekran
/// ============================================================================

class TenantDashboardScreen extends StatefulWidget {
  const TenantDashboardScreen({super.key});

  @override
  State<TenantDashboardScreen> createState() => _TenantDashboardScreenState();
}

class _TenantDashboardScreenState extends State<TenantDashboardScreen> {
  // Örnek veriler
  final List<Map<String, dynamic>> _sales = [
    {'id': 'SAT-001', 'urun': 'Sedir Çayı', 'tutar': 45.0, 'saat': '12:30', 'durum': 'Tamamlandı'},
    {'id': 'SAT-002', 'urun': 'Organik Salata', 'tutar': 120.0, 'saat': '12:45', 'durum': 'Tamamlandı'},
    {'id': 'SAT-003', 'urun': 'Karavan Kiralama', 'tutar': 1200.0, 'saat': '13:00', 'durum': 'Beklemede'},
    {'id': 'SAT-004', 'urun': 'E-Bike Kiralama', 'tutar': 250.0, 'saat': '13:15', 'durum': 'Tamamlandı'},
  ];

  final List<Map<String, dynamic>> _stock = [
    {'urun': 'Sedir Çayı', 'stok': 45, 'kritik': false},
    {'urun': 'Organik Sebze', 'stok': 12, 'kritik': true},
    {'urun': 'Karavan Yedek Parça', 'stok': 8, 'kritik': true},
    {'urun': 'E-Bike Batarya', 'stok': 20, 'kritik': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('🔵 Kiracı Paneli'),
        backgroundColor: AppTheme.darkBg,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Günlük Ciro Kartı
            _buildCiroKarti(),
            const SizedBox(height: 16),

            // Stok Durumu
            _buildStokBolumu(),
            const SizedBox(height: 16),

            // Son Satışlar
            _buildSatislarBolumu(),
          ],
        ),
      ),
    );
  }

  Widget _buildCiroKarti() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0f4c81), Color(0xFF00f2fe)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00f2fe).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'GÜNLÜK CİRO',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '₺8,400',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildCiroMetrik('Kampüs Payı', '%10 (₺840)', Colors.white),
              const SizedBox(width: 16),
              _buildCiroMetrik('Net Gelir', '₺7,560', Colors.white),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCiroMetrik(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildStokBolumu() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📦 STOK DURUMU',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._stock.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    item['urun'],
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ),
                Text(
                  '${item['stok']} adet',
                  style: TextStyle(
                    color: item['kritik'] ? const Color(0xFFe07a5f) : const Color(0xFF48bb78),
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (item['kritik'])
                  const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Icon(Icons.warning, color: Color(0xFFe07a5f), size: 16),
                  ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildSatislarBolumu() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🛒 SON SATIŞLAR',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._sales.map((sale) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sale['urun'],
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${sale['id']} • ${sale['saat']}',
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Text(
                  '₺${sale['tutar']}',
                  style: const TextStyle(
                    color: Color(0xFF48bb78),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: sale['durum'] == 'Tamamlandı'
                        ? const Color(0xFF48bb78).withValues(alpha: 0.2)
                        : const Color(0xFFecc94b).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    sale['durum'],
                    style: TextStyle(
                      color: sale['durum'] == 'Tamamlandı'
                          ? const Color(0xFF48bb78)
                          : const Color(0xFFecc94b),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
