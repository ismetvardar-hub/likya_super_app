import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class CreateRepairRequestScreen extends StatefulWidget {
  const CreateRepairRequestScreen({super.key});

  @override
  State<CreateRepairRequestScreen> createState() => _CreateRepairRequestScreenState();
}

class _CreateRepairRequestScreenState extends State<CreateRepairRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _itemNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  String _selectedCategory = 'Elektronik';
  String _requestType = 'onarım'; // 'onarım' veya 'bağış'

  final categories = ['Elektronik', 'Mobilya', 'Giyim/Tekstil', 'Kitap/Eğitim', 'Diğer'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Onarım / Bağış Başvurusu'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Talep Türü Seçimi (Segmented Control)
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'onarım',
                    label: Text('Eşyamı Onar'),
                    icon: Icon(Icons.build),
                  ),
                  ButtonSegment(
                    value: 'bağış',
                    label: Text('Topluluğa Bağışla'),
                    icon: Icon(Icons.volunteer_activism),
                  ),
                ],
                selected: {_requestType},
                onSelectionChanged: (newSelection) {
                  setState(() => _requestType = newSelection.first);
                },
              ),
              const SizedBox(height: 24),

              TextFormField(
                controller: _itemNameController,
                decoration: const InputDecoration(
                  labelText: 'Ürün / Cihaz Adı',
                  hintText: 'Örn: Dell Laptop, Ahşap Sandalye vb.',
                  prefixIcon: Icon(Icons.devices),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Ürün adını giriniz' : null,
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Kategori',
                  prefixIcon: Icon(Icons.category),
                ),
                items: categories.map((cat) {
                  return DropdownMenuItem(value: cat, child: Text(cat));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedCategory = val);
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Teslim / Alım Konumu',
                  hintText: 'Örn: Kampüs ÖTM Binası / Öğrenci Yurdu 3. Blok',
                  prefixIcon: Icon(Icons.location_on),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Konum giriniz' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Arıza / Durum Detayı',
                  hintText: 'Cihazın neresi bozuk? Ya da ürünün genel kondisyonu nasıl?',
                ),
                validator: (val) => val == null || val.isEmpty ? 'Açıklama giriniz' : null,
              ),
              const SizedBox(height: 24),

              // Görsel Yükleme Simülatör Kartı
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.add_a_photo_outlined, color: AppTheme.primaryColor),
                    SizedBox(width: 10),
                    Text('Ürün Fotoğrafı Ekle (İsteğe Bağlı)', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              ElevatedButton.icon(
                onPressed: () {
                  if (_formKey.currentState?.validate() ?? false) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Talebiniz başarıyla oluşturuldu! ($_requestType takibinden izleyebilirsiniz)')),
                    );
                    context.pop();
                  }
                },
                icon: const Icon(Icons.send_rounded),
                label: const Text('Başvuruyu Gönder'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.secondaryColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
