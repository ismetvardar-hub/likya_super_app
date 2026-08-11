import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/models/ticket_model.dart';
import '../../../../core/services/supabase_service.dart';

class TicketRepository {
  final SupabaseClient _client = SupabaseService.client;

  Future<List<TicketModel>> getUserTickets(String userId) async {
    final response = await _client
        .from('tickets')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => TicketModel.fromJson(json))
        .toList();
  }

  // Supabase Realtime Bilet Akış Aboneliği
  Stream<List<TicketModel>> streamUserTickets(String userId) {
    return _client
        .from('tickets')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => TicketModel.fromJson(json)).toList());
  }

  Future<TicketModel> purchaseTicket({
    required String eventId,
    required String userId,
    required String qrCode,
  }) async {
    final response = await _client
        .from('tickets')
        .insert({
          'event_id': eventId,
          'user_id': userId,
          'qr_code': qrCode,
          'status': 'valid',
        })
        .select()
        .single();

    return TicketModel.fromJson(response);
  }
}
