import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  String selectedCategory = 'Tümü';

  final categories = ['Tümü', 'Gıda & Organik', 'El Sanatları', 'Tekstil', 'Takas/Bağış'];

  final sampleProducts = [
    {
      'id': 'prod-1',
      'name': 'Sızma Zeytinyağı (1 L)',
      'seller': 'Antalya Yerel Üretici Kooperatifi',
      'price': 180.00,
      'category': 'Gıda & Organik',
      'stock': 15,
      'image': Icons.nature_people_rounded,
    },
    {
      'id': 'prod-2',
      'name': 'El Yapımı Çömlek Vazo',
      'seller': 'Likya Zanaat Atölyesi',
      'price': 120.00,
      'category': 'El Sanatları',
      'stock': 4,
      'image': Icons.palette_rounded,
    },
    {
      'id': 'prod-3',
      'name': 'Doğal Pamuk Dokuma Şal',
      'seller': 'Köy Kadınları Derneği',
      'price': 150.00,
      'category': 'Tekstil',
      'stock': 8,
      'image': Icons.dry_cleaning_rounded,
    },
    {
      'id': 'prod-4',
      'name': 'Organik Dağ Balı (500g)',
      'seller': 'Toros Arıcılık',
      'price': 220.00,
      'category': 'Gıda & Organik',
      'stock': 20,
      'image': Icons.sanitizer_rounded,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredProducts = selectedCategory == 'Tümü'
        ? sampleProducts
        : sampleProducts.where((p) => p['category'] == selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Adil Masa Pazar Yeri'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_box_outlined),
            onPressed: () => context.push('/fair-products/add'),
            tooltip: 'Yeni İlan Ekle',
          ),
        ],
      ),
      body: Column(
        children: [
          // Arama ve Filtre Çubuğu
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Adil ürün veya üretici ara...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.filter_list),
                  onPressed: () {},
                ),
              ),
            ),
          ),

          // Kategori Çipleri (Horizontally Scrollable)
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                final isSelected = selectedCategory == category;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => selectedCategory = category);
                    },
                    selectedColor: AppTheme.primaryColor.withOpacity(0.15),
                    checkmarkColor: AppTheme.primaryColor,
                    labelStyle: TextStyle(
                      color: isSelected ? AppTheme.primaryColor : AppTheme.textDark,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // Ürün Izgarası (Grid)
          Expanded(
            child: filteredProducts.isEmpty
                ? const Center(child: Text('Bu kategoride ürün bulunamadı.'))
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.72,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 14,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final item = filteredProducts[index];
                      return InkWell(
                        onTap: () => context.push('/fair-products/${item['id']}'),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  height: 110,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: AppTheme.backgroundColor,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Icon(
                                    item['image'] as IconData,
                                    size: 48,
                                    color: AppTheme.primaryLight,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  item['name'] as String,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item['seller'] as String,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.textMuted,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const Spacer(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '₺${(item['price'] as double).toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryColor,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryColor,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(
                                        Icons.add_shopping_cart,
                                        size: 16,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/fair-products/add'),
        backgroundColor: AppTheme.secondaryColor,
        icon: const Icon(Icons.add),
        label: const Text('İlan Ekle'),
      ),
    );
  }
}
