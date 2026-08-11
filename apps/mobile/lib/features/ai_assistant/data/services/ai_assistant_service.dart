import 'package:likya_mobile/features/ai_assistant/domain/models/chat_message_model.dart';

class AIAssistantService {
  Future<ChatMessageModel> processQuery(String query) async {
    await Future.delayed(const Duration(milliseconds: 600));

    final normalized = query.toLowerCase();

    if (normalized.contains('onar') || normalized.contains('tamir') || normalized.contains('bozuk') || normalized.contains('laptop')) {
      return ChatMessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: 'Nezaketiniz için teşekkür ederim efendim. Bozuk cihazınızı Likya Onarım Atölyesi\'ne yönlendirebiliriz. İsterseniz hemen bir Onarım Başvurusu oluşturalım, uzman ekibimiz ücretsiz incelesin.',
        isUser: false,
        timestamp: DateTime.now(),
        suggestedActions: ['Onarım Talebi Oluştur', 'Atölye Konumunu Gör'],
      );
    } else if (normalized.contains('etkinlik') || normalized.contains('konser') || normalized.contains('bilet')) {
      return ChatMessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: 'Harika bir haber! 15 Ağustos akşamı Kampüs Amfi Tiyatro\'da "Likya Bahar Şenliği & Akustik Konser" düzenleniyor. Giriş tamamen ücretsiz, hemen QR biletinizi oluşturabilirsiniz.',
        isUser: false,
        timestamp: DateTime.now(),
        suggestedActions: ['Konser Biletini Al', 'Diğer Etkinlikleri Listele'],
      );
    } else if (normalized.contains('ürün') || normalized.contains('pazar') || normalized.contains('adil') || normalized.contains('zeytinyağı')) {
      return ChatMessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: 'Adil Masa pazarımızda yerel üreticilerimizden temin edilen taze Soğuk Sıkım Zeytinyağı ve el yapımı zanaat ürünleri mevcuttur. Dilerseniz takas usulüyle de edinebilirsiniz.',
        isUser: false,
        timestamp: DateTime.now(),
        suggestedActions: ['Adil Pazarı Aç', 'Takas Teklifi Ver'],
      );
    } else {
      return ChatMessageModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: 'Size yardımcı olmaktan mutluluk duyarım efendim. Adil Ticaret, Kampüs Etkinlikleri, Biletleme veya Eşya Onarımı konularında ne öğrenmek istersiniz?',
        isUser: false,
        timestamp: DateTime.now(),
        suggestedActions: ['Etkinlikleri Keşfet', 'Bozuk Eşya Onar', 'Adil Masa Ürünleri'],
      );
    }
  }
}
