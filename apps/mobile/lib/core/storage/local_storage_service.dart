import 'dart:convert';
import '../../features/tickets/domain/models/ticket_model.dart';
import '../../features/events/domain/models/event_model.dart';

class LocalStorageService {
  static final LocalStorageService _instance = LocalStorageService._internal();
  factory LocalStorageService() => _instance;
  LocalStorageService._internal();

  // Bellek içi ve kalıcı simülasyon deposu
  final Map<String, String> _cache = {};

  // 1. Biletleri Çevrimdışı Önbelleğe Al
  Future<void> cacheTickets(String userId, List<TicketModel> tickets) async {
    final data = tickets.map((t) => t.toJson()).toList();
    _cache['tickets_$userId'] = jsonEncode(data);
  }

  // 2. Çevrimdışı Biletleri Getir
  Future<List<TicketModel>> getCachedTickets(String userId) async {
    final jsonStr = _cache['tickets_$userId'];
    if (jsonStr == null) return [];
    try {
      final List list = jsonDecode(jsonStr);
      return list.map((item) => TicketModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  // 3. Etkinlikleri Önbelleğe Al
  Future<void> cacheEvents(List<EventModel> events) async {
    final data = events.map((e) => e.toJson()).toList();
    _cache['cached_events'] = jsonEncode(data);
  }

  // 4. Çevrimdışı Etkinlikleri Getir
  Future<List<EventModel>> getCachedEvents() async {
    final jsonStr = _cache['cached_events'];
    if (jsonStr == null) return [];
    try {
      final List list = jsonDecode(jsonStr);
      return list.map((item) => EventModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  // 5. Dil Tercihini Sakla
  Future<void> setLanguage(String langCode) async {
    _cache['app_language'] = langCode;
  }

  Future<String> getLanguage() async {
    return _cache['app_language'] ?? 'tr';
  }
}
