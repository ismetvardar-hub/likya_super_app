import 'package:flutter/material.dart';

class TryBeforeBuyScreen extends StatefulWidget {
  const TryBeforeBuyScreen({super.key});

  @override
  State<TryBeforeBuyScreen> createState() => _TryBeforeBuyScreenState();
}

class _TryBeforeBuyScreenState extends State<TryBeforeBuyScreen> {
  String _selectedCategory = 'Tümü';
  final List<Map<String, dynamic>> _vehicles = [
    {
      'id': 'SHOW-01',
      'name': 'Likya Nomad 4x4 Offroad Karavan',
      'manufacturer': 'Hunter Nature Karavan A.Ş.',
      'parcel': 'Parsel A-04 (Göl Kenarı)',
      'price': '₺1.450.000',
      'testNightPrice': '₺1.800 / Gece',
      'rating': 4.9,
      'features': [
        'Güneş Paneli 800W',
        'Lityum Akü 400Ah',
        'Dizel Isıtıcı',
        '4 Kişilik'
      ],
      'image':
          'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
      'isAvailable': true,
    },
    {
      'id': 'SHOW-02',
      'name': 'Olympos Panorama Tiny House (8.5m)',
      'manufacturer': 'Mooble House Endüstriyel',
      'parcel': 'Parsel B-08 (Sedir Koruluğu)',
      'price': '₺2.200.000',
      'testNightPrice': '₺2.400 / Gece',
      'rating': 5.0,
      'features': [
        'Termowood Cephe',
        'Asma Kat Yatak Odası',
        'Klima & Şömine',
        'Tam Mutfak'
      ],
      'image':
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
      'isAvailable': true,
    },
    {
      'id': 'SHOW-03',
      'name': 'Toros Compact Çekme Karavan (3.90m)',
      'manufacturer': 'Erba Karavan',
      'parcel': 'Parsel A-12 (Zeytinlik)',
      'price': '₺480.000',
      'testNightPrice': '₺1.200 / Gece',
      'rating': 4.8,
      'features': [
        '750 kg Altı O1 Belgeli',
        'B+E Ehliyet Gerekmez',
        'Monoblok Fiber Gövde'
      ],
      'image':
          'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
      'isAvailable': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Try Before Buy Deneyim Parkı',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white)),
            Text('Satın Almadan Önce 1-2 Gece Test Edin',
                style: TextStyle(fontSize: 11, color: Color(0xFF10B981))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined, color: Color(0xFF38BDF8)),
            onPressed: () {},
            tooltip: '3D Parsel Haritası',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst İnovasyon Kartı
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF065F46), Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4)),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.verified_user_rounded,
                      color: Colors.white, size: 40),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Sıfır Riskli Karavan Deneyimi',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15)),
                        SizedBox(height: 4),
                        Text(
                          'Test konaklaması yaptığınız aracı satın alırsanız, konaklama bedeliniz satış fiyatından %100 düşülür!',
                          style:
                              TextStyle(color: Color(0xFFD1FAE5), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Kategori Filtreleri
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children:
                    ['Tümü', 'Karavan', 'Tiny House', 'Glamping'].map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(cat),
                      selected: isSelected,
                      selectedColor: const Color(0xFF10B981),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: TextStyle(
                        color:
                            isSelected ? Colors.white : const Color(0xFF94A3B8),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      onSelected: (val) {
                        setState(() => _selectedCategory = cat);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Araç Listesi
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _vehicles.length,
              itemBuilder: (context, index) {
                final v = _vehicles[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Başlık & Parsel
                      ListTile(
                        title: Text(v['name'] as String,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)),
                        subtitle: Text('${v['manufacturer']} • ${v['parcel']}',
                            style: const TextStyle(
                                color: Color(0xFF94A3B8), fontSize: 12)),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: (v['isAvailable'] as bool)
                                ? const Color(0xFF065F46)
                                : const Color(0xFF7F1D1D),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            (v['isAvailable'] as bool) ? 'MÜSAİT' : 'DOLU',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),

                      // Özellik Etiketleri
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: (v['features'] as List<String>).map((f) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(f,
                                  style: const TextStyle(
                                      color: Color(0xFF38BDF8), fontSize: 11)),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Fiyat ve Rezervasyon Butonu
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: const BoxDecoration(
                          color: Color(0xFF0F172A),
                          borderRadius: BorderRadius.vertical(
                              bottom: Radius.circular(16)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Satış Fiyatı: ${v['price']}',
                                    style: const TextStyle(
                                        color: Color(0xFF94A3B8),
                                        fontSize: 11)),
                                const SizedBox(height: 2),
                                Text(v['testNightPrice'] as String,
                                    style: const TextStyle(
                                        color: Color(0xFF10B981),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16)),
                              ],
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: (v['isAvailable'] as bool)
                                  ? () {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(
                                              '${v['name']} için test konaklama rezervasyonu başlatıldı! 🎉'),
                                          backgroundColor:
                                              const Color(0xFF10B981),
                                        ),
                                      );
                                    }
                                  : null,
                              icon: const Icon(Icons.hotel_class_rounded,
                                  size: 18),
                              label: const Text('Test Konakla'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
