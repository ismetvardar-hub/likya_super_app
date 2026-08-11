import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/shared_book_model.dart';

class BookSharingScreen extends StatefulWidget {
  const BookSharingScreen({super.key});

  @override
  State<BookSharingScreen> createState() => _BookSharingScreenState();
}

class _BookSharingScreenState extends State<BookSharingScreen> {
  final List<SharedBookModel> _books = [
    SharedBookModel(
      id: 'bk-1',
      title: 'Döngüsel Ekonomi & Ekolojik Mühendislik',
      author: 'Prof. Dr. Selim Akın',
      courseCategory: 'Mühendislik & Ekoloji',
      condition: 'Mükemmel 📖',
      isAvailable: true,
      kioskLocation: 'Kütüphane Zemin Kat Paylaşım Dolabı',
    ),
    SharedBookModel(
      id: 'bk-2',
      title: 'Likya Uygarlığı ve Akdeniz Ticaret Yolları',
      author: 'Doç. Dr. Emre Çetin',
      courseCategory: 'Tarih & Kültür',
      condition: 'İyi (Renkli Altı Çizili)',
      isAvailable: true,
      kioskLocation: 'Edebiyat Fakültesi Giriş Standı',
    ),
    SharedBookModel(
      id: 'bk-3',
      title: 'Python ile Otonom Sistemler ve Robotik',
      author: 'Murat Yurtsever',
      courseCategory: 'Yazılım & Yapay Zeka',
      condition: 'Mükemmel 📖',
      isAvailable: true,
      kioskLocation: 'Maker Lab Kitaplığı',
    ),
  ];

  void _borrowBook(SharedBookModel book) {
    AudioFeedbackService().playCoinEarnChime();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.auto_stories_rounded, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text('Kitap Ödünç Alındı! 📚'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(book.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Text('Yazar: ${book.author}'),
              Text('Konum: ${book.kioskLocation}'),
              const Divider(height: 20),
              const Text(
                'Kitabı okuduktan sonra herhangi bir kampüs paylaşım dolabına bırakabilirsiniz. Sıfır kağıt israfı! 🌿',
                style: TextStyle(fontSize: 12, color: AppTheme.successColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Anladım'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Akademik Kitap Paylaşımı 📚'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2B6CB0), Color(0xFF0F4C81)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: AppTheme.primaryColor.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Öğrenciden Öğrenciye Ücretsiz', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.local_library_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text('4,850 Kitap Dolaşımda 📖', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(
                    'Ders kitaplarını ve romanları satın almadan akıllı dolaplardan ücretsiz ödünç alın ve paylaşın.',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Rafta Bulunan Kitaplar',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._books.map((b) {
              return Card(
                margin: const EdgeInsets.only(bottom: 14),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(b.courseCategory, style: const TextStyle(color: AppTheme.primaryColor, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          Text(b.condition, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(b.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text('Yazar: ${b.author}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      const SizedBox(height: 6),
                      Text(b.kioskLocation, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _borrowBook(b),
                          child: const Text('Kitap Dolabından Ödünç Al (NFC / QR)'),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
