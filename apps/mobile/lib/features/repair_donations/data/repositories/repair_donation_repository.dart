import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/models/repair_donation_model.dart';
import '../../../../core/services/supabase_service.dart';

class RepairDonationRepository {
  final SupabaseClient _client = SupabaseService.client;

  Future<List<RepairDonationModel>> getDonorDonations(String donorId) async {
    final response = await _client
        .from('repair_donations')
        .select()
        .eq('donor_id', donorId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => RepairDonationModel.fromJson(json))
        .toList();
  }

  Future<RepairDonationModel> createRepairDonation(RepairDonationModel item) async {
    final response = await _client
        .from('repair_donations')
        .insert(item.toJson())
        .select()
        .single();

    return RepairDonationModel.fromJson(response);
  }
}
