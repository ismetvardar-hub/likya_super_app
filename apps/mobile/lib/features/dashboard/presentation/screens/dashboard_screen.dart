import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Özel Tasarlanmış Üst Başlık (SliverAppBar)
          SliverAppBar(
            expandedHeight: 140.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                ),
                padding: const EdgeInsets.only(left: 20, right: 20, top: 60, bottom: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Selam, Likyalı! 👋',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Sürdürülebilir Kampüs & Topluluk Akışı',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.white.withOpacity(0.85),
                              ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.account_circle, color: Colors.white, size: 36),
                      onPressed: () => context.push('/auth/login'),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // İçerik Listesi
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hızlı İşlem Butonları (Quick Actions)
                  _buildQuickActionGrid(context),
                  const SizedBox(height: 24),

                  // Topluluk Etki Banner'ı
                  _buildImpactBanner(context),
                  const SizedBox(height: 28),

                  // Öne Çıkan Etkinlikler Başlığı & Listesi
                  _buildSectionHeader(
                    context,
                    title: 'Yaklaşan Etkinlikler 🎟️',
                    onSeeAll: () => context.go('/events'),
                  ),
                  const SizedBox(height: 12),
                  _buildFeaturedEventsCarousel(context),
                  const SizedBox(height: 28),

                  // Adil Masa Vitrini
                  _buildSectionHeader(
                    context,
                    title: 'Adil Masa Öne Çıkanlar 🌾',
                    onSeeAll: () => context.go('/fair-products'),
                  ),
                  const SizedBox(height: 12),
                  _buildFairTradeSpotlightGrid(context),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildActionTile(
            context,
            icon: Icons.storefront_rounded,
            title: 'Ürün Ekle',
            color: AppTheme.primaryLight,
            onTap: () => context.push('/fair-products/add'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionTile(
            context,
            icon: Icons.build_circle_rounded,
            title: 'Onarım Talebi',
            color: AppTheme.secondaryColor,
            onTap: () => context.push('/repair-donations/create'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionTile(
            context,
            icon: Icons.qr_code_scanner_rounded,
            title: 'Biletlerim',
            color: AppTheme.accentColor,
            onTap: () => context.go('/tickets'),
          ),
        ),
      ],
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 30, color: color),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImpactBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.ecoGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.eco_rounded, color: Colors.white, size: 42),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Döngüsel Kampüs Etkisi ♻️',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Bu ay 142 eşya onarıldı, 385 adil ürün takas edildi!',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context, {
    required String title,
    required VoidCallback onSeeAll,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
        ),
        TextButton(
          onPressed: onSeeAll,
          child: const Text('Tümünü Gör →'),
        ),
      ],
    );
  }

  Widget _buildFeaturedEventsCarousel(BuildContext context) {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        itemBuilder: (context, index) {
          final titles = [
            'Likya Bahar Şenliği & Konser',
            'Sürdürülebilir Tarım Atölyesi',
            'Kodlama & Robotik Maratonu'
          ];
          final dates = ['15 Ağustos 2026', '20 Ağustos 2026', '25 Ağustos 2026'];

          return Container(
            width: 280,
            margin: const EdgeInsets.only(right: 14),
            child: Card(
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            dates[index],
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              titles[index],
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Row(
                              children: [
                                Icon(Icons.location_on_outlined, color: Colors.white70, size: 14),
                                SizedBox(width: 4),
                                Text(
                                  'Kampüs Ana Amfi',
                                  style: TextStyle(color: Colors.white70, fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFairTradeSpotlightGrid(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.8,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: 4,
      itemBuilder: (context, index) {
        final products = [
          {'name': 'Organik Zeytinyağı 1L', 'price': '₺180.00', 'tag': 'Yerel Üretim'},
          {'name': 'El Yapımı Seramik Kupa', 'price': '₺90.00', 'tag': 'Zanaat'},
          {'name': 'Kurutulmuş Likya İnciri', 'price': '₺65.00', 'tag': 'Organik'},
          {'name': 'Doğal İpek Şal', 'price': '₺240.00', 'tag': 'Takas Olabilir'},
        ];

        final product = products[index];

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  height: 90,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppTheme.backgroundColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Icon(Icons.shopping_bag_outlined, size: 40, color: AppTheme.primaryLight),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product['name']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product['tag']!,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product['price']!,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                        fontSize: 14,
                      ),
                    ),
                    const Icon(Icons.add_shopping_cart, size: 20, color: AppTheme.secondaryColor),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
