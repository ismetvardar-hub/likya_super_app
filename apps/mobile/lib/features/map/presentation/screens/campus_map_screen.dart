import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/location_pin_model.dart';

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  String _selectedFilter = 'Tümü';
  LocationPinModel? _selectedPin;

  final List<LocationPinModel> _pins = [
    LocationPinModel(
      id: 'pin-1',
      title: 'Kampüs Açık Hava Amfi Tiyatro',
      category: 'event',
      latitude: 36.8841,
      longitude: 30.7056,
      address: 'Merkez Kampüs, Etkinlik Meydanı',
      description: 'Likya Bahar Şenliği & Akustik Konser Ana Sahnesi',
    ),
    LocationPinModel(
      id: 'pin-2',
      title: 'Döngüsel Onarım & Maker Atölyesi',
      category: 'repair',
      latitude: 36.8860,
      longitude: 30.7080,
      address: 'Mühendislik Binası Zemin Kat',
      description: 'Elektronik ve ahşap eşya ücretsiz onarım noktası',
    ),
    LocationPinModel(
      id: 'pin-3',
      title: 'Adil Masa Teslimat & Takas Noktası',
      category: 'fair_pickup',
      latitude: 36.8830,
      longitude: 30.7020,
      address: 'Öğrenci Yaşam Merkezi Girişi',
      description: 'Yerel üreticilerden gelen organik ürünleri teslim alma standı',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filteredPins = _selectedFilter == 'Tümü'
        ? _pins
        : _pins.where((p) {
            if (_selectedFilter == 'Etkinlikler') return p.category == 'event';
            if (_selectedFilter == 'Onarım Atölyeleri') return p.category == 'repair';
            if (_selectedFilter == 'Adil Teslim') return p.category == 'fair_pickup';
            return true;
          }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kampüs & Likya Haritası'),
      ),
      body: Stack(
        children: [
          // İnteraktif Harita Canvas Simülasyonu
          Container(
            color: const Color(0xFFE5E9EC),
            child: CustomPaint(
              size: Size.infinite,
              painter: _MapGridPainter(),
            ),
          ),

          // Harita Pinleri
          ...filteredPins.map((pin) {
            final isSelected = _selectedPin?.id == pin.id;
            Color pinColor = AppTheme.primaryColor;
            IconData pinIcon = Icons.place;

            if (pin.category == 'event') {
              pinColor = AppTheme.secondaryColor;
              pinIcon = Icons.event;
            } else if (pin.category == 'repair') {
              pinColor = AppTheme.accentColor;
              pinIcon = Icons.handyman;
            } else if (pin.category == 'fair_pickup') {
              pinColor = AppTheme.primaryLight;
              pinIcon = Icons.storefront;
            }

            // Simüle edilmiş koordinat ofseti
            final offsetX = (pin.longitude - 30.70) * 8000 + 100;
            final offsetY = (36.89 - pin.latitude) * 8000 + 150;

            return Positioned(
              left: offsetX,
              top: offsetY,
              child: GestureDetector(
                onTap: () => setState(() => _selectedPin = pin),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.white : pinColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: pinColor, width: isSelected ? 3 : 1),
                        boxShadow: [
                          BoxShadow(
                            color: pinColor.withOpacity(0.4),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        pinIcon,
                        color: isSelected ? pinColor : Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                      ),
                      child: Text(
                        pin.title,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

          // Üst Kategori Filtreleri
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['Tümü', 'Etkinlikler', 'Onarım Atölyeleri', 'Adil Teslim'].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: FilterChip(
                      label: Text(filter),
                      selected: isSelected,
                      onSelected: (val) => setState(() => _selectedFilter = filter),
                      selectedColor: AppTheme.primaryColor,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.textDark,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      backgroundColor: Colors.white,
                      elevation: 2,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Alt Konum Detay Kartı (Seçildiğinde açılır)
          if (_selectedPin != null)
            Positioned(
              bottom: 24,
              left: 16,
              right: 16,
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              _selectedPin!.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 20),
                            onPressed: () => setState(() => _selectedPin = null),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppTheme.secondaryColor),
                          const SizedBox(width: 4),
                          Text(_selectedPin!.address, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(_selectedPin!.description, style: const TextStyle(fontSize: 13)),
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('${_selectedPin!.title} için rota başlatıldı 🗺️')),
                            );
                          },
                          icon: const Icon(Icons.directions),
                          label: const Text('Yol Tarifi Al / Rotala'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 1.0;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
