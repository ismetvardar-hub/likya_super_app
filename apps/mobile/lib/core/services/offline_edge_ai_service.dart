class EdgeAIClassificationResult {
  final String label;
  final double confidencePct;
  final String category; // 'botanical' | 'hardware_defect' | 'handicraft'
  final String conservationOrRepairAdvice;
  final int inferenceTimeMs;

  EdgeAIClassificationResult({
    required this.label,
    required this.confidencePct,
    required this.category,
    required this.conservationOrRepairAdvice,
    required this.inferenceTimeMs,
  });
}

class OfflineEdgeAIService {
  static final OfflineEdgeAIService _instance = OfflineEdgeAIService._internal();
  factory OfflineEdgeAIService() => _instance;
  OfflineEdgeAIService._internal();

  Future<EdgeAIClassificationResult> classifyOnDevice(String imageTag) async {
    // Simüle edilmiş TFLite / ONNX cihaz içi sinir ağı sınıflandırması (İnternetsiz)
    await Future.delayed(const Duration(milliseconds: 65));

    final tag = imageTag.toLowerCase();
    if (tag.contains('zeytin') || tag.contains('bitki') || tag.contains('cam')) {
      return EdgeAIClassificationResult(
        label: 'Olea europaea (Toros Yabani Zeytini)',
        confidencePct: 98.4,
        category: 'botanical',
        conservationOrRepairAdvice: 'Likya endemik türü. Budama sonrası dallar kompost reaktörüne kazandırılabilir.',
        inferenceTimeMs: 42,
      );
    } else if (tag.contains('pil') || tag.contains('batarya') || tag.contains('devre')) {
      return EdgeAIClassificationResult(
        label: '18650 Li-Ion Hücre Paketi (Şişme Yok)',
        confidencePct: 96.1,
        category: 'hardware_defect',
        conservationOrRepairAdvice: 'Hücre voltajı 3.7V seviyesinde dengelenerek güneş enerjili bisiklet bataryasında yeniden kullanılabilir.',
        inferenceTimeMs: 38,
      );
    } else {
      return EdgeAIClassificationResult(
        label: 'Geleneksel Kök Boyalı Likya Kilimi',
        confidencePct: 99.2,
        category: 'handicraft',
        conservationOrRepairAdvice: '%100 doğal yün ve ceviz kabuğu boyası. Adil Masa tescilli kültür ürünü.',
        inferenceTimeMs: 35,
      );
    }
  }
}
