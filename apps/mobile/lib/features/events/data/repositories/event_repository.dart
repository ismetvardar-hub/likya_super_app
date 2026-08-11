import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/models/event_model.dart';
import '../../../../core/services/supabase_service.dart';

class EventRepository {
  final SupabaseClient _client = SupabaseService.client;

  Future<List<EventModel>> getPublishedEvents() async {
    final response = await _client
        .from('events')
        .select()
        .eq('status', 'published')
        .order('start_time', ascending: true);

    return (response as List)
        .map((json) => EventModel.fromJson(json))
        .toList();
  }

  Future<EventModel> createEvent(EventModel event) async {
    final response = await _client
        .from('events')
        .insert(event.toJson())
        .select()
        .single();

    return EventModel.fromJson(response);
  }
}
