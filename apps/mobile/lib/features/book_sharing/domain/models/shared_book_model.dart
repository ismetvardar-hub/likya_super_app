class SharedBookModel {
  final String id;
  final String title;
  final String author;
  final String courseCategory;
  final String condition; // 'Mükemmel' | 'İyi' | 'Notlu & Faydalı'
  final bool isAvailable;
  final String kioskLocation;

  SharedBookModel({
    required this.id,
    required this.title,
    required this.author,
    required this.courseCategory,
    required this.condition,
    required this.isAvailable,
    required this.kioskLocation,
  });
}
