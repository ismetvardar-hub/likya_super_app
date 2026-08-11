class ImageDiagnosisResult {
  final String detectedCategory;
  final int conditionRating; // 1 (kötü) - 5 (mükemmel)
  final String repairDifficulty; // 'Kolay' | 'Orta' | 'İleri Seviye'
  final int estimatedRepairHours;
  final List<String> detectedDefects;
  final bool isClearQuality;
  final String aiRecommendation;

  ImageDiagnosisResult({
    required this.detectedCategory,
    required this.conditionRating,
    required this.repairDifficulty,
    required this.estimatedRepairHours,
    required this.detectedDefects,
    required this.isClearQuality,
    required this.aiRecommendation,
  });
}

class AIVisionService {
  static final AIVisionService _instance = AIVisionService._internal();
  factory AIVisionService() => _instance;
  AIVisionService._internal();

  Future<ImageDiagnosisResult> analyzeItemImage(String fileName) async {
    // Simüle edilmiş AI görüntü analizi
    await Future.delayed(const Duration(milliseconds: 750));

    final lower = fileName.toLowerCase();

    if (lower.contains('laptop') || lower.contains('pc') || lower.contains('bilgisayar')) {
      return ImageDiagnosisResult(
        detectedCategory: 'Elektronik / Taşınabilir Bilgisayar',
        conditionRating: 3,
        repairDifficulty: 'Orta',
        estimatedRepairHours: 2,
        detectedDefects: ['Klavye tuş aşınması', 'Batarya hücresi zayıflığı'],
        isClearQuality: true,
        aiRecommendation: 'Cihaz anakartı sağlam görünüyor, atölyemizde batarya değişimiyle %100 kurtarılabilir.',
      );
    } else if (lower.contains('masa') || lower.contains('sandalye') || lower.contains('ahsap')) {
      return ImageDiagnosisResult(
        detectedCategory: 'Mobilya / Ahşap Eşya',
        conditionRating: 4,
        repairDifficulty: 'Kolay',
        estimatedRepairHours: 1,
        detectedDefects: ['Yüzey vernik çizikleri', 'Sol ayak vidası gevşek'],
        isClearQuality: true,
        aiRecommendation: 'Zımparalama ve doğal yağlama ile kampüs öğrenci kulüpleri için mükemmel hale getirilebilir.',
      );
    } else {
      return ImageDiagnosisResult(
        detectedCategory: 'Adil Ticaret & Genel Ürün',
        conditionRating: 5,
        repairDifficulty: 'Gerekmiyor',
        estimatedRepairHours: 0,
        detectedDefects: [],
        isClearQuality: true,
        aiRecommendation: 'Fotoğraf kalitesi yüksek, ürün Adil Masa katalog standartlarına uygundur.',
      );
    }
  }
}
