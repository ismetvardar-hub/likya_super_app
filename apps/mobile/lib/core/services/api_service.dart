import 'dart:convert';
import 'package:http/http.dart' as http;

/// LİKYA API SERVICE - Python FastAPI Backend Bağlantısı
class ApiService {
  static const String baseUrl = 'http://localhost:8000';

  /// Kriz/geri bildirim gönder
  /// [rating] 1-5 arası puan, [comment] yorum, [userId] kullanıcı, [branchId] şube
  static Future<Map<String, dynamic>> sendFeedback({
    required String userId,
    required int rating,
    required String comment,
    required String branchId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/autonomous/feedback'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'rating': rating,
        'comment': comment,
        'branch_id': branchId,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Geri bildirim gönderilemedi: ${response.statusCode}');
  }

  /// Otonom olay tetikle
  static Future<Map<String, dynamic>> executeAutonomousEvent({
    required String source,
    required String userId,
    required String eventType,
    required String content,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/autonomous/execute'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'source': source,
        'user_id': userId,
        'event_type': eventType,
        'content': content,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Otonom olay tetiklenemedi: ${response.statusCode}');
  }
}
